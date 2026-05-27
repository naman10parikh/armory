// `armory install <name>` — fetch a harness component and install it into the
// coding harness the user is in (Claude Code, Cursor, Codex, OpenCode, Gemini).
// This is the package-manager-for-agent-harnesses core: one handler per
// component type, routed through the per-CLI path map in targets.ts.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  loadCatalog,
  rankEngrams,
  readEngramBody,
  extractInstallSnippet,
  type Engram,
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
  engram: Engram;
  cli: Cli;
  root: string;
  fuzzy: boolean;
  steps: InstallStep[];
  followUp: string[];
}

// Resolve the component: exact name match first, then a single fuzzy fallback
// (top BM25 hit). Returns the engram plus whether it was a fuzzy resolution.
export function resolveEngram(name: string): { engram: Engram; fuzzy: boolean } | null {
  const engrams = loadCatalog().engrams;
  const exact = engrams.find((e) => e.name === name.trim());
  if (exact) return { engram: exact, fuzzy: false };
  const ranked = rankEngrams(engrams, name);
  return ranked.length > 0 ? { engram: ranked[0].engram, fuzzy: true } : null;
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
    report.steps.push({
      action: "print",
      detail: `Could not derive a run command for "${report.engram.name}". Check the source and add it manually:\n${report.engram.source_url}`,
    });
    return;
  }

  const file = resolveMcpPath(report.root, layout.mcp);
  const result = mergeMcpServer(
    file,
    layout.mcp,
    report.engram.name,
    { command: run.command, args: run.args },
    opts.force,
    opts.dryRun,
  );
  if (result.alreadyPresent) {
    report.steps.push({
      action: "skipped",
      detail: `${report.engram.name} already in ${file} (use --force to overwrite)`,
    });
  } else {
    report.steps.push({
      action: "merged-mcp",
      detail: `${report.engram.name} → ${file} (${run.command} ${run.args.join(" ")})${result.created ? " [created]" : ""}`,
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
  const skillDir = `${spec.dir}/${report.engram.name}`;
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
  const content = fetchFile(ref, skillFile);
  report.steps.push(
    writeComponentFile(report.root, { dir: skillDir, ext: "" }, "SKILL.md", content, opts.force, opts.dryRun),
  );
}

// Single-file handlers (subagents, rules, workflows): fetch the source file and
// drop it into the typed dir with the CLI's extension.
function installSingleFile(report: InstallReport, ref: RepoRef, spec: DirSpec | null, opts: InstallOptions): void {
  if (!spec) {
    report.steps.push({ action: "print", detail: `${report.cli} has no home for ${report.engram.type}.` });
    return;
  }
  // Prefer the exact blob path; else look for "<name>.md" at the repo root or in
  // the conventional dir, then any single markdown the dir listing surfaces.
  let sourcePath = ref.isFile ? ref.path : "";
  if (!sourcePath) {
    const guesses = [`${report.engram.name}.md`];
    for (const g of guesses) {
      try {
        const content = fetchFile(ref, g);
        sourcePath = g;
        const step = writeComponentFile(report.root, spec, `${report.engram.name}${spec.ext}`, content, opts.force, opts.dryRun);
        report.steps.push(step);
        return;
      } catch {
        // try next guess
      }
    }
    report.steps.push({
      action: "print",
      detail: `Could not locate the ${report.engram.type} file in ${report.engram.source_repo}. Source: ${report.engram.source_url}`,
    });
    return;
  }
  const content = fetchFile(ref, sourcePath);
  report.steps.push(
    writeComponentFile(report.root, spec, `${report.engram.name}${spec.ext}`, content, opts.force, opts.dryRun),
  );
}

// Hook: fetch the script if the URL points at a file, then print the
// settings.json registration the user must add (hooks are wired by config).
function installHook(report: InstallReport, body: string, ref: RepoRef, opts: InstallOptions): void {
  const spec = LAYOUTS[report.cli].hooks;
  if (ref.isFile && spec) {
    const content = fetchFile(ref, ref.path);
    const fileName = ref.path.split("/").pop() ?? `${report.engram.name}`;
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
function installPrintOnly(report: InstallReport, body: string): void {
  report.steps.push({
    action: "print",
    detail: `${report.engram.type} components install via their own command. Snippet:\n${extractInstallSnippet(body)}\n\nSource: ${report.engram.source_url}`,
  });
}

// --- orchestrator -----------------------------------------------------------

export function runInstall(name: string, opts: InstallOptions): InstallReport {
  const resolved = resolveEngram(name);
  if (!resolved) {
    throw new Error(`No engram matched "${name}". Try \`armory search ${name}\`.`);
  }
  const root = opts.to ? opts.to : process.cwd();
  const cli = chooseCli(root, opts.cli);
  const report: InstallReport = {
    engram: resolved.engram,
    cli,
    root,
    fuzzy: resolved.fuzzy,
    steps: [],
    followUp: [],
  };

  const ref = parseGitHubUrl(resolved.engram.source_url, resolved.engram.source_repo);
  // Body lives in brain/; tolerate its absence (catalog may be ahead of brain).
  let body = "";
  try {
    body = readEngramBody(resolved.engram);
  } catch {
    body = "";
  }

  const layout = LAYOUTS[cli];
  switch (resolved.engram.type) {
    case "mcps":
      if (!ref) throw new Error(`could not parse a GitHub source for "${resolved.engram.name}".`);
      installMcp(report, body, ref, opts);
      break;
    case "skills":
      if (!ref) throw new Error(`could not parse a GitHub source for "${resolved.engram.name}".`);
      installSkill(report, ref, opts);
      break;
    case "subagents":
      if (!ref) throw new Error(`could not parse a GitHub source for "${resolved.engram.name}".`);
      installSingleFile(report, ref, layout.subagents, opts);
      break;
    case "claudemd-rules":
      if (!ref) throw new Error(`could not parse a GitHub source for "${resolved.engram.name}".`);
      installSingleFile(report, ref, layout["claudemd-rules"], opts);
      break;
    case "workflows":
      if (!ref) throw new Error(`could not parse a GitHub source for "${resolved.engram.name}".`);
      installSingleFile(report, ref, layout.workflows, opts);
      break;
    case "hooks":
      if (!ref) throw new Error(`could not parse a GitHub source for "${resolved.engram.name}".`);
      installHook(report, body, ref, opts);
      break;
    default:
      installPrintOnly(report, body);
  }
  return report;
}
