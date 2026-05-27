#!/usr/bin/env node
// Engram MORE-SUBAGENTS crawler. Walks four community sub-agent / command
// collections and emits one stub per definition file into
// incoming/more-subagents/<slug>.md.
//
// Sources (--depth 1 clones into /tmp before running):
//   furai  — 0xfurai/claude-code-subagents-collection  (404 — skipped gracefully)
//   dlezo  — dl-ezo/claude-code-sub-agents              (flat *.md, no categories)
//   vijay  — vijaythecoder/awesome-claude-agents         (agents/**/<cat>/*.md)
//   hrh    — hesreallyhim/awesome-claude-code-agents     (agents/*.md)
//
// Pattern exactly mirrors crawl-collections.mjs:
//   walkFiles / frontmatterField / scrub() / uniqueName() / runCollection + self-validate
//
// Run:
//   node ingest/crawl-more-subagents.mjs \
//     --furai /tmp/eng-furai \
//     --dlezo /tmp/eng-dlezo \
//     --vijay /tmp/eng-vijay \
//     --hrh   /tmp/eng-hrh-agents \
//     [--apply]   # default: dry-run
import {
  mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync, statSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-05-27";

// --- Shared helpers (mirrors crawl-collections.mjs) -----------------------

function uniqueName(base, seen) {
  let name = base || "untitled";
  if (!seen.has(name)) { seen.add(name); return name; }
  for (let n = 2; ; n++) {
    const cand = `${name}-${n}`;
    if (!seen.has(cand)) { seen.add(cand); return cand; }
  }
}

function resetDir(dir) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function walkFiles(dir, pred, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walkFiles(full, pred, acc);
    else if (pred(full)) acc.push(full);
  }
  return acc;
}

function oneLine(s) { return String(s || "").replace(/\s+/g, " ").trim(); }

function scrub(s) {
  return oneLine(s)
    .replace(/\/Users\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/home\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/root(\/[^\s]*)?/g, "<path>");
}

function frontmatterField(raw, field) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return "";
  // handle multi-line YAML values (e.g. description: "...") — take first line
  const line = m[1].split(/\r?\n/).find((l) => new RegExp(`^${field}:`).test(l));
  if (!line) return "";
  return line.replace(new RegExp(`^${field}:\\s*`), "").replace(/^["']|["']$/g, "").trim();
}

// Extract first non-empty prose line after the closing --- (body fallback).
function firstBodyLine(raw) {
  const m = raw.match(/^---[\s\S]*?---\r?\n([\s\S]*)/);
  if (!m) return "";
  for (const line of m[1].split(/\r?\n/)) {
    const t = line.trim();
    if (t && !t.startsWith("#") && !t.startsWith("//") && t.length > 10) return t;
  }
  return "";
}

// Run one adapter: fetch -> toEngram -> write stubs (resets dir first on apply).
async function runCollection(adapter, { dryRun = true, outDir = INCOMING, log = console.log } = {}) {
  const items = await adapter.fetch();
  const dir = join(outDir, adapter.name);
  if (!dryRun) resetDir(dir);
  const written = [];
  for (const item of items) {
    const { frontmatter, body } = adapter.toEngram(item);
    const file = join(dir, `${frontmatter.name}.md`);
    const md = toMarkdown({ frontmatter, body });
    // Self-validate every stub against the catalog parser before writing.
    const fm = parseFrontmatter(md);
    if (fm.name !== frontmatter.name) {
      throw new Error(`name roundtrip mismatch for ${file}: "${fm.name}" != "${frontmatter.name}"`);
    }
    if (!dryRun) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, md);
    }
    written.push({ file, frontmatter, md });
  }
  log(`${dryRun ? "[dry-run] " : ""}${adapter.name}: ${written.length} stub(s) -> incoming/${adapter.name}/`);
  return written;
}

