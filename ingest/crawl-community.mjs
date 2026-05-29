#!/usr/bin/env node
// ============================================================================
// crawl-community.mjs — Deterministic mega-crawl of affaan-m/ecc into Armory stubs.
// ----------------------------------------------------------------------------
// Ingests the COMPLETE affaan-m/ecc repo (a large multi-component community
// harness library) into incoming/community-skills-full/ — every component:
//   skills/<name>/SKILL.md      → skills          (~246)
//   agents/*.md                 → subagents        (~61)
//   commands/*.md               → workflows        (~76)
//   rules/<lang>/*.md           → claudemd-rules   (~110)
//   hooks/hooks.json entries    → hooks            (28 ids + 1 bundle)
//   .mcp.json + mcp-configs/    → mcps             (~30 union)
//
// Pure, deterministic, zero npm deps. Reads the cloned repo at SRC, writes
// Armory markdown files via toMarkdown() from crawl.mjs. Idempotent: re-running
// overwrites the same files (name === filename, unique within type).
//
// Run:  node ingest/crawl-community.mjs            (writes incoming/community-skills-full/)
//       node ingest/crawl-community.mjs --dry-run  (prints counts only)
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
const SRC = process.env.ECC_SRC || "/tmp/cp106-ecc-full";
const OUT = join(ROOT, "incoming", "community-skills-full");

const SOURCE_REPO = "affaan-m/ecc";
const BLOB = "https://github.com/affaan-m/ecc/blob/main"; // deep-link base
const LICENSE = "MIT";
const VERIFIED_AT = "2026-05-26";
// ECC ships for a multi-CLI matrix; the registry's canonical 5-CLI set.
const CLI_COMPAT = ["claude", "codex", "cursor", "gemini", "opencode"];
const MATURITY = "beta";

// The single deprecated component the chairman said to skip.
const SKIP_SKILLS = new Set(["continuous-learning"]);

