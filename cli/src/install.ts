// `armory install <name>` — fetch a harness component and install it into the
// coding harness the user is in (Claude Code, Cursor, Codex, OpenCode, Gemini).
// This is the package-manager-for-agent-harnesses core: one handler per
// component type, routed through the per-CLI path map in targets.ts.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  loadCatalog,
  rankComponents,
  readComponentBody,
  extractInstallSnippet,
  type Component,
} from "./catalog.js";
import {
  LAYOUTS,
  detectCli,
  resolveMcpPath,
  mergeMcpServer,
  isCli,
  type Cli,
  type DirSpec,
} from "./targets.js";
import {
  parseGitHubUrl,
  fetchFile,
  listDir,
  fetchNpmName,
  parseRunCommand,
  DOWNLOADING,
  packageOf,
  checkPackage,
  plainRun,
  type RepoRef,
} from "./fetch.js";

export interface InstallOptions {
  cli?: string;
  to?: string;
  force: boolean;
  dryRun: boolean;
}

export interface InstallStep {
  action: "wrote-file" | "merged-mcp" | "skipped" | "print";
  detail: string;
}

export interface InstallReport {
  component: Component;
  cli: Cli;
  root: string;
  fuzzy: boolean;
  steps: InstallStep[];
  followUp: string[];
}

// Resolve the component: exact name match first, then a single fuzzy fallback
// (top BM25 hit). Returns the component plus whether it was a fuzzy resolution.
export function resolveComponent(name: string): { component: Component; fuzzy: boolean } | null {
  const components = loadCatalog().components;
  const exact = components.find((e) => e.name === name.trim());
  if (exact) return { component: exact, fuzzy: false };
  const ranked = rankComponents(components, name);
  return ranked.length > 0 ? { component: ranked[0].component, fuzzy: true } : null;
}

// Pick the target CLI: explicit --cli wins, else auto-detect from the root,
// else default to claude.
function chooseCli(root: string, requested?: string): Cli {
  if (requested) {
    if (!isCli(requested)) {
      throw new Error(`unknown --cli "${requested}" (expected claude|cursor|codex|opencode|gemini).`);
    }
    return requested;
  }
  return detectCli(root) ?? "claude";
}

// Write a single fetched file into a typed component dir, honouring force.
function writeComponentFile(
  root: string,
  spec: DirSpec,
  fileName: string,
  content: string,
  force: boolean,
  dryRun: boolean,
): InstallStep {
  const dir = join(root, spec.dir);
  const dest = join(dir, fileName);
  if (existsSync(dest) && !force) {
    return { action: "skipped", detail: `${dest} (exists — use --force to overwrite)` };
  }
  if (!dryRun) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(dest, content, "utf8");
  }
  return { action: "wrote-file", detail: dest };
}

// --- per-type handlers ------------------------------------------------------

// Nothing to install: say so, why, and where to set it up instead (CP143). The report then reads
// "Not installed" and the command exits non-zero, rather than claiming an install that did not happen.
function notInstalled(report: InstallReport, why: string): void {
  report.steps.push({
    action: "print",
    detail: `Not installed: ${report.component.name} ${why}. Set it up from the source instead:\n${report.component.source_url}`,
  });
}