// =====================================================================
// SOURCE A: dl-ezo/claude-code-sub-agents -> more-subagents
// Flat repo: all *.md at root level (no subdirs), each is a sub-agent
// definition with YAML frontmatter (name, description). No README.md.
// =====================================================================
export function dlezoAdapter({ repoDir, existingNames = new Set() }) {
  const name = "more-subagents";
  const type = "subagents";
  const owner = "dl-ezo", repo = "claude-code-sub-agents";
  const seen = new Set(existingNames);
  return {
    name, type,
    async fetch() {
      if (!existsSync(repoDir)) return [];
      // Flat root: all *.md files, skip README.md
      const files = readdirSync(repoDir)
        .filter((f) => f.endsWith(".md") && f !== "README.md")
        .sort()
        .map((f) => join(repoDir, f));
      return files.map((f) => {
        const raw = readFileSync(f, "utf8");
        const fileSlug = basename(f, ".md");
        const fmName = frontmatterField(raw, "name");
        const fmDesc = frontmatterField(raw, "description");
        return {
          fileSlug,
          fmName,
          description: fmDesc || firstBodyLine(raw),
          relPath: basename(f),
          source: "dlezo",
          owner,
          repo,
        };
      });
    },
    toEngram(item) {
      const base = slugify(item.fmName || item.fileSlug);
      const uname = uniqueName(base, seen);
      const desc = scrub(item.description) ||
        `Use the ${item.fileSlug.replace(/-/g, " ")} sub-agent for the matching task.`;
      const url = `https://github.com/${item.owner}/${item.repo}/blob/main/${item.relPath}`;
      return {
        frontmatter: {
          name: uname, type, description: desc,
          source_repo: `${item.owner}/${item.repo}`, source_url: url,
          license: "unknown",
          cli_compat: ["claude"],
          maturity: "beta", stars: null, eval_score: null,
          verified_at: VERIFIED_AT, related: [],
          tags: ["dlezo", "subagents"],
        },
        body: `## What it is\n\`${item.owner}/${item.repo}\` sub-agent \`${item.fileSlug}\`. ${desc}\n\n` +
          `## When to use it\n${desc}\n\n` +
          `## How to install / invoke\n\`\`\`bash\n# copy into your project's .claude/agents/\n` +
          `curl -sL https://github.com/${item.owner}/${item.repo}/raw/main/${item.relPath} -o .claude/agents/${item.fileSlug}.md\n` +
          `\`\`\`\n\n## Notes\n` +
          `Extracted from [\`${item.owner}/${item.repo}\`](${url}). ` +
          `Pending verify -> promote.`,
      };
    },
  };
}

