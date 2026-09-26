#!/usr/bin/env node
// check-installs.mjs — what `armory install` will do for the rows a URL alone cannot decide (CP143).
//
// 1. MCP rows. A config that runs `npx -y <name>` or `uvx <name>` downloads whatever the public registry
//    holds under that name. The site used to guess the name from the repository's name, and for
//    github/github-mcp-server the guess, `github-mcp-server`, is a package from an unrelated publisher.
//    This reads each MCP row's written install command (its install section first, then the rest of
//    its note, the order `armory install` uses), finds the package or image it would download, and asks
//    the registry where that package is published from. Read-only: GET registry.npmjs.org and pypi.org.
//    A `ghcr.io/<owner>/<image>` image counts when <owner> owns the row's repository.
// 2. Whole-repository rows of a one-file kind (skill, subagent, rule, command, hook). `armory install`
//    places the file the note links from its "How to install" section, when it links one in the same
//    repository.
//
// The site reads the file this writes, so it promises `armory install` only where the CLI will place
// something, and shows a downloading command only for `match: true`. The CLI makes the registry check
// live at install time (cli/src/fetch.ts), so it never needs this file.
//
//   node scripts/check-installs.mjs            # scan and print the counts
//   node scripts/check-installs.mjs --write    # also write web/src/data/install-check.json
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "web", "src", "data", "install-check.json");
const write = process.argv.includes("--write");
const cat = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf-8")).components;

