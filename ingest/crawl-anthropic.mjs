#!/usr/bin/env node
// ============================================================================
// crawl-anthropic.mjs — Deterministic mega-crawl of Anthropic's OWN + official
// reference repos into engram stubs. This is the QUALITY BAR for the registry.
// ----------------------------------------------------------------------------
// Writes everything under incoming/anthropic-official/<type>/<name>.md:
//
//   1. anthropics/skills            skills/<name>/SKILL.md   → skills
//   2. modelcontextprotocol/servers src/<name>/README.md     → mcps  (reference)
//   3. anthropics/anthropic-cookbook registry.yaml recipes   → workflows
//        (tool_use/, skills/, patterns/, claude_agent_sdk/, managed_agents/)
//   4. anthropics/anthropic-quickstarts <quickstart>/README  → workflows
//
// Sources are official Anthropic / MCP-org content → maturity: stable.
// Pure, deterministic, zero npm deps. Reads cloned repos at the SRC_* roots,
// emits engram markdown via toMarkdown() from crawl.mjs. Idempotent: re-running
// overwrites the same files (name === filename, unique within each type).
//
// Run:  node ingest/crawl-anthropic.mjs            (writes the stubs)
//       node ingest/crawl-anthropic.mjs --dry-run  (prints counts only)
//
// Clone the four sources first (depth 1) into ANTHROPIC_CLONES (default
// /tmp/armory-clones):
//   git clone --depth 1 https://github.com/anthropics/skills              .../anthropic-skills
//   git clone --depth 1 https://github.com/modelcontextprotocol/servers   .../mcp-servers
//   git clone --depth 1 https://github.com/anthropics/anthropic-cookbook  .../anthropic-cookbook
//   git clone --depth 1 https://github.com/anthropics/anthropic-quickstarts .../anthropic-quickstarts
// ============================================================================
import {
  readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const CLONES = process.env.ANTHROPIC_CLONES || "/tmp/armory-clones";
const SRC_SKILLS = join(CLONES, "anthropic-skills");
const SRC_SERVERS = join(CLONES, "mcp-servers");
const SRC_COOKBOOK = join(CLONES, "anthropic-cookbook");
const SRC_QUICKSTARTS = join(CLONES, "anthropic-quickstarts");
const OUT = join(ROOT, "incoming", "anthropic-official");

const VERIFIED_AT = "2026-05-26";
const MATURITY = "stable"; // official Anthropic / MCP-org content
// Skills/cookbook/quickstarts are Claude-only artifacts. MCP servers are the
// universal protocol → the registry's canonical 5-CLI set.
const CLI_CLAUDE = ["claude"];
const CLI_MCP = ["claude", "codex", "cursor", "gemini", "opencode"];

// ---------------------------------------------------------------------------
// Scrub: no absolute /Users/ (or /home/) paths and no personal names leak into
// a stub. The only free-text field we emit is `description`, sourced from each
// repo's own metadata (SKILL.md, README H1, cookbook registry.yaml). Defensive.
// ---------------------------------------------------------------------------
function scrub(text) {
  if (text == null) return text;
  return String(text)
    .replace(/\/Users\/[^\s"')]+/g, "<path>")
    .replace(/\/home\/[^\s"')]+/g, "<path>")
    .replace(/\s+/g, " ")
    .trim();
}

// Collapse a (possibly multi-line) description to one folded WHEN-to-use line.
function whenToUse(desc, fallback) {
  const d = scrub(desc) || fallback;
  return d.length > 320 ? d.slice(0, 317).trimEnd() + "…" : d;
}

// Standard engram frontmatter object (field order matches the contract).
function frontmatter({ name, type, description, sourceRepo, sourceUrl, license, cliCompat, tags }) {
  return {
    name,
    type,
    description: whenToUse(description, name),
    source_repo: sourceRepo,
    source_url: sourceUrl,
    license,
    cli_compat: cliCompat,
    maturity: MATURITY,
    stars: null,
    eval_score: null,
    verified_at: VERIFIED_AT,
    related: [],
    tags,
  };
}

// Engram body — four short sections per the CONTRIBUTING contract.
function body({ name, type, description, sourceRepo, sourceUrl, install, notes }) {
  const d = scrub(description) || name;
  return [
    "## What it is",
    `Official \`${sourceRepo}\` ${type} component — ${d}`,
    "",
    "## When to use it",
    d,
    "",
    "## How to install / invoke",
    install,
    "",
    "## Notes",
    notes,
  ].join("\n");
}

// Read a markdown file's frontmatter using the catalog's own parser so we honor
// the exact dialect the registry expects.
function readFm(file) {
  return parseFrontmatter(readFileSync(file, "utf8"));
}

// Extract the first markdown H1 ("# Heading") — used to title READMEs.
function firstH1(raw) {
  const m = raw.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

// Tolerant `description:` extractor. The catalog parser only understands
// explicit folded (>) / literal (|) blocks; several Anthropic SKILL.md files
// put a long plain scalar on one line (no >/|), and parseFrontmatter handles
// that, but some wrap onto indented continuation lines. This reads the full
// value (scalar + indented continuation) straight from the raw frontmatter so
// no WHEN-to-use text is lost. (Same approach as crawl-ecc.mjs.)
function readDescription(file) {
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return undefined;
  const lines = m[1].split(/\r?\n/);
  const i = lines.findIndex((l) => /^description:\s*/.test(l));
  if (i === -1) return undefined;
  let first = lines[i].replace(/^description:\s*/, "").trim();
  if (first === ">" || first === "|") first = "";
  const parts = first ? [first] : [];
  for (let j = i + 1; j < lines.length; j++) {
    const ln = lines[j];
    if (/^[A-Za-z0-9_]+:\s*/.test(ln)) break;        // next top-level key
    if (/^\s+\S/.test(ln) || ln.trim() === "") {     // indented or blank → continuation
      const t = ln.trim();
      if (t) parts.push(t);
      continue;
    }
    break;
  }
  const joined = parts.join(" ").trim();
  return joined || undefined;
}

// ---------------------------------------------------------------------------
// 1. anthropics/skills — skills/<name>/SKILL.md → type `skills`.
// name = SKILL.md `name` field (fallback dir name). description = its own
// WHEN-to-use line. License: the repo is governed by Anthropic's terms
// (source-available); the per-skill `license:` lines are non-SPDX prose, so we
// record the established registry value `Proprietary-Anthropic` (matches the
// existing incoming/anthropic-skills/ stubs). The `template/` dir is a scaffold,
// not a real skill — skipped.
// ---------------------------------------------------------------------------
function extractSkills() {
  const dir = join(SRC_SKILLS, "skills");
  const blob = "https://github.com/anthropics/skills/blob/main";
  const out = [];
  const seen = new Set();
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "template") continue; // scaffold, not a skill
    const skillFile = join(dir, entry.name, "SKILL.md");
    if (!existsSync(skillFile)) continue;
    const fm = readFm(skillFile);
    const name = slugify(fm.name || entry.name);
    if (seen.has(name)) continue;
    seen.add(name);
    const sourceUrl = `${blob}/skills/${entry.name}/SKILL.md`;
    const description =
      readDescription(skillFile) || fm.description || entry.name.replace(/-/g, " ");
    out.push({
      frontmatter: frontmatter({
        name, type: "skills", description,
        sourceRepo: "anthropics/skills", sourceUrl,
        license: "Proprietary-Anthropic", cliCompat: CLI_CLAUDE,
        tags: ["anthropic", "official", "skill"],
      }),
      body: body({
        name, type: "skills", description,
        sourceRepo: "anthropics/skills", sourceUrl,
        install: `Official Anthropic skill. See the full \`SKILL.md\` (plus any bundled scripts/REFERENCE.md) for the runnable implementation: ${sourceUrl}`,
        notes: "Official Anthropic reference skill — the quality bar for the Skills spec. License: Anthropic terms (source-available; see repo LICENSE/README). Pending verify → promote.",
      }),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// 2. modelcontextprotocol/servers — src/<name>/ → type `mcps` (the OFFICIAL
// reference servers only; the giant third-party README list is skipped — that
// is covered by PulseMCP). description = README H1 / first paragraph. License:
// Apache-2.0 (new MCP code is Apache-2.0 per repo LICENSE).
// ---------------------------------------------------------------------------
function extractMcps() {
  const dir = join(SRC_SERVERS, "src");
  const blob = "https://github.com/modelcontextprotocol/servers/blob/main";
  const out = [];
  const seen = new Set();
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const readme = join(dir, entry.name, "README.md");
    const name = slugify(entry.name);
    if (seen.has(name)) continue;
    seen.add(name);
    const sourceUrl = `${blob}/src/${entry.name}/README.md`;
    // WHEN-to-use from README: prefer the first non-heading paragraph, else H1.
    const raw = existsSync(readme) ? readFileSync(readme, "utf8") : "";
    const description = readmeWhen(raw, entry.name);
    out.push({
      frontmatter: frontmatter({
        name, type: "mcps", description,
        sourceRepo: "modelcontextprotocol/servers", sourceUrl,
        license: "Apache-2.0", cliCompat: CLI_MCP,
        tags: ["mcp", "official", "reference", "mcp-server"],
      }),
      body: body({
        name, type: "mcps", description,
        sourceRepo: "modelcontextprotocol/servers", sourceUrl,
        install: `Official MCP reference server. See the README for the \`mcpServers\` config block (command + args / npx / uvx): ${sourceUrl}`,
        notes: "Official Model Context Protocol reference server (modelcontextprotocol/servers). License: Apache-2.0. Pending verify → promote.",
      }),
    });
  }
  return out;
}

// Derive a WHEN-to-use line from a server README: drop badges/headings, take
// the first real sentence; fall back to a generated routing hint.
function readmeWhen(raw, serverName) {
  const lines = raw.split(/\r?\n/);
  for (const ln of lines) {
    const t = ln.trim();
    if (!t) continue;
    if (t.startsWith("#")) continue;        // skip headings
    if (t.startsWith("[!")) continue;       // skip badges/callouts
    if (t.startsWith("![")) continue;       // skip images
    if (t.startsWith(">")) continue;        // skip blockquotes
    if (t.startsWith("|")) continue;        // skip tables
    // strip inline markdown link syntax for a clean sentence
    const clean = t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").trim();
    if (clean.length > 20) return clean;
  }
  const h1 = firstH1(raw);
  return h1
    ? `${h1} — official MCP reference server. Use to give an agent ${serverName} tool access.`
    : `Official MCP reference server "${serverName}". Use to give an agent ${serverName} tool access.`;
}

// ---------------------------------------------------------------------------
// 3. anthropics/anthropic-cookbook — registry.yaml is the canonical metadata
// source (curated title + description + path + categories per notebook). We
// emit one `workflows` stub per recipe in the agent-building families:
//   tool_use/  skills/  patterns/  claude_agent_sdk/  managed_agents/
// (Skips third_party/ — not Anthropic-authored — and the general
// capabilities/misc/multimodal/extended_thinking/finetuning recipes that are
// not agent-harness components, per the "notable recipes" scope.)
// description = registry `description` (already WHEN-to-use). name = slug of the
// recipe path basename, namespaced by family to stay unique.
// ---------------------------------------------------------------------------
const COOKBOOK_FAMILIES = new Set([
  "tool_use", "skills", "patterns", "claude_agent_sdk", "managed_agents",
]);

function extractCookbook() {
  const regFile = join(SRC_COOKBOOK, "registry.yaml");
  const blob = "https://github.com/anthropics/anthropic-cookbook/blob/main";
  const out = [];
  const seen = new Set();
  if (!existsSync(regFile)) return out;
  for (const rec of parseRegistry(readFileSync(regFile, "utf8"))) {
    if (!rec.path) continue;
    const family = rec.path.split("/")[0];
    if (!COOKBOOK_FAMILIES.has(family)) continue;
    // name: family + recipe basename → unique, descriptive slug.
    const base = basename(rec.path).replace(/\.[^.]+$/, "");
    const name = slugify(`${family}-${base}`);
    if (seen.has(name)) continue;
    seen.add(name);
    const sourceUrl = `${blob}/${rec.path}`;
    const description = rec.description || rec.title || base.replace(/[-_]/g, " ");
    const tags = ["anthropic", "cookbook", "recipe", ...family.split("_")];
    out.push({
      frontmatter: frontmatter({
        name, type: "workflows", description,
        sourceRepo: "anthropics/anthropic-cookbook", sourceUrl,
        license: "MIT", cliCompat: CLI_CLAUDE, tags,
      }),
      body: body({
        name, type: "workflows", description,
        sourceRepo: "anthropics/anthropic-cookbook", sourceUrl,
        install: `Official Anthropic cookbook recipe (notebook). Open it to follow the runnable walkthrough: ${sourceUrl}`,
        notes: `Recipe "${scrub(rec.title) || base}" from the anthropic-cookbook \`${family}/\` family${rec.categories ? ` (categories: ${rec.categories.join(", ")})` : ""}. License: MIT. Pending verify → promote.`,
      }),
    });
  }
  return out;
}

// Minimal parser for the cookbook registry.yaml — a YAML list of records with
// scalar `title`/`description`/`path`/`date` (descriptions may wrap onto
// indented continuation lines) and a `categories:` block list. Zero deps; only
// the shape this one file uses. Returns [{title, description, path, categories}].
function parseRegistry(raw) {
  const lines = raw.split(/\r?\n/);
  const records = [];
  let cur = null;
  let pendingKey = null;        // a scalar key whose value may continue indented
  let inCategories = false;
  const closeScalar = () => { pendingKey = null; };
  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "  ");
    if (/^#/.test(line) || line.trim().startsWith("# ")) continue; // comment
    // New record: "- title: ..."
    const top = line.match(/^-\s+title:\s*(.*)$/);
    if (top) {
      if (cur) records.push(cur);
      cur = { title: unquote(top[1].trim()), description: "", path: "", categories: [] };
      pendingKey = "title";
      inCategories = false;
      continue;
    }
    if (!cur) continue;
    // categories block-list items
    if (inCategories) {
      const item = line.match(/^\s+-\s+(.*)$/);
      if (item) { cur.categories.push(unquote(item[1].trim())); continue; }
      inCategories = false; // fell through to another key
    }
    // a top-level-within-record key: "  <key>: <value>"
    const kv = line.match(/^\s{2,}([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      const val = kv[2].trim();
      closeScalar();
      if (key === "categories") { inCategories = true; continue; }
      if (key === "authors") { inCategories = false; pendingKey = null; continue; }
      if (key === "title" || key === "description" || key === "path" || key === "date") {
        cur[key] = unquote(val);
        pendingKey = (key === "description" || key === "title") ? key : null;
      } else {
        pendingKey = null;
      }
      continue;
    }
    // continuation of a wrapped scalar (indented, no "key:" prefix)
    if (pendingKey && /^\s+\S/.test(line)) {
      cur[pendingKey] = `${cur[pendingKey]} ${unquote(line.trim())}`.trim();
      continue;
    }
  }
  if (cur) records.push(cur);
  return records;
}

function unquote(v) {
  return String(v).replace(/^['"]/, "").replace(/['"]$/, "").trim();
}

// ---------------------------------------------------------------------------
// 4. anthropics/anthropic-quickstarts — each top-level quickstart dir with a
// README → one `workflows` stub. description = README H1 + first sentence.
// ---------------------------------------------------------------------------
function extractQuickstarts() {
  const blob = "https://github.com/anthropics/anthropic-quickstarts/blob/main";
  const out = [];
  const seen = new Set();
  if (!existsSync(SRC_QUICKSTARTS)) return out;
  for (const entry of readdirSync(SRC_QUICKSTARTS, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;
    const readme = join(SRC_QUICKSTARTS, entry.name, "README.md");
    if (!existsSync(readme)) continue;
    const name = slugify(entry.name);
    if (seen.has(name)) continue;
    seen.add(name);
    const sourceUrl = `${blob}/${entry.name}/README.md`;
    const raw = readFileSync(readme, "utf8");
    const h1 = firstH1(raw) || entry.name.replace(/-/g, " ");
    const sentence = readmeWhen(raw, entry.name);
    const description = `${h1}. ${sentence}`;
    out.push({
      frontmatter: frontmatter({
        name, type: "workflows", description,
        sourceRepo: "anthropics/anthropic-quickstarts", sourceUrl,
        license: "MIT", cliCompat: CLI_CLAUDE,
        tags: ["anthropic", "quickstart", "official"],
      }),
      body: body({
        name, type: "workflows", description,
        sourceRepo: "anthropics/anthropic-quickstarts", sourceUrl,
        install: `Official Anthropic quickstart. Clone the repo and follow the project README to run it: ${sourceUrl}`,
        notes: `Quickstart "${h1}" from anthropics/anthropic-quickstarts — a runnable starter project. License: MIT. Pending verify → promote.`,
      }),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Write all stubs grouped by type into incoming/anthropic-official/<type>/.
// ---------------------------------------------------------------------------
function writeGroup(type, stubs, { dryRun }) {
  const dir = join(OUT, type);
  if (!dryRun) mkdirSync(dir, { recursive: true });
  for (const stub of stubs) {
    const file = join(dir, `${stub.frontmatter.name}.md`);
    if (!dryRun) writeFileSync(file, toMarkdown(stub));
  }
  return stubs.length;
}

function main() {
  const dryRun = process.argv.includes("--dry-run");

  const missing = [
    ["anthropics/skills", SRC_SKILLS],
    ["modelcontextprotocol/servers", SRC_SERVERS],
    ["anthropics/anthropic-cookbook", SRC_COOKBOOK],
    ["anthropics/anthropic-quickstarts", SRC_QUICKSTARTS],
  ].filter(([, p]) => !existsSync(p));
  if (missing.length) {
    console.error("Missing cloned source(s):");
    for (const [repo, p] of missing) console.error(`  ${repo} → expected at ${p}`);
    console.error(`Set ANTHROPIC_CLONES or clone the repos (see header). Aborting.`);
    process.exit(2);
  }

  // Fresh output dir each run (idempotent, no stale leftovers).
  if (!dryRun && existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });

  // Group by SOURCE so we can report per-source counts; collect per-type too.
  const bySource = {
    "anthropics/skills": { skills: extractSkills() },
    "modelcontextprotocol/servers": { mcps: extractMcps() },
    "anthropics/anthropic-cookbook": { workflows: extractCookbook() },
    "anthropics/anthropic-quickstarts": { workflows: extractQuickstarts() },
  };

  // Merge per-type across sources for writing (workflows comes from 2 sources).
  const byType = {};
  for (const groups of Object.values(bySource)) {
    for (const [type, stubs] of Object.entries(groups)) {
      (byType[type] ||= []).push(...stubs);
    }
  }

  // Uniqueness guard across the merged workflows set (cookbook vs quickstarts):
  // basenames are family/dir-namespaced so collisions are not expected, but
  // dedupe defensively and warn if any are dropped.
  for (const [type, stubs] of Object.entries(byType)) {
    const seen = new Set();
    byType[type] = stubs.filter((s) => {
      const n = s.frontmatter.name;
      if (seen.has(n)) { console.error(`  ! dropped duplicate ${type}/${n}.md`); return false; }
      seen.add(n);
      return true;
    });
  }

  let total = 0;
  const typeCounts = {};
  for (const [type, stubs] of Object.entries(byType)) {
    typeCounts[type] = writeGroup(type, stubs, { dryRun });
    total += typeCounts[type];
  }

  console.log(`${dryRun ? "[dry-run] " : ""}anthropic-official → ${OUT}`);
  console.log("  by source:");
  for (const [src, groups] of Object.entries(bySource)) {
    for (const [type, stubs] of Object.entries(groups)) {
      console.log(`    ${src} (${type}): ${stubs.length}`);
    }
  }
  console.log("  by type:");
  for (const [type, n] of Object.entries(typeCounts)) console.log(`    ${type}: ${n}`);
  console.log(`  TOTAL: ${total}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();

export {
  extractSkills, extractMcps, extractCookbook, extractQuickstarts,
  parseRegistry, readmeWhen, scrub, frontmatter,
};