// =====================================================================
// SOURCE B: vijaythecoder/awesome-claude-agents -> more-subagents
// agents/<tier>/<cat>/*.md — where <tier> is core/orchestrators/
// specialized/universal and <cat> is the sub-directory (or empty for
// top-tier files). YAML frontmatter: name, description, [tools].
// docs/ skipped (not agent defs). README.md/CONTRIBUTING.md skipped.
// =====================================================================
export function vijayAdapter({ repoDir, existingNames = new Set() }) {
  const name = "more-subagents";
  const type = "subagents";
  const owner = "vijaythecoder", repo = "awesome-claude-agents";
  const seen = new Set(existingNames);
  return {
    name, type,
    async fetch() {
      const agentsDir = join(repoDir, "agents");
      if (!existsSync(agentsDir)) return [];
      const skipNames = new Set(["README.md", "CONTRIBUTING.md"]);
      const files = walkFiles(
        agentsDir,
        (f) => f.endsWith(".md") && !skipNames.has(basename(f)),
      ).sort();
      return files.map((f) => {
        const raw = readFileSync(f, "utf8");
        const fileSlug = basename(f, ".md");
        // Derive category from path: agents/<tier>/<cat>/file.md or agents/<tier>/file.md
        const relToAgents = f.replace(agentsDir + "/", "");
        const parts = relToAgents.split("/");
        // parts[0] = tier (core/orchestrators/specialized/universal)
        // parts[1..n-1] = cat hierarchy; last = filename
        const tier = parts[0] || "unknown";
        const category = parts.length > 2 ? parts.slice(1, -1).join("-") : tier;
        const fmName = frontmatterField(raw, "name");
        const fmDesc = frontmatterField(raw, "description");
        // relPath from repo root
        const relPath = `agents/${relToAgents}`;
        return {
          fileSlug,
          fmName,
          category,
          tier,
          description: fmDesc || firstBodyLine(raw),
          relPath,
          source: "vijay",
          owner,
          repo,
        };
      });
    },
    toEngram(item) {
      const base = slugify(item.fmName || item.fileSlug);
      const uname = uniqueName(base, seen);
      const desc = scrub(item.description) ||
        `Use the ${item.fileSlug.replace(/-/g, " ")} agent for ${item.category.replace(/-/g, " ")} tasks.`;
      const url = `https://github.com/${item.owner}/${item.repo}/blob/main/${item.relPath}`;
      return {
        frontmatter: {
          name: uname, type, description: desc,
          source_repo: `${item.owner}/${item.repo}`, source_url: url,
          license: "MIT",
          cli_compat: ["claude"],
          maturity: "beta", stars: null, eval_score: null,
          verified_at: VERIFIED_AT, related: [],
          tags: ["vijay", item.category, "subagents"],
        },
        body: `## What it is\n\`${item.owner}/${item.repo}\` sub-agent \`${item.fileSlug}\` ` +
          `(tier: ${item.tier}, category: ${item.category}). ${desc}\n\n` +
          `## When to use it\n${desc}\n\n` +
          `## How to install / invoke\n\`\`\`bash\n# copy into your project's .claude/agents/\n` +
          `curl -sL https://github.com/${item.owner}/${item.repo}/raw/main/${item.relPath} -o .claude/agents/${item.fileSlug}.md\n` +
          `\`\`\`\n\n## Notes\n` +
          `Extracted from [\`${item.owner}/${item.repo}\`](${url}). ` +
          `Pending verify -> promote.`,
      };
    },
  };
}

// =====================================================================
// SOURCE C: hesreallyhim/awesome-claude-code-agents -> more-subagents
// agents/*.md — flat, YAML frontmatter: name, description, [color].
// =====================================================================
export function hrhAdapter({ repoDir, existingNames = new Set() }) {
  const name = "more-subagents";
  const type = "subagents";
  const owner = "hesreallyhim", repo = "awesome-claude-code-agents";
  const seen = new Set(existingNames);
  return {
    name, type,
    async fetch() {
      const agentsDir = join(repoDir, "agents");
      if (!existsSync(agentsDir)) return [];
      const files = readdirSync(agentsDir)
        .filter((f) => f.endsWith(".md") && f !== "README.md")
        .sort()
        .map((f) => join(agentsDir, f));
      return files.map((f) => {
        const raw = readFileSync(f, "utf8");
        const fileSlug = basename(f, ".md");
        const fmName = frontmatterField(raw, "name");
        const fmDesc = frontmatterField(raw, "description");
        return {
          fileSlug,
          fmName,
          description: fmDesc || firstBodyLine(raw),
          relPath: `agents/${basename(f)}`,
          source: "hrh",
          owner,
          repo,
        };
      });
    },
    toEngram(item) {
      const base = slugify(item.fmName || item.fileSlug);
      const uname = uniqueName(base, seen);
      const desc = scrub(item.description) ||
        `Use the ${item.fileSlug.replace(/-/g, " ")} sub-agent for the matching task.`;
      const url = `https://github.com/${item.owner}/${item.repo}/blob/main/${item.relPath}`;
      return {
        frontmatter: {
          name: uname, type, description: desc,
          source_repo: `${item.owner}/${item.repo}`, source_url: url,
          license: "unknown",
          cli_compat: ["claude"],
          maturity: "beta", stars: null, eval_score: null,
          verified_at: VERIFIED_AT, related: [],
          tags: ["hrh", "subagents"],
        },
        body: `## What it is\n\`${item.owner}/${item.repo}\` sub-agent \`${item.fileSlug}\`. ${desc}\n\n` +
          `## When to use it\n${desc}\n\n` +
          `## How to install / invoke\n\`\`\`bash\n# copy into your project's .claude/agents/\n` +
          `curl -sL https://github.com/${item.owner}/${item.repo}/raw/main/${item.relPath} -o .claude/agents/${item.fileSlug}.md\n` +
          `\`\`\`\n\n## Notes\n` +
          `Extracted from [\`${item.owner}/${item.repo}\`](${url}). ` +
          `Pending verify -> promote.`,
      };
    },
  };
}

