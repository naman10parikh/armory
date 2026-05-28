#!/usr/bin/env node
// Engram adapter: naman10parikh/mcp-connect-galaxy -> incoming/mcp-galaxy/
// Source:  src/data/servers.ts  (MCPServer[] TypeScript literal in the repo)
// Output:  one engram stub per server entry.
// Run:     node ingest/crawl-galaxy.mjs [--repo /tmp/eng-galaxy] [--apply]
//
// OWNERSHIP: touches ONLY ingest/crawl-galaxy.mjs and incoming/mcp-galaxy/.
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
const SOURCE_NAME  = "mcp-galaxy";
const SOURCE_OWNER = "naman10parikh";
const SOURCE_REPO  = `${SOURCE_OWNER}/mcp-connect-galaxy`;

// --- Helpers (mirrors crawl-awesome-cc.mjs pattern) -------------------------

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

// Extract github.com/owner/repo from a URL ("" if not github).
function extractGithubRepo(url) {
  const m = (url || "").match(/github\.com\/([^/]+\/[^/#? ]+)/);
  return m ? m[1].replace(/\.git$/, "") : "";
}

// --- Parse servers.ts: extract the MCPServer[] literal without tsc ----------
// Strategy: read the file as text, find each { id:"...", ... } object block,
// pull scalar fields with regex. No eval, no tsc required.
function parseServersDotTs(raw) {
  // Strip TypeScript type annotations so we handle plain JS object literals.
  // Remove lines like `export type MCPServer = { ... };` (multi-line block).
  // We work on the exported `servers` array.
  const arrayMatch = raw.match(/export const servers[^=]*=\s*\[([\s\S]*)\];?\s*$/m);
  if (!arrayMatch) throw new Error("Could not find `export const servers` array in servers.ts");

  const arrayBody = arrayMatch[1];

  // Split into individual object literals by finding top-level `{...}` blocks.
  const objects = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < arrayBody.length; i++) {
    if (arrayBody[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (arrayBody[i] === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        objects.push(arrayBody.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return objects.map((obj) => {
    // Extract simple string fields via regex: field: "value" or field: `value`
    const str = (field) => {
      const m = obj.match(new RegExp(`${field}:\\s*["'\`]([^"'\`]*)["'\`]`));
      return m ? m[1].trim() : "";
    };
    // Extract tags array: tags: ["a", "b", ...]
    const tagsMatch = obj.match(/tags:\s*\[([^\]]*)\]/);
    const tags = tagsMatch
      ? tagsMatch[1].match(/["'`]([^"'`]+)["'`]/g)?.map((t) => t.replace(/["'`]/g, "").trim()) ?? []
      : [];

    return {
      id:          str("id"),
      name:        str("name"),
      description: str("description"),
      repoUrl:     str("repoUrl"),
      version:     str("version"),
      tags,
    };
  }).filter((s) => s.id || s.name); // drop any empty objects
}

// --- Main adapter -----------------------------------------------------------

export function galaxyAdapter({ repoDir, existingNames = new Set() }) {
  const tsPath = join(repoDir, "src", "data", "servers.ts");
  const seen = new Set(existingNames);

  return {
    name: SOURCE_NAME,
    type: "mcps",

    async fetch() {
      if (!existsSync(tsPath)) {
        throw new Error(`servers.ts not found at ${tsPath}. Did you clone the repo?`);
      }
      const raw = readFileSync(tsPath, "utf8");
      return parseServersDotTs(raw);
    },

    toEngram(server) {
      const displayName = scrub(server.name || server.id || "untitled");
      const desc        = scrub(server.description || displayName);
      const repoUrl     = (server.repoUrl || "").trim();
      const sourceRepo  = extractGithubRepo(repoUrl);
      const serverTags  = (server.tags || []).map(scrub).filter(Boolean);

      const base  = slugify(displayName);
      const uname = uniqueName(base, seen);

      const frontmatter = {
        name:        uname,
        type:        "mcps",
        description: desc,
        source_repo: sourceRepo,
        source_url:  repoUrl,
        license:     "unknown",
        cli_compat:  ["claude", "cursor", "codex", "opencode", "gemini"],
        maturity:    "experimental",
        stars:       null,
        eval_score:  null,
        verified_at: VERIFIED_AT,
        related:     [],
        tags:        ["mcp-galaxy", "mcp", ...serverTags],
      };

      const body =
        `## What it is\n${desc}\n\n` +
        `## When to use it\n${desc}\n\n` +
        `## How to install / invoke\nSee the source repo README.\n\n` +
        `## Notes\nDiscovered via [\`${SOURCE_REPO}\`](https://github.com/${SOURCE_REPO}). ` +
        `Pending verify -> promote.`;

      return { frontmatter, body };
    },
  };
}

// --- Run: fetch -> toEngram -> self-validate -> write -----------------------

export async function run({ repoDir, dryRun = true, log = console.log } = {}) {
  const adapter = galaxyAdapter({ repoDir });
  const items   = await adapter.fetch();
  const outDir  = join(INCOMING, SOURCE_NAME);

  if (!dryRun) resetDir(outDir);

  const written = [];

  for (const item of items) {
    const { frontmatter, body } = adapter.toEngram(item);
    const md = toMarkdown({ frontmatter, body });

    // Self-validate: parseFrontmatter must round-trip the name field exactly.
    const fm = parseFrontmatter(md);
    if (fm.name !== frontmatter.name) {
      throw new Error(
        `name roundtrip mismatch: expected "${frontmatter.name}", got "${fm.name}"`,
      );
    }

    const file = join(outDir, `${frontmatter.name}.md`);
    if (dryRun) {
      log(`[dry-run] would write ${frontmatter.name}.md  (tags: ${frontmatter.tags.join(", ")})`);
    } else {
      writeFileSync(file, md);
      log(`wrote ${file}`);
    }
    written.push({ file, frontmatter, md });
  }

  const prefix = dryRun ? "[dry-run] " : "";
  log(`\n${prefix}${SOURCE_NAME}: ${written.length} stub(s) -> incoming/${SOURCE_NAME}/`);

  return written;
}

// --- CLI -------------------------------------------------------------------

function arg(argv, flag) {
  const i = argv.indexOf(flag);
  return i === -1 ? null : argv[i + 1] ?? null;
}

async function main(argv) {
  const args    = argv.slice(2);
  const dryRun  = !args.includes("--apply");
  // Default repo path matches the clone target from the task spec.
  const repo    = arg(args, "--repo") ?? "/tmp/eng-galaxy";

  if (!existsSync(repo)) {
    console.error(`repo dir not found: ${repo}`);
    console.error("clone first: git clone --depth 1 https://github.com/naman10parikh/mcp-connect-galaxy /tmp/eng-galaxy");
    process.exit(2);
  }

  await run({ repoDir: repo, dryRun });
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