// A row that points at a whole repository can name the file or folder to install in its note: a link
// into the same repository in its "How to install" section.
function namedArtifact(body: string, ref: RepoRef): RepoRef | null {
  const re = /https:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/(blob|tree)\/([^/\s]+)\/([^\s)`'"]+)/gi;
  for (const m of extractInstallSnippet(body).matchAll(re)) {
    if (m[1].toLowerCase() !== ref.owner.toLowerCase() || m[2].toLowerCase() !== ref.repo.toLowerCase()) continue;
    return { ...ref, ref: m[4], path: m[5].replace(/[.,;:]+$/, ""), isFile: m[3].toLowerCase() === "blob" };
  }
  return null;
}

// MCP: derive a run-command (body snippet → npm package.json) and merge a
// server entry into the target CLI's MCP config.
function installMcp(report: InstallReport, body: string, ref: RepoRef, opts: InstallOptions): void {
  const layout = LAYOUTS[report.cli];
  const snippet = extractInstallSnippet(body);
  // The migrated MCP bodies often embed `Install: npx -y <name>` inline in the
  // description, so scan the whole body, not just the install section.
  let run = parseRunCommand(snippet) ?? parseRunCommand(body);
  if (!run) {
    const npm = fetchNpmName(ref);
    if (npm) run = { command: "npx", args: ["-y", npm] };
  }
  if (!run) {
    notInstalled(report, "names no command to start it, and its repository names no npm package");
    return;
  }
  // A command that downloads a package by name is written only when the registry says the package
  // comes from this component's own repository (fetch.ts checkPackage). Any other command (node,
  // python, uv run) runs files from a clone of the repository, so a config naming it would not start.
  if (!DOWNLOADING.has(run.command)) {
    notInstalled(report, `starts with \`${run.command} ${run.args.join(" ")}\`, which runs files from a clone of its repository`);
    return;
  }
  const pkg = packageOf(run);
  const verdict = pkg ? checkPackage(pkg, `${ref.owner}/${ref.repo}`) : { ok: false, why: "the command names no package" };
  if (!pkg || !verdict.ok) {
    notInstalled(
      report,
      `starts with \`${run.command} ${run.args.join(" ")}\`, which downloads ${pkg ? pkg.name : "a package"} from a public registry, and ${verdict.why}, not ${ref.owner}/${ref.repo}`,
    );
    return;
  }
  run = plainRun(run, pkg);

  const file = resolveMcpPath(report.root, layout.mcp);
  const result = mergeMcpServer(
    file,
    layout.mcp,
    report.component.name,
    { command: run.command, args: run.args },
    opts.force,
    opts.dryRun,
  );
  if (result.alreadyPresent) {
    report.steps.push({
      action: "skipped",
      detail: `${report.component.name} already in ${file} (use --force to overwrite)`,
    });
  } else {
    report.steps.push({
      action: "merged-mcp",
      detail: `${report.component.name} → ${file} (${run.command} ${run.args.join(" ")})${result.created ? " [created]" : ""}`,
    });
    report.followUp.push(`Restart ${report.cli === "claude" ? "Claude Code" : report.cli} to load the MCP server.`);
  }
}

// Skill: skills are directories (SKILL.md + siblings). Fetch the dir if the
// source points at one, else fetch the single SKILL.md and place it under
// <skillsDir>/<name>/SKILL.md.
function installSkill(report: InstallReport, ref: RepoRef, opts: InstallOptions): void {
  const spec = report.cli && LAYOUTS[report.cli].skills;
  if (!spec) {
    report.steps.push({ action: "print", detail: `${report.cli} has no skills directory.` });
    return;
  }
  const skillDir = `${spec.dir}/${report.component.name}`;
  // Determine the source directory: a blob URL's parent, a tree URL's path, or
  // the repo root.
  const sourceDir = ref.isFile ? ref.path.replace(/\/[^/]+$/, "") : ref.path;
  const entries = sourceDir ? listDir(ref, sourceDir) : [];

  if (entries.length > 0) {
    let wrote = 0;
    for (const entry of entries.filter((e) => e.type === "file")) {
      const content = fetchFile(ref, entry.path);
      const step = writeComponentFile(report.root, { dir: skillDir, ext: "" }, entry.name, content, opts.force, opts.dryRun);
      report.steps.push(step);
      if (step.action === "wrote-file") wrote += 1;
    }
    if (wrote === 0 && entries.length > 0) return;
    return;
  }

  // No dir listing — fetch a single SKILL.md.
  const skillFile = ref.isFile ? ref.path : `${ref.path ? `${ref.path}/` : ""}SKILL.md`;
  let content: string;
  try {
    content = fetchFile(ref, skillFile);
  } catch {
    notInstalled(report, `has no ${skillFile} in ${ref.owner}/${ref.repo}; the repository is not one skill Armory can place`);
    return;
  }
  report.steps.push(
    writeComponentFile(report.root, { dir: skillDir, ext: "" }, "SKILL.md", content, opts.force, opts.dryRun),
  );
}

