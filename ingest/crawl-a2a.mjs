#!/usr/bin/env node
// Component adapter: naman10parikh/awesome-a2a-servers -> incoming/a2a-servers/
// Source:  README.md bullet list  ("* [Name](url) — description" lines)
// Output:  one component stub per linked entry (github URLs or other web links).
// Run:     node ingest/crawl-a2a.mjs [--apply]
//          Repo is pre-cloned at /tmp/eng-a2a  (git clone --depth 1 …)
//
// OWNERSHIP: touches ONLY ingest/crawl-a2a.mjs and incoming/a2a-servers/.
// Does NOT edit brain/, catalog.json, package.json, or other incoming/ dirs.
// Does NOT promote (stays in incoming/).

import {
  mkdirSync, writeFileSync, readFileSync, existsSync, rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT       = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING   = join(ROOT, "incoming");
const VERIFIED_AT  = "2026-05-28";
const SOURCE_NAME  = "a2a-servers";
const SOURCE_OWNER = "naman10parikh";
const SOURCE_REPO  = `${SOURCE_OWNER}/awesome-a2a-servers`;

// Default repo dir (pre-cloned by the caller or CI).
const DEFAULT_REPO_DIR = "/tmp/eng-a2a";

// --- Section heading -> component type mapping --------------------------------
// A2A entries are predominantly agent-to-agent server implementations; the
// closest component type for most is "mcps" (protocol servers / integrations).
// Frameworks and utilities map to "workflows"; documentation to "workflows";
// client/tool entries to "clis-tools".
const SECTION_TO_TYPE = {
  "Official Resources":              "workflows",   // links to google/A2A spec
  "Clients":                         "clis-tools",
  "Tutorials & Learning Resources":  "workflows",
  "Server Implementations":          "mcps",
  "Frameworks":                      "workflows",
  "Utilities":                       "clis-tools",
  "Libraries":                       "mcps",
  "Tools":                           "clis-tools",
  "Documentation":                   "workflows",
  "Tips & Tricks":                   "workflows",
  "_default":                        "mcps",
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

function extractGithubRepo(url) {
  const m = (url || "").match(/github\.com\/([^/]+\/[^/#? ]+)/);
  return m ? m[1].replace(/\.git$/, "") : "";
}

// Strip emoji characters and language-indicator prefixes
// (e.g. "🐍 [Name](...)" -> "[Name](...)").
function stripEmoji(s) {
  // Remove leading emoji + optional space
  return s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}️‍*#0-9⃣]+\s*/gu, "");
}

// --- README parser ---------------------------------------------------------
// Walks the README line by line, tracking the current H2/H3 section heading,
// and collects every "* [Name](url)" bullet that has a parseable link.
function parseReadme(raw) {
  const lines = raw.split(/\r?\n/);
  // Bullet pattern: optional emoji/spaces then "* [Title](url) — optional desc"
  const bulletRe = /^\*\s+(.*\[([^\]]+)\]\(([^)]+)\).*)/;
  // Heading pattern
  const h2Re = /^##\s+(.+)/;
  const h3Re = /^###\s+(.+)/;

  let section = "_default";
  const items = [];

  for (const line of lines) {
    const h2 = line.match(h2Re);
    if (h2) { section = h2[1].replace(/[^\w &]/g, "").trim(); continue; }
    const h3 = line.match(h3Re);
    if (h3) { section = h3[1].replace(/[^\w &]/g, "").trim(); continue; }

    const bm = line.match(bulletRe);
    if (!bm) continue;
    const content = stripEmoji(bm[1]);
    // Re-parse after emoji stripping to get clean title + url
    const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let lm;
    while ((lm = linkRe.exec(content)) !== null) links.push({ title: lm[1], url: lm[2] });
    if (!links.length) continue;
    // Skip TOC anchor-only links (href starts with #)
    if (links[0].url.startsWith("#")) continue;

    // Use the first linked text as the display name; extract description from
    // the text after the last ")" and a dash separator if present.
    const firstLink = links[0];
    const afterLink = content.replace(/.*\)\s*[-—–]\s*/, "").trim();
    // If afterLink is the same as the whole content (no separator), use title.
    const rawDesc = (afterLink && afterLink !== content) ? afterLink : firstLink.title;

    items.push({
      title:       firstLink.title,
      url:         firstLink.url,
      description: rawDesc,
      section,
    });
  }
  return items;
}

// --- Main adapter ----------------------------------------------------------

export function a2aAdapter({ repoDir = DEFAULT_REPO_DIR, existingNames = new Set() } = {}) {
  const readmePath = join(repoDir, "README.md");
  const seen = new Set(existingNames);

  return {
    name: SOURCE_NAME,
    type: null, // per-item, derived from section

    async fetch() {
      if (!existsSync(readmePath)) {
        throw new Error(`README.md not found at ${readmePath}. Did you clone the repo?`);
      }
      const raw = readFileSync(readmePath, "utf8");
      return parseReadme(raw);
    },

    toComponent(item) {
      const type = SECTION_TO_TYPE[item.section] ?? SECTION_TO_TYPE["_default"];
      const desc = scrub(item.description || item.title);
      const sourceRepo = extractGithubRepo(item.url);
      const sectionTag = slugify(item.section) || "general";

      const base  = slugify(scrub(item.title));
      const uname = uniqueName(base, seen);

      const frontmatter = {
        name:        uname,
        type,
        description: desc,
        source_repo: sourceRepo,
        source_url:  item.url,
        license:     "unknown",
        cli_compat:  ["claude", "cursor", "codex", "opencode", "gemini"],
        maturity:    "experimental",
        stars:       null,
        eval_score:  null,
        verified_at: VERIFIED_AT,
        related:     [],
        tags:        ["a2a", "agent-to-agent", sectionTag],
      };

      const body =
        `## What it is\n${desc}\n\n` +
        `## When to use it\n${desc}\n\n` +
        `## How to install / invoke\nSee the source repo README.\n\n` +
        `## Notes\nDiscovered via [\`${SOURCE_REPO}\`](https://github.com/${SOURCE_REPO}) — ` +
        `section: ${item.section}. Pending verify -> promote.`;

      return { frontmatter, body };
    },
  };
}

// --- Run: fetch -> toComponent -> validate -> write ---------------------------

export async function run({ repoDir = DEFAULT_REPO_DIR, dryRun = true, log = console.log } = {}) {
  const adapter = a2aAdapter({ repoDir });
  const items   = await adapter.fetch();
  const outDir  = join(INCOMING, SOURCE_NAME);

  if (!dryRun) resetDir(outDir);

  const written    = [];
  const typeCounts = {};
  const errors     = [];

  for (const item of items) {
    const { frontmatter, body } = adapter.toComponent(item);
    const md = toMarkdown({ frontmatter, body });

    // Self-validate against catalog parser.
    const fm = parseFrontmatter(md);
    if (fm.name !== frontmatter.name) {
      errors.push(`name roundtrip mismatch: expected "${frontmatter.name}", got "${fm.name}"`);
      continue;
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
  if (errors.length) {
    log(`\n${prefix}ERRORS (${errors.length}):`);
    for (const e of errors) log(`  ! ${e}`);
  }

  return written;
}

// --- CLI ------------------------------------------------------------------

async function main(argv) {
  const args   = argv.slice(2);
  const dryRun = !args.includes("--apply");
  // Allow --repo override; fall back to DEFAULT_REPO_DIR.
  const repoIdx = args.indexOf("--repo");
  const repoDir = repoIdx !== -1 ? args[repoIdx + 1] : DEFAULT_REPO_DIR;

  await run({ repoDir, dryRun });
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