// ── the command a row's note names (same parsing as cli/src/fetch.ts parseRunCommand) ────────────
const LAUNCHERS = ["npx", "uvx", "uv", "docker", "bunx", "pnpm", "deno", "node", "python", "python3"];
function parseRunCommand(text) {
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.replace(/`/g, "").replace(/^\s*\$\s*/, "").trim();
    const tokens = line.split(/\s+/).filter(Boolean);
    const i = tokens.findIndex((t) => LAUNCHERS.includes(t));
    if (i === -1) continue;
    const slice = tokens.slice(i).filter((t) => t !== "&&" && !t.startsWith("#"))
      .map((t) => t.replace(/^["'`]+/, "").replace(/["'`.,;)]+$/, ""));
    const args = slice.slice(1).filter((a) => a.length > 0 && !a.includes("&&"));
    if (args.length === 0 && slice[0] !== "docker") continue;
    return { command: slice[0], args };
  }
  return null;
}
// The "## How to install / invoke" section (same as cli/src/catalog.ts extractInstallSnippet).
function installSection(full) {
  const body = full.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((l) => /^#{1,6}\s+how to install/i.test(l));
  if (start === -1) return body.trim();
  const out = [];
  for (let i = start + 1; i < lines.length && !/^#{1,6}\s+\S/.test(lines[i]); i += 1) out.push(lines[i]);
  return out.join("\n").trim();
}

// ── what the command downloads ───────────────────────────────────────────────────────────────────
// npx: the first argument that is not a flag, or the value of -p/--package; a version suffix dropped.
// uvx: the first argument that is not a flag, or the value of --from; version and extras dropped.
// docker: a ghcr.io image. Anything else (node, python, uv run …) runs local files, not a registry.
function packageOf(run) {
  if (!run) return null;
  const firstArg = (args, valueFlags) => {
    for (let i = 0; i < args.length; i += 1) {
      const a = args[i];
      if (valueFlags.includes(a)) return args[i + 1] ?? null;
      const eq = valueFlags.find((f) => a.startsWith(`${f}=`));
      if (eq) return a.slice(eq.length + 1);
      if (!a.startsWith("-")) return a;
    }
    return null;
  };
  if (run.command === "npx") {
    const raw = firstArg(run.args, ["-p", "--package"]);
    const name = raw && (raw.startsWith("@") ? raw.replace(/^(@[^/@]+\/[^@]+)@.*$/, "$1") : raw.replace(/@.*$/, ""));
    return name && /^(@[a-z0-9][\w.~-]*\/)?[a-z0-9][\w.~-]*$/i.test(name) ? { registry: "npm", name } : { registry: "npm", name: raw, invalid: true };
  }
  if (run.command === "uvx") {
    const raw = firstArg(run.args, ["--from"]);
    const name = raw && raw.replace(/\[.*$/, "").replace(/[=<>!~@].*$/, "");
    return name && /^[a-z0-9][\w.-]*$/i.test(name) ? { registry: "pypi", name } : { registry: "pypi", name: raw, invalid: true };
  }
  if (run.command === "docker") {
    const image = run.args.find((a) => /^ghcr\.io\/[^/\s]+\/\S+$/i.test(a));
    return image ? { registry: "ghcr", name: image } : { registry: "docker", name: null, invalid: true };
  }
  return null;
}

// "git+https://github.com/o/r.git", "github:o/r", "o/r", "git@github.com:o/r" → "o/r" (lower case).
function repoOf(value) {
  const s = String(value || "").trim();
  const m = s.match(/github\.com[/:]([^/\s]+)\/([^/#?\s]+)/i) || s.match(/^(?:github:)?([\w.-]+)\/([\w.-]+)$/i);
  return m ? `${m[1]}/${m[2].replace(/\.git$/i, "")}`.toLowerCase() : null;
}

const rowRepo = (c) => repoOf(c.source_url) || repoOf(c.source_repo);

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(20_000) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

// Where the registry says a package comes from: "owner/repo" for npm and PyPI, "owner" for ghcr.io.
async function publishedFrom(pkg, repo) {
  if (pkg.registry === "npm") {
    const doc = await getJson(`https://registry.npmjs.org/${pkg.name.replace("/", "%2F")}/latest`);
    if (!doc) return { from: null, why: "not on npm" };
    const r = repoOf(typeof doc.repository === "string" ? doc.repository : doc.repository?.url);
    return { from: r, why: r ? null : "npm lists no repository" };
  }
  if (pkg.registry === "pypi") {
    const doc = await getJson(`https://pypi.org/pypi/${encodeURIComponent(pkg.name)}/json`);
    if (!doc) return { from: null, why: "not on PyPI" };
    const urls = [doc.info?.home_page, doc.info?.download_url, ...Object.values(doc.info?.project_urls || {})];
    const repos = urls.map(repoOf).filter(Boolean);
    return { from: repos.find((r) => r === repo) || repos[0] || null, why: repos.length ? null : "PyPI lists no GitHub repository" };
  }
  const owner = pkg.name.split("/")[1].toLowerCase(); // ghcr.io/<owner>/<image>
  return { from: owner, why: null };
}

const rows = [];
for (const c of cat) {
  if (c.type !== "mcps") continue;
  const file = join(ROOT, "brain", c.path || "");
  if (!existsSync(file)) continue;
  const full = readFileSync(file, "utf-8");
  const run = parseRunCommand(installSection(full)) ?? parseRunCommand(full);
  const pkg = packageOf(run);
  if (pkg) rows.push({ c, run, pkg, repo: rowRepo(c) });
}

const lookups = new Map(); // "registry:name" → Promise<{from, why}>
const out = {};
let next = 0;
async function worker() {
  while (next < rows.length) {
    const r = rows[next++];
    const key = `mcps/${r.c.name}`;
    const base = { command: r.run.command, package: r.pkg.name, repository: r.repo };
    if (r.pkg.invalid || !r.repo) {
      out[key] = { ...base, published_from: null, match: false, why: r.repo ? "the command names no package" : "the row has no GitHub repository" };
      continue;
    }
    const k = `${r.pkg.registry}:${r.pkg.name}`;
    if (!lookups.has(k)) lookups.set(k, publishedFrom(r.pkg, r.repo).catch((e) => ({ from: null, why: `lookup failed: ${e.message}` })));
    const { from, why } = await lookups.get(k);
    const match = r.pkg.registry === "ghcr" ? from === r.repo.split("/")[0] : from === r.repo;
    out[key] = { ...base, published_from: from, match, ...(match ? {} : { why: why || `published from ${from}` }) };
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

// ── whole-repository rows of a one-file kind: the file their note names (cli namedArtifact) ──────
const FILE_TYPES = ["skills", "subagents", "claudemd-rules", "workflows", "hooks"];
const LINK = /https:\/\/github\.com\/([^/\s]+)\/([^/\s]+)\/(blob|tree)\/([^/\s]+)\/([^\s)`'"]+)/gi;
const named = {};
for (const c of cat) {
  if (!FILE_TYPES.includes(c.type)) continue;
  const m = String(c.source_url || "").match(/github\.com\/([^/]+)\/([^/]+)(\/(blob|tree)\/)?/i);
  if (!m || m[3]) continue; // no GitHub source, or it already points inside the repository
  const file = join(ROOT, "brain", c.path || "");
  if (!existsSync(file)) continue;
  const repo = m[2].replace(/\.git$/i, "").toLowerCase();
  for (const l of installSection(readFileSync(file, "utf-8")).matchAll(LINK)) {
    if (l[1].toLowerCase() !== m[1].toLowerCase() || l[2].toLowerCase() !== repo) continue;
    named[`${c.type}/${c.name}`] = { path: l[5].replace(/[.,;:]+$/, ""), file: l[3].toLowerCase() === "blob" };
    break;
  }
}
const namedFiles = Object.fromEntries(Object.keys(named).sort().map((k) => [k, named[k]]));
console.log(`whole-repository rows of a one-file kind whose note names a file or folder in it: ${Object.keys(namedFiles).length}`);

const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
const all = Object.values(sorted);
const count = (f) => all.filter(f).length;
console.log(`MCP rows whose note names a downloading command: ${all.length}`);
for (const cmd of ["npx", "uvx", "docker"]) {
  const of = all.filter((r) => r.command === cmd);
  if (of.length) console.log(`  ${cmd}: ${of.length} · published from the row's own repository ${of.filter((r) => r.match).length} · not ${of.filter((r) => !r.match).length}`);
}
console.log(`shown on the site: ${count((r) => r.match)} · hidden: ${count((r) => !r.match)}`);
if (write) {
  writeFileSync(OUT, JSON.stringify({
    checked_at: new Date().toISOString(),
    rule: "An install command that downloads a package by name is shown only when the registry says that package is published from the component's own GitHub repository (for a ghcr.io image, its owner).",
    named_files_rule: "A skill, subagent, rule, command or hook that points at a whole repository installs the file or folder its note links in that repository, as `armory install` does.",
    regenerate: "node scripts/check-installs.mjs --write",
    rows: sorted,
    named_files: namedFiles,
  }, null, 2) + "\n");
  console.log(`wrote ${OUT.replace(`${ROOT}/`, "")}`);
}