// Single-file handlers (subagents, rules, workflows): fetch the source file and
// drop it into the typed dir with the CLI's extension.
function installSingleFile(report: InstallReport, ref: RepoRef, spec: DirSpec | null, opts: InstallOptions): void {
  if (!spec) {
    report.steps.push({ action: "print", detail: `${report.cli} has no home for ${report.component.type}.` });
    return;
  }
  // Prefer the exact blob path; else look for "<name>.md" at the repo root or in
  // the conventional dir, then any single markdown the dir listing surfaces.
  let sourcePath = ref.isFile ? ref.path : "";
  if (!sourcePath) {
    const guesses = [`${report.component.name}.md`];
    for (const g of guesses) {
      try {
        const content = fetchFile(ref, g);
        sourcePath = g;
        const step = writeComponentFile(report.root, spec, `${report.component.name}${spec.ext}`, content, opts.force, opts.dryRun);
        report.steps.push(step);
        return;
      } catch {
        // try next guess
      }
    }
    notInstalled(report, `points at the whole repository ${ref.owner}/${ref.repo}, not one file Armory can place`);
    return;
  }
  const content = fetchFile(ref, sourcePath);
  report.steps.push(
    writeComponentFile(report.root, spec, `${report.component.name}${spec.ext}`, content, opts.force, opts.dryRun),
  );
}

// Hook: fetch the script if the URL points at a file, then print the
// settings.json registration the user must add (hooks are wired by config).
function installHook(report: InstallReport, body: string, ref: RepoRef, opts: InstallOptions): void {
  const spec = LAYOUTS[report.cli].hooks;
  if (!ref.isFile) {
    notInstalled(report, `points at the whole repository ${ref.owner}/${ref.repo}, not a hook script Armory can place`);
    return;
  }
  if (spec) {
    const content = fetchFile(ref, ref.path);
    const fileName = ref.path.split("/").pop() ?? `${report.component.name}`;
    report.steps.push(writeComponentFile(report.root, spec, fileName, content, opts.force, opts.dryRun));
  }
  report.steps.push({
    action: "print",
    detail: `Register the hook in your settings.json "hooks" block. Install snippet:\n${extractInstallSnippet(body)}`,
  });
  report.followUp.push("Add the hook entry to settings.json, then restart the CLI.");
}

// Fallback for types with no install mechanism (plugins, evals, identity,
// observability, infrastructure, memory, clis-tools): print the snippet.
const KIND: Record<string, string> = {
  memory: "a memory system",
  "clis-tools": "a command-line tool",
  evals: "an evaluation tool",
  observability: "an observability tool",
  infrastructure: "infrastructure",
  identity: "an identity component",
};

function installPrintOnly(report: InstallReport): void {
  const kind = KIND[report.component.type] ?? `a ${report.component.type} component`;
  notInstalled(report, `is ${kind}: Armory has no file to put in your harness for it, and it installs with its own tool`);
}

// --- orchestrator -----------------------------------------------------------

export function runInstall(name: string, opts: InstallOptions): InstallReport {
  const resolved = resolveComponent(name);
  if (!resolved) {
    throw new Error(`No component matched "${name}". Try \`armory search ${name}\`.`);
  }
  const root = opts.to ? opts.to : process.cwd();
  const cli = chooseCli(root, opts.cli);
  const report: InstallReport = {
    component: resolved.component,
    cli,
    root,
    fuzzy: resolved.fuzzy,
    steps: [],
    followUp: [],
  };

  const ref = parseGitHubUrl(resolved.component.source_url, resolved.component.source_repo);
  // Body lives in brain/; tolerate its absence (catalog may be ahead of brain).
  let body = "";
  try {
    body = readComponentBody(resolved.component);
  } catch {
    body = "";
  }

  const layout = LAYOUTS[cli];
  const type = resolved.component.type;
  const FILE_TYPES = ["skills", "subagents", "claudemd-rules", "workflows", "hooks"];
  if (!ref) {
    if (type === "mcps" || FILE_TYPES.includes(type)) notInstalled(report, "has no GitHub source to fetch from");
    else installPrintOnly(report);
    return report;
  }
  // A file-type row that points at a whole repository installs the file its note names, if it names one.
  const target = FILE_TYPES.includes(type) && !ref.path ? namedArtifact(body, ref) ?? ref : ref;
  switch (type) {
    case "mcps":
      installMcp(report, body, ref, opts);
      break;
    case "skills":
      installSkill(report, target, opts);
      break;
    case "subagents":
      installSingleFile(report, target, layout.subagents, opts);
      break;
    case "claudemd-rules":
      installSingleFile(report, target, layout["claudemd-rules"], opts);
      break;
    case "workflows":
      installSingleFile(report, target, layout.workflows, opts);
      break;
    case "hooks":
      installHook(report, body, target, opts);
      break;
    default:
      installPrintOnly(report);
  }
  return report;
}

/** True when the install wrote, merged, or found already in place at least one thing. */
export function installedSomething(report: InstallReport): boolean {
  return report.steps.some((s) => s.action !== "print");
}