// ---------------------------------------------------------------------------
// Scrub: no absolute /Users/ paths and no personal names leak into a stub.
// Frontmatter values come from ECC's own metadata (already generic), but the
// description is the only free-text field we emit, so we defensively clean it.
// ---------------------------------------------------------------------------
function scrub(text) {
  if (text == null) return text;
  return String(text)
    .replace(/\/Users\/[^\s"')]+/g, "<path>")     // strip absolute home paths
    .replace(/\/home\/[^\s"')]+/g, "<path>")
    .replace(/Affaan Mustafa/gi, "the ECC authors") // repo owner's real name
    .replace(/\s+/g, " ")
    .trim();
}

// Collapse a (possibly multi-line) description to one folded sentence and make
// it a WHEN-to-use routing hint. ECC descriptions already read as "when/what".
function whenToUse(desc, fallback) {
  const d = scrub(desc) || fallback;
  return d.length > 300 ? d.slice(0, 297).trimEnd() + "…" : d;
}

// Standard component frontmatter object (field order matches the contract).
function frontmatter({ name, type, description, sourceUrl, tags }) {
  return {
    name,
    type,
    description: whenToUse(description, name),
    source_repo: SOURCE_REPO,
    source_url: sourceUrl,
    license: LICENSE,
    cli_compat: CLI_COMPAT,
    maturity: MATURITY,
    stars: null,
    eval_score: null,
    verified_at: VERIFIED_AT,
    related: [],
    tags,
  };
}

function body({ name, type, description, sourceUrl }) {
  const d = scrub(description) || name;
  return [
    "## What it is",
    d,
    "",
    "## When to use it",
    d,
    "",
    "## How to install / invoke",
    `Vendored from \`${SOURCE_REPO}\` (\`${type}\`). See the source: ${sourceUrl}`,
    "",
    "## Notes",
    `Ingested from the affaan-m/ecc harness library (MIT). Pending verify → promote.`,
  ].join("\n");
}

// Extract the first markdown H1 ("# Heading") for files with no description.
function firstH1(raw) {
  const m = raw.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

// Read a markdown file's frontmatter using the catalog's own parser so we honor
// the exact dialect the registry expects.
function readFm(file) {
  return parseFrontmatter(readFileSync(file, "utf8"));
}

// The catalog parser only understands explicit folded (>) / literal (|) blocks.
// Several ECC SKILL.md files use YAML *implicit* multi-line continuation — a
// plain scalar wrapped onto an indented next line with no > or |. parseFrontmatter
// drops the continuation, truncating the description. This tolerant extractor
// reads the full `description:` value (scalar + any indented continuation lines)
// straight from the raw frontmatter so no WHEN-to-use text is lost.
function readDescription(file) {
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return undefined;
  const lines = m[1].split(/\r?\n/);
  let i = lines.findIndex((l) => /^description:\s*/.test(l));
  if (i === -1) return undefined;
  let first = lines[i].replace(/^description:\s*/, "").trim();
  // Strip a leading folded/literal indicator if present; value is on next lines.
  if (first === ">" || first === "|") first = "";
  const parts = first ? [first] : [];
  // Gather indented continuation lines (and blank lines) until the next key.
  for (let j = i + 1; j < lines.length; j++) {
    const ln = lines[j];
    if (/^[A-Za-z0-9_]+:\s*/.test(ln)) break;      // next top-level key
    if (/^\s+\S/.test(ln) || ln.trim() === "") {   // indented or blank → continuation
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
// Extractors — one per ECC component family. Each returns [{frontmatter, body}].
// ---------------------------------------------------------------------------

// skills/<name>/SKILL.md → skills. name = dir name. description from SKILL.md FM.
function extractSkills() {
  const dir = join(SRC, "skills");
  const out = [];
  const seen = new Set();
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (SKIP_SKILLS.has(entry.name)) continue;
    const skillFile = join(dir, entry.name, "SKILL.md");
    if (!existsSync(skillFile)) continue;
    const fm = readFm(skillFile);
    const name = slugify(fm.name || entry.name);
    if (seen.has(name)) continue; // uniqueness guard
    seen.add(name);
    const sourceUrl = `${BLOB}/skills/${entry.name}/SKILL.md`;
    // readDescription captures YAML implicit multi-line continuations the
    // catalog parser would truncate; fall back to the parsed scalar / dir name.
    const description =
      readDescription(skillFile) || fm.description || entry.name.replace(/-/g, " ");
    out.push({
      frontmatter: frontmatter({
        name, type: "skills", description, sourceUrl, tags: ["ecc", "skill"],
      }),
      body: body({ name, type: "skills", description, sourceUrl }),
    });
  }
  return out;
}

// agents/*.md → subagents. name from FM (fallback filename). rich description.
function extractAgents() {
  const dir = join(SRC, "agents");
  const out = [];
  const seen = new Set();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".md")) continue;
    const slug0 = basename(file, ".md");
    const agentFile = join(dir, file);
    const fm = readFm(agentFile);
    const name = slugify(fm.name || slug0);
    if (seen.has(name)) continue;
    seen.add(name);
    const sourceUrl = `${BLOB}/agents/${file}`;
    const description =
      readDescription(agentFile) || fm.description || slug0.replace(/-/g, " ");
    out.push({
      frontmatter: frontmatter({
        name, type: "subagents", description, sourceUrl, tags: ["ecc", "subagent"],
      }),
      body: body({ name, type: "subagents", description, sourceUrl }),
    });
  }
  return out;
}

// commands/*.md → workflows. name = filename (commands have no `name` field).
function extractCommands() {
  const dir = join(SRC, "commands");
  const out = [];
  const seen = new Set();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".md")) continue;
    const slug0 = basename(file, ".md");
    const fm = readFm(join(dir, file));
    const name = slugify(slug0); // filename is canonical for commands
    if (seen.has(name)) continue;
    seen.add(name);
    const sourceUrl = `${BLOB}/commands/${file}`;
    const description = fm.description || slug0.replace(/-/g, " ");
    out.push({
      frontmatter: frontmatter({
        name, type: "workflows", description, sourceUrl, tags: ["ecc", "command", "workflow"],
      }),
      body: body({ name, type: "workflows", description, sourceUrl }),
    });
  }
  return out;
}

// rules/<lang>/*.md → claudemd-rules. Filenames collide across langs (19×
// testing.md etc.), so name = "<lang>-<basename>" to stay unique. Rules carry
// only a `paths:` frontmatter — no description — so we derive WHEN-to-use from
// the first H1 heading plus the language.
function extractRules() {
  const dir = join(SRC, "rules");
  const out = [];
  const seen = new Set();
  for (const lang of readdirSync(dir, { withFileTypes: true })) {
    if (!lang.isDirectory()) continue;
    const langDir = join(dir, lang.name);
    for (const file of readdirSync(langDir)) {
      if (!file.endsWith(".md")) continue;
      if (file === "README.md") continue;
      const base = basename(file, ".md");
      const name = slugify(`${lang.name}-${base}`);
      if (seen.has(name)) continue;
      seen.add(name);
      const raw = readFileSync(join(langDir, file), "utf8");
      const h1 = firstH1(raw);
      const sourceUrl = `${BLOB}/rules/${lang.name}/${file}`;
      // WHEN-to-use: an agent reaches for this when writing <lang> and needs
      // the <topic> rule.
      const topic = h1 || base.replace(/-/g, " ");
      const description =
        `${lang.name === "common" ? "Language-agnostic" : lang.name} rule: ` +
        `apply when working on ${lang.name === "common" ? "any codebase" : lang.name} and you need ${topic}.`;
      out.push({
        frontmatter: frontmatter({
          name, type: "claudemd-rules", description, sourceUrl,
          tags: ["ecc", "rules", lang.name],
        }),
        body: body({ name, type: "claudemd-rules", description, sourceUrl }),
      });
    }
  }
  return out;
}

// hooks/hooks.json entries → hooks. Each lifecycle hook has an `id`, a
// `matcher`, and a `description`. id contains ':' so we slugify it. We also
// emit the memory-persistence reference bundle as one component.
function extractHooks() {
  const out = [];
  const seen = new Set();
  const hooksFile = join(SRC, "hooks", "hooks.json");
  const data = JSON.parse(readFileSync(hooksFile, "utf8"));
  for (const [event, entries] of Object.entries(data.hooks || {})) {
    for (const e of entries) {
      const id = e.id || `${event}-${e.matcher || "any"}`;
      const name = slugify(id);
      if (seen.has(name)) continue;
      seen.add(name);
      const sourceUrl = `${BLOB}/hooks/hooks.json`;
      const matcher = e.matcher ? ` (matcher: ${e.matcher})` : "";
      const description =
        `${event} hook: ${e.description || id}${matcher}.`;
      out.push({
        frontmatter: frontmatter({
          name, type: "hooks", description, sourceUrl,
          tags: ["ecc", "hook", event],
        }),
        body: body({ name, type: "hooks", description, sourceUrl }),
      });
    }
  }
  // memory-persistence bundle (separate events-shaped reference file).
  const memFile = join(SRC, "hooks", "memory-persistence", "hooks.json");
  if (existsSync(memFile)) {
    const mem = JSON.parse(readFileSync(memFile, "utf8"));
    const name = "memory-persistence-bundle";
    if (!seen.has(name)) {
      seen.add(name);
      const sourceUrl = `${BLOB}/hooks/memory-persistence/hooks.json`;
      const description =
        `Hook bundle: ${mem.description || "ECC memory-persistence lifecycle hooks"}. ` +
        `Use to persist and reload agent session state across compaction.`;
      out.push({
        frontmatter: frontmatter({
          name, type: "hooks", description, sourceUrl,
          tags: ["ecc", "hook", "memory-persistence"],
        }),
        body: body({ name, type: "hooks", description, sourceUrl }),
      });
    }
  }
  return out;
}

// .mcp.json + mcp-configs/mcp-servers.json → mcps. Union by server name. The
// mcp-configs catalog carries per-server descriptions; .mcp.json adds any
// servers not in the catalog (e.g. exa). source_url points at the file the
// server is defined in.
function extractMcps() {
  const out = [];
  const seen = new Set();
  const add = (serverName, cfg, relPath) => {
    const name = slugify(serverName);
    if (seen.has(name)) return;
    seen.add(name);
    const sourceUrl = `${BLOB}/${relPath}`;
    const transport = cfg.type || (cfg.command ? `${cfg.command} stdio` : "");
    const description =
      cfg.description
        ? `MCP server — ${cfg.description}.`
        : `MCP server "${serverName}" (${transport}). Use to give an agent ${serverName} tool access.`;
    out.push({
      frontmatter: frontmatter({
        name, type: "mcps", description, sourceUrl,
        tags: ["ecc", "mcp", "mcp-server"],
      }),
      body: body({ name, type: "mcps", description, sourceUrl }),
    });
  };
  // Catalog first (it has descriptions), then .mcp.json fills the gaps.
  const cfgFile = join(SRC, "mcp-configs", "mcp-servers.json");
  if (existsSync(cfgFile)) {
    const servers = JSON.parse(readFileSync(cfgFile, "utf8")).mcpServers || {};
    for (const [n, c] of Object.entries(servers)) add(n, c, "mcp-configs/mcp-servers.json");
  }
  const dotFile = join(SRC, ".mcp.json");
  if (existsSync(dotFile)) {
    const servers = JSON.parse(readFileSync(dotFile, "utf8")).mcpServers || {};
    for (const [n, c] of Object.entries(servers)) add(n, c, ".mcp.json");
  }
  return out;
}

// ---------------------------------------------------------------------------
// Write all stubs grouped by type into incoming/community-skills-full/<type>/<name>.md.
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

  if (!existsSync(SRC)) {
    console.error(`ECC source not found at ${SRC}. Clone it first:`);
    console.error(`  git clone --depth 1 https://github.com/affaan-m/ecc ${SRC}`);
    process.exit(2);
  }

  // Fresh output dir each run (idempotent, no stale leftovers).
  if (!dryRun && existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });

  const groups = {
    skills: extractSkills(),
    subagents: extractAgents(),
    workflows: extractCommands(),
    "claudemd-rules": extractRules(),
    hooks: extractHooks(),
    mcps: extractMcps(),
  };

  const counts = {};
  let total = 0;
  for (const [type, stubs] of Object.entries(groups)) {
    counts[type] = writeGroup(type, stubs, { dryRun });
    total += counts[type];
  }

  console.log(`${dryRun ? "[dry-run] " : ""}community-skills-full → ${OUT}`);
  for (const [type, n] of Object.entries(counts)) {
    console.log(`  ${type}: ${n}`);
  }
  console.log(`  TOTAL: ${total}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();

export {
  extractSkills, extractAgents, extractCommands, extractRules,
  extractHooks, extractMcps, scrub, frontmatter,
};
