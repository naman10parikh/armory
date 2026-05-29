#!/usr/bin/env node
// Component Smithery crawler. Pulls MCP server listings from the Smithery registry
// (registry.smithery.ai) and emits one component stub per server into incoming/smithery/.
//
// Pagination: fetches all pages up to PAGE_CAP (20) × pageSize 100 = ~2000 servers.
// Fallback: if the API is unreachable after 2 attempts, clones
//   https://github.com/smithery-ai/registry --depth 1 into /tmp/eng-smithery
//   and parses whatever JSON server list it contains.
//
// Run:
//   node ingest/crawl-smithery.mjs           # dry-run
//   node ingest/crawl-smithery.mjs --apply   # write to incoming/smithery/
import {
  mkdirSync, writeFileSync, existsSync, rmSync, readdirSync, readFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-05-27";
const PAGE_CAP = 20;
const PAGE_SIZE = 100;
const API_BASE = "https://registry.smithery.ai";
const FALLBACK_REPO = "https://github.com/smithery-ai/registry";
const FALLBACK_DIR = "/tmp/eng-smithery";

// --- Shared helpers (mirrors crawl-collections.mjs) --------------------------

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

// --- API fetcher -------------------------------------------------------------

async function fetchPage(page) {
  const url = `${API_BASE}/servers?page=${page}&pageSize=${PAGE_SIZE}`;
  const res = await fetch(url, {
    headers: { "Accept": "application/json", "User-Agent": "component-crawler/1.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

async function fetchAllViaApi() {
  // Try page 1 twice before giving up.
  let firstPage;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      firstPage = await fetchPage(1);
      break;
    } catch (err) {
      if (attempt === 2) throw err;
      console.warn(`[smithery] API attempt ${attempt} failed: ${err.message} — retrying…`);
    }
  }

  const totalPages = Math.min(firstPage?.pagination?.totalPages ?? 1, PAGE_CAP);
  const servers = [...(firstPage?.servers ?? [])];

  for (let p = 2; p <= totalPages; p++) {
    try {
      const page = await fetchPage(p);
      servers.push(...(page?.servers ?? []));
    } catch (err) {
      console.warn(`[smithery] page ${p} failed (${err.message}), stopping pagination`);
      break;
    }
  }
  return servers;
}

// --- GitHub fallback ---------------------------------------------------------

function fetchAllViaGitHub() {
  console.warn("[smithery] Falling back to GitHub clone of smithery-ai/registry…");
  if (existsSync(FALLBACK_DIR)) rmSync(FALLBACK_DIR, { recursive: true, force: true });
  execSync(`git clone --depth 1 ${FALLBACK_REPO} ${FALLBACK_DIR}`, { stdio: "pipe" });

  // Look for a JSON file that contains server records.
  // Common patterns: servers.json, registry.json, data/*.json, packages.json.
  const candidates = [];
  function findJson(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (entry.endsWith(".json") && !entry.includes("package") && !entry.includes("tsconfig") && !entry.includes("eslint")) {
        candidates.push(full);
      }
    }
  }
  findJson(FALLBACK_DIR);
  findJson(join(FALLBACK_DIR, "data"));
  findJson(join(FALLBACK_DIR, "src"));
  findJson(join(FALLBACK_DIR, "registry"));

  for (const f of candidates) {
    try {
      const raw = JSON.parse(readFileSync(f, "utf8"));
      const arr = Array.isArray(raw) ? raw : (raw.servers ?? raw.items ?? raw.packages ?? null);
      if (Array.isArray(arr) && arr.length > 0) {
        console.warn(`[smithery] found ${arr.length} records in ${f}`);
        return arr;
      }
    } catch { /* skip */ }
  }
  throw new Error("GitHub fallback: no parseable server list found in the cloned repo");
}

// --- Normalise one raw record (API or fallback shape) -----------------------

function normaliseRecord(raw) {
  // API shape: { qualifiedName, displayName, description, homepage, useCount, ... }
  // Fallback shapes vary; try common field names.
  const name = raw.displayName ?? raw.name ?? raw.title ?? raw.qualifiedName ?? "untitled";
  const qualifiedName = raw.qualifiedName ?? raw.qualified_name ?? raw.slug ?? "";
  const description = raw.description ?? raw.summary ?? name;
  const homepage = raw.homepage ?? raw.url ?? raw.source_url ?? "";
  const useCount = raw.useCount ?? raw.use_count ?? raw.stars ?? null;
  return { name, qualifiedName, description, homepage, useCount };
}

// --- Adapter (follows crawl-collections.mjs runCollection contract) ----------

function smitheryAdapter() {
  const adapterName = "smithery";
  const type = "mcps";
  const seen = new Set();
  let usedFallback = false;
  let rawRecords = [];

  return {
    name: adapterName,
    type,

    async fetch() {
      try {
        rawRecords = await fetchAllViaApi();
        console.log(`[smithery] API: fetched ${rawRecords.length} records`);
      } catch (apiErr) {
        console.warn(`[smithery] API unreachable: ${apiErr.message}`);
        try {
          rawRecords = fetchAllViaGitHub();
          usedFallback = true;
        } catch (fbErr) {
          throw new Error(`Smithery unreachable — API: ${apiErr.message} | GitHub: ${fbErr.message}`);
        }
      }
      return rawRecords;
    },

    toComponent(raw) {
      const rec = normaliseRecord(raw);
      const base = slugify(rec.name || rec.qualifiedName);
      const uname = uniqueName(base, seen);

      const rawDesc = rec.description || rec.name || "MCP server from the Smithery registry.";
      const desc = scrub(rawDesc).slice(0, 300) || `${rec.name} MCP server.`;

      // Build source_url: prefer homepage, fall back to smithery page.
      const smitheryUrl = rec.qualifiedName
        ? `https://smithery.ai/server/${rec.qualifiedName}`
        : "https://smithery.ai";
      const sourceUrl = rec.homepage || smitheryUrl;

      // Extract GitHub repo path if the homepage is a github.com URL.
      const ghMatch = sourceUrl.match(/github\.com\/([^/#?]+\/[^/#?]+)/);
      const sourceRepo = ghMatch ? ghMatch[1] : "";

      const stars = typeof rec.useCount === "number" ? rec.useCount : null;

      return {
        frontmatter: {
          name: uname,
          type,
          description: desc,
          source_repo: sourceRepo,
          source_url: sourceUrl,
          license: "unknown",
          cli_compat: ["claude", "cursor", "codex", "opencode", "gemini"],
          maturity: "experimental",
          stars,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: ["smithery", "mcp"],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\n${desc}\n\n` +
          `## How to install / invoke\nSee [Smithery](${smitheryUrl}) for the install config.\n\n` +
          `## Notes\nDiscovered via the Smithery MCP registry (${usedFallback ? "GitHub fallback" : "live API"}). Pending verify -> promote.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-collections.mjs) ---------------------------

async function runCollection(adapter, { dryRun = true, outDir = INCOMING, log = console.log } = {}) {
  const items = await adapter.fetch();
  const dir = join(outDir, adapter.name);
  if (!dryRun) resetDir(dir);
  const written = [];
  for (const item of items) {
    const { frontmatter, body } = adapter.toComponent(item);
    const file = join(dir, `${frontmatter.name}.md`);
    const md = toMarkdown({ frontmatter, body });
    // Self-validate every stub against the catalog parser before writing.
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
    const adapter = smitheryAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[smithery] No stubs produced — check source availability.");
      process.exit(1);
    }
    // Spot-check: print the first stub's slug + parsed name.
    const first = written[0];
    console.log(`[smithery] sample: ${first.frontmatter.name}`);
  } catch (err) {
    console.error(`[smithery] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
