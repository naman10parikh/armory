#!/usr/bin/env node
// Engram Glama crawler. Pulls MCP server listings from the Glama registry
// (glama.ai/api/mcp/v1/servers) and emits one engram stub per server into
// incoming/glama/.
//
// Pagination: cursor-based via pageInfo.endCursor / hasNextPage.
//   Caps at PAGE_CAP (20) pages × first=100 = ~2000 servers.
// Fallback: if the API is unreachable after 2 attempts, reports cleanly and exits.
//
// Run:
//   node ingest/crawl-glama.mjs           # dry-run
//   node ingest/crawl-glama.mjs --apply   # write to incoming/glama/
import {
  mkdirSync, writeFileSync, existsSync, rmSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-05-27";
const PAGE_CAP = 20;
const PAGE_SIZE = 100;
const API_BASE = "https://glama.ai/api/mcp/v1/servers";

// --- Shared helpers -----------------------------------------------------------

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

// --- API fetcher --------------------------------------------------------------

async function fetchPage(cursor) {
  const url = cursor
    ? `${API_BASE}?first=${PAGE_SIZE}&after=${encodeURIComponent(cursor)}`
    : `${API_BASE}?first=${PAGE_SIZE}`;
  const res = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": "engram-crawler/1.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

async function fetchAllViaApi() {
  // Try first page twice before giving up.
  let firstPage;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      firstPage = await fetchPage(null);
      break;
    } catch (err) {
      if (attempt === 2) throw err;
      console.warn(`[glama] API attempt ${attempt} failed: ${err.message} — retrying…`);
    }
  }

  const servers = [...(firstPage?.servers ?? [])];
  let { hasNextPage, endCursor } = firstPage?.pageInfo ?? {};
  let pages = 1;

  while (hasNextPage && endCursor && pages < PAGE_CAP) {
    try {
      const page = await fetchPage(endCursor);
      servers.push(...(page?.servers ?? []));
      hasNextPage = page?.pageInfo?.hasNextPage ?? false;
      endCursor = page?.pageInfo?.endCursor ?? null;
      pages++;
    } catch (err) {
      console.warn(`[glama] page ${pages + 1} failed (${err.message}), stopping pagination`);
      break;
    }
  }

  console.log(`[glama] API: fetched ${servers.length} records across ${pages} page(s)`);
  return servers;
}

// --- Normalise one raw record -------------------------------------------------
//
// API shape (observed 2026-05-27):
//   { id, name, slug, namespace, description, url, repository: { url }, spdxLicense, attributes, tools }

function normaliseRecord(raw) {
  const name = raw.name ?? raw.slug ?? "untitled";
  const description = raw.description ?? name;
  // Glama's own page URL for this server.
  const glamaUrl = raw.url ?? `https://glama.ai/mcp/servers/${raw.id ?? ""}`;
  // Repository URL (GitHub etc.).
  const repoUrl = raw.repository?.url ?? "";
  const license = raw.spdxLicense?.name ?? "unknown";
  return { name, description, glamaUrl, repoUrl, license };
}

// --- Adapter ------------------------------------------------------------------

function glamaAdapter() {
  const adapterName = "glama";
  const type = "mcps";
  const seen = new Set();

  return {
    name: adapterName,
    type,

    async fetch() {
      try {
        return await fetchAllViaApi();
      } catch (apiErr) {
        // No GitHub fallback for Glama (no known public registry repo).
        throw new Error(`Glama API unreachable — ${apiErr.message}`);
      }
    },

    toEngram(raw) {
      const rec = normaliseRecord(raw);
      const base = slugify(rec.name);
      const uname = uniqueName(base, seen);

      const desc = scrub(rec.description).slice(0, 300) || `${rec.name} MCP server.`;

      // Prefer GitHub repo as source_url; fall back to the Glama page.
      const sourceUrl = rec.repoUrl || rec.glamaUrl;
      const ghMatch = sourceUrl.match(/github\.com\/([^/#?]+\/[^/#?]+)/);
      const sourceRepo = ghMatch ? ghMatch[1] : "";

      return {
        frontmatter: {
          name: uname,
          type,
          description: desc,
          source_repo: sourceRepo,
          source_url: sourceUrl,
          license: rec.license,
          cli_compat: ["claude", "cursor", "codex", "opencode", "gemini"],
          maturity: "experimental",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: ["glama", "mcp"],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\n${desc}\n\n` +
          `## How to install / invoke\nSee [Glama](${rec.glamaUrl}) for the install config.\n\n` +
          `## Notes\nDiscovered via the Glama MCP registry (live API). Pending verify -> promote.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-smithery.mjs) ------------------------------

async function runCollection(adapter, { dryRun = true, outDir = INCOMING, log = console.log } = {}) {
  const items = await adapter.fetch();
  const dir = join(outDir, adapter.name);
  if (!dryRun) resetDir(dir);
  const written = [];
  for (const item of items) {
    const { frontmatter, body } = adapter.toEngram(item);
    const file = join(dir, `${frontmatter.name}.md`);
    const md = toMarkdown({ frontmatter, body });
    // Self-validate every stub via the catalog parser before writing.
    const fm = parseFrontmatter(md);
    if (fm.name !== frontmatter.name) {
      throw new Error(`name roundtrip mismatch for ${file}: ${fm.name} != ${frontmatter.name}`);
    }
    if (!dryRun) writeFileSync(file, md);
    written.push({ file, frontmatter, md });
  }
  log(`${dryRun ? "[dry-run] " : ""}${adapter.name}: ${written.length} stub(s) -> incoming/${adapter.name}/`);
  return written;
}

// --- CLI ---------------------------------------------------------------------

async function main(argv) {
  const args = argv.slice(2);
  const dryRun = !args.includes("--apply");
  try {
    const adapter = glamaAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[glama] No stubs produced — check source availability.");
      process.exit(1);
    }
    // Spot-check: print the first stub's slug + parsed name.
    const first = written[0];
    console.log(`[glama] sample: ${first.frontmatter.name}`);
  } catch (err) {
    console.error(`[glama] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
