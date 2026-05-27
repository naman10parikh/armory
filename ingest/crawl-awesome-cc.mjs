#!/usr/bin/env node
// Engram adapter: hesreallyhim/awesome-claude-code -> incoming/awesome-claude-code/
// Source:  THE_RESOURCES_TABLE.csv  (canonical data — 201+ active entries as of 2026-05-27)
// Output:  one engram stub per active, non-removed row.
// Run:     node ingest/crawl-awesome-cc.mjs --repo /tmp/eng-acc [--apply]
//
// OWNERSHIP: touches ONLY ingest/crawl-awesome-cc.mjs and incoming/awesome-claude-code/.
// Does NOT edit brain/, catalog.json, package.json, or other incoming/ dirs.
// Does NOT promote (stays in incoming/).

import {
  mkdirSync, writeFileSync, readFileSync, existsSync, rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-05-27";
const SOURCE_NAME = "awesome-claude-code";
const SOURCE_OWNER = "hesreallyhim";
const SOURCE_REPO = `${SOURCE_OWNER}/${SOURCE_NAME}`;

// --- Category -> engram type mapping ---------------------------------------
// "Agent Skills" lives closest to "skills" in the engram taxonomy.
const CATEGORY_TO_TYPE = {
  "Slash-Commands":               "workflows",
  "CLAUDE.md Files":              "claudemd-rules",
  "Hooks":                        "hooks",
  "Agent Skills":                 "skills",
  "Workflows & Knowledge Guides": "workflows",
  "Tooling":                      "clis-tools",
  "Status Lines":                 "clis-tools",
  "Alternative Clients":          "clis-tools",
  "Output Styles":                "clis-tools",
  "Official Documentation":       "workflows",
  // catch-all
  "_default":                     "workflows",
};

// --- Shared helpers --------------------------------------------------------

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

function oneLine(s) { return String(s || "").replace(/\s+/g, " ").trim(); }

function scrub(s) {
  return oneLine(s)
    .replace(/\/Users\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/home\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/root(\/[^\s]*)?/g, "<path>");
}

// Extract github.com/owner/repo from a URL (returns "" if not a github URL).
function extractGithubRepo(url) {
  const m = (url || "").match(/github\.com\/([^/]+\/[^/#? ]+)/);
  return m ? m[1].replace(/\.git$/, "") : "";
}

// Minimal CSV parser — handles double-quoted fields (RFC 4180).
// Returns array of {header: value} objects.
function parseCsv(raw) {
  const lines = raw.split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCsvLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ""; });
    rows.push(row);
  }
  return rows;
}

// Split one CSV line respecting double-quoted fields (may contain commas/newlines).
// This is a streaming character-level parse — no regex magic.
function splitCsvLine(line) {
  const fields = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }   // escaped ""
        else { inQuote = false; }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ",") { fields.push(cur); cur = ""; }
      else { cur += ch; }
    }
  }
  fields.push(cur);
  return fields;
}

// --- Main adapter ----------------------------------------------------------

export function awesomeCcAdapter({ repoDir, existingNames = new Set() }) {
  const csvPath = join(repoDir, "THE_RESOURCES_TABLE.csv");
  const seen = new Set(existingNames);

  return {
    name: SOURCE_NAME,
    type: null, // per-item type derived from Category

    async fetch() {
      if (!existsSync(csvPath)) {
        throw new Error(`CSV not found at ${csvPath}. Did you clone the repo?`);
      }
      const raw = readFileSync(csvPath, "utf8");
      const rows = parseCsv(raw);

      // Keep only active, non-removed entries.
      return rows.filter(
        (r) =>
          r["Active"]?.trim().toUpperCase() === "TRUE" &&
          r["Removed From Origin"]?.trim().toUpperCase() !== "TRUE",
      );
    },

    toEngram(row) {
      const displayName = scrub(row["Display Name"] || "untitled");
      const category    = (row["Category"] || "").trim();
      const type        = CATEGORY_TO_TYPE[category] ?? CATEGORY_TO_TYPE["_default"];
      const primaryUrl  = (row["Primary Link"] || "").trim();
      const license     = scrub(row["License"] || "unknown");
      const desc        = scrub(row["Description"] || displayName);
      const sourceRepo  = extractGithubRepo(primaryUrl);

      // Derive a section tag from the category for search/filtering.
      const sectionTag = slugify(category) || "general";

      const base  = slugify(displayName);
      const uname = uniqueName(base, seen);

      const frontmatter = {
        name:        uname,
        type,
        description: desc,
        source_repo: sourceRepo,
        source_url:  primaryUrl,
        license,
        cli_compat:  ["claude"],
        maturity:    "experimental",
        stars:       null,
        eval_score:  null,
        verified_at: VERIFIED_AT,
        related:     [],
        tags:        [SOURCE_NAME, sectionTag],
      };

      const body =
        `## What it is\n${desc}\n\n` +
        `## When to use it\n${desc}\n\n` +
        `## How to install / invoke\nSee the source repo or link above.\n\n` +
        `## Notes\nDiscovered via [\`${SOURCE_REPO}\`](https://github.com/${SOURCE_REPO}) — ` +
        `category: ${category}. Pending verify -> promote.`;

      return { frontmatter, body };
    },
  };
}

// --- Run: fetch -> toEngram -> validate -> write ---------------------------

export async function run({ repoDir, dryRun = true, log = console.log } = {}) {
  const adapter = awesomeCcAdapter({ repoDir });
  const items = await adapter.fetch();
  const outDir = join(INCOMING, SOURCE_NAME);

  if (!dryRun) resetDir(outDir);

  const written = [];
  const typeCounts = {};

  for (const item of items) {
    const { frontmatter, body } = adapter.toEngram(item);
    const md   = toMarkdown({ frontmatter, body });

    // Self-validate against catalog parser (throw on mismatch).
    const fm = parseFrontmatter(md);
    if (fm.name !== frontmatter.name) {
      throw new Error(
        `name roundtrip mismatch: expected "${frontmatter.name}", got "${fm.name}"`,
      );
    }

    const file = join(outDir, `${frontmatter.name}.md`);
    if (dryRun) {
      log(`[dry-run] would write ${frontmatter.name}.md  (type: ${frontmatter.type})`);
    } else {
      writeFileSync(file, md);
    }
    typeCounts[frontmatter.type] = (typeCounts[frontmatter.type] || 0) + 1;
    written.push({ file, frontmatter, md });
  }

  const prefix = dryRun ? "[dry-run] " : "";
  log(`\n${prefix}${SOURCE_NAME}: ${written.length} stub(s) -> incoming/${SOURCE_NAME}/`);
  log(`${prefix}type breakdown:`);
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    log(`  ${count.toString().padStart(3)}  ${type}`);
  }

  return written;
}

// --- CLI ------------------------------------------------------------------

function arg(argv, flag) {
  const i = argv.indexOf(flag);
  return i === -1 ? null : argv[i + 1] ?? null;
}

async function main(argv) {
  const args   = argv.slice(2);
  const dryRun = !args.includes("--apply");
  const repo   = arg(args, "--repo");

  if (!repo) {
    console.error("usage: node ingest/crawl-awesome-cc.mjs --repo <cloned-repo-dir> [--apply]");
    console.error("  e.g. node ingest/crawl-awesome-cc.mjs --repo /tmp/eng-acc --apply");
    process.exit(2);
  }

  await run({ repoDir: repo, dryRun });
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