// =====================================================================
// MERGED ADAPTER — combines all three sources into incoming/more-subagents/
// using a single shared `seen` set so slugs are globally unique.
// =====================================================================
export function moreSubagentsAdapter({ dlezoDir, vijayDir, hrhDir }) {
  const name = "more-subagents";
  const type = "subagents";
  // Single seen set shared across all source adapters for global uniqueness.
  const seen = new Set();

  return {
    name, type,
    async fetch() {
      const all = [];

      // Source A: dlezo (flat)
      if (dlezoDir && existsSync(dlezoDir)) {
        const dlezo = dlezoAdapter({ repoDir: dlezoDir, existingNames: seen });
        const items = await dlezo.fetch();
        items.forEach((i) => all.push({ ...i, _adapter: dlezo, _sourceTag: "dlezo" }));
      }

      // Source B: vijay (nested)
      if (vijayDir && existsSync(vijayDir)) {
        const vijay = vijayAdapter({ repoDir: vijayDir, existingNames: seen });
        const items = await vijay.fetch();
        items.forEach((i) => all.push({ ...i, _adapter: vijay, _sourceTag: "vijay" }));
      }

      // Source C: hrh (flat agents/)
      if (hrhDir && existsSync(hrhDir)) {
        const hrh = hrhAdapter({ repoDir: hrhDir, existingNames: seen });
        const items = await hrh.fetch();
        items.forEach((i) => all.push({ ...i, _adapter: hrh, _sourceTag: "hrh" }));
      }

      return all;
    },
    toEngram(item) {
      return item._adapter.toEngram(item);
    },
  };
}

// --- CLI ------------------------------------------------------------------
function arg(args, flag) { const i = args.indexOf(flag); return i === -1 ? null : args[i + 1]; }

async function main(argv) {
  const args = argv.slice(2);
  const dryRun = !args.includes("--apply");
  const dlezoDir = arg(args, "--dlezo");
  const vijayDir = arg(args, "--vijay");
  const hrhDir   = arg(args, "--hrh");
  // furai is attempted but 404 — accepted gracefully via existsSync check.
  const furaiDir = arg(args, "--furai");

  if (!dlezoDir && !vijayDir && !hrhDir && !furaiDir) {
    console.error(
      "usage: crawl-more-subagents.mjs --furai <dir> --dlezo <dir> --vijay <dir> --hrh <dir> [--apply]",
    );
    process.exit(2);
  }

  if (furaiDir && !existsSync(furaiDir)) {
    console.log(`[skip] --furai dir not found: ${furaiDir} (repo 404 — skipped gracefully)`);
  }

  const adapter = moreSubagentsAdapter({
    dlezoDir: dlezoDir || "",
    vijayDir: vijayDir || "",
    hrhDir:   hrhDir   || "",
  });

  const results = await runCollection(adapter, { dryRun });

  // Per-repo breakdown summary
  const bySource = { dlezo: 0, vijay: 0, hrh: 0 };
  for (const r of results) {
    const tag = r.frontmatter.tags[0]; // first tag = source
    if (tag in bySource) bySource[tag]++;
  }
  console.log(`  breakdown: dlezo=${bySource.dlezo} vijay=${bySource.vijay} hrh=${bySource.hrh}`);

  if (!dryRun && results.length > 0) {
    // Sample 3 slugs
    const sample = results.slice(0, 3).map((r) => r.frontmatter.name);
    console.log(`  sample slugs: ${sample.join(", ")}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
