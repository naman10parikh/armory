#!/usr/bin/env node
// Component mcp.so crawler. Pulls MCP server listings from the mcp.so sitemap index
// (no public JSON API exists; the site is a Next.js/Supabase app). Parses server
// URLs from all sitemap_projects_N.xml files to extract name + author, emits one
// component stub per server into incoming/mcpso/.
//
// Sitemap URL shape: https://mcp.so/server/<name>/<author>
// Author maps to GitHub owner when the server has a source repo; otherwise used
// as-is for the source_url.
//
// CAP: first 1500 /server/ entries across all sitemaps.
// Fallback: if sitemaps are unreachable after 2 attempts, clones
//   https://github.com/chatmcp/mcpso --depth 1 into /tmp/eng-mcpso
//   and derives stubs from the app's route structure.
//   If that also fails, reports cleanly and exits non-zero.
//
// Run:
//   node ingest/crawl-mcpso.mjs           # dry-run
//   node ingest/crawl-mcpso.mjs --apply   # write to incoming/mcpso/
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
const SITEMAP_BASE = "https://mcp.so";
const SITEMAP_INDEX = `${SITEMAP_BASE}/sitemap.xml`;
const MAX_SERVERS = 1500;
const FALLBACK_REPO = "https://github.com/chatmcp/mcpso";
const FALLBACK_DIR = "/tmp/eng-mcpso";

// --- Shared helpers ----------------------------------------------------------

function uniqueName(base, seen) {
  const name = base || "untitled";
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

// --- Sitemap fetcher ---------------------------------------------------------

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "Accept": "text/xml, application/xml, */*", "User-Agent": "component-crawler/1.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

// Parse <loc> entries from an XML sitemap body.
function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
}

// Fetch the sitemap index and return all sitemap_projects_N.xml URLs.
async function getProjectSitemapUrls() {
  const xml = await fetchText(SITEMAP_INDEX);
  const locs = extractLocs(xml);
  return locs.filter(u => u.includes("sitemap_projects_"));
}

// Collect /server/ URLs from a single projects sitemap, up to `remaining` count.
async function getServerUrlsFromSitemap(url, remaining) {
  const xml = await fetchText(url);
  const locs = extractLocs(xml);
  const servers = locs.filter(l => l.includes("/server/"));
  return servers.slice(0, remaining);
}

// Main sitemap fetch — collects up to MAX_SERVERS /server/ URLs across all project sitemaps.
async function fetchAllViaApi() {
  let projectSitemaps;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      projectSitemaps = await getProjectSitemapUrls();
      break;
    } catch (err) {
      if (attempt === 2) throw err;
      console.warn(`[mcpso] sitemap index attempt ${attempt} failed: ${err.message} — retrying…`);
    }
  }

  console.log(`[mcpso] found ${projectSitemaps.length} project sitemap(s): ${projectSitemaps.join(", ")}`);

  const serverUrls = [];
  for (const sitemapUrl of projectSitemaps) {
    const remaining = MAX_SERVERS - serverUrls.length;
    if (remaining <= 0) break;
    try {
      const batch = await getServerUrlsFromSitemap(sitemapUrl, remaining);
      console.log(`[mcpso] ${sitemapUrl}: ${batch.length} server URLs`);
      serverUrls.push(...batch);
    } catch (err) {
      console.warn(`[mcpso] sitemap ${sitemapUrl} failed (${err.message}), skipping`);
    }
  }

  if (serverUrls.length === 0) throw new Error("No server URLs found in any sitemap");
  return serverUrls;
}

// --- GitHub fallback (chatmcp/mcpso repo) ------------------------------------

// The mcpso repo is a Next.js source app (no static data file).
// We can enumerate app/[server]/[name]/[author] page directories as a fallback.
function fetchAllViaGitHub() {
  console.warn("[mcpso] Falling back to GitHub clone of chatmcp/mcpso…");
  if (existsSync(FALLBACK_DIR)) rmSync(FALLBACK_DIR, { recursive: true, force: true });
  execSync(`git clone --depth 1 ${FALLBACK_REPO} ${FALLBACK_DIR}`, { stdio: "pipe" });

  // Derive server entries from the sitemap generation logic if present, or
  // from any JSON data files in the repo (e.g. pagejson/).
  const candidates = [];
  function findJson(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (entry.endsWith(".json") && !entry.includes("package") && !entry.includes("tsconfig") && !entry.includes("eslint") && !entry.includes("lock")) {
        candidates.push(full);
      }
    }
  }
  findJson(FALLBACK_DIR);
  findJson(join(FALLBACK_DIR, "data"));
  findJson(join(FALLBACK_DIR, "pagejson"));
  findJson(join(FALLBACK_DIR, "public"));

  for (const f of candidates) {
    try {
      const raw = JSON.parse(readFileSync(f, "utf8"));
      const arr = Array.isArray(raw) ? raw
        : (raw.servers ?? raw.projects ?? raw.items ?? raw.data ?? null);
      if (Array.isArray(arr) && arr.length > 0 && (arr[0].name || arr[0].title || arr[0].url)) {
        console.warn(`[mcpso] GitHub fallback: ${arr.length} records in ${f}`);
        // Convert records to synthetic server URLs so the same normalization path handles them.
        return arr.slice(0, MAX_SERVERS).map(r => {
          const name = r.name ?? r.slug ?? "unknown";
          const author = r.author_name ?? r.author ?? "unknown";
          return `https://mcp.so/server/${name}/${author}`;
        });
      }
    } catch { /* skip */ }
  }

  throw new Error("GitHub fallback: no parseable server list found in the cloned repo");
}

// --- Normalise one server URL → record ---------------------------------------
// URL shape: https://mcp.so/server/<name>/<author>
// name and author are slugs — use them directly.

function normaliseUrl(url) {
  // Strip trailing slash and extract path segments after /server/
  const path = url.replace(/\/$/, "").split("/server/")[1] ?? "";
  const parts = path.split("/").filter(Boolean);
  const name = parts[0] ?? "unknown";
  const author = parts[1] ?? "";
  const displayName = name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const sourceRepo = author ? `${author}/${name}` : "";
  const sourceUrl = url;
  return { name, author, displayName, sourceRepo, sourceUrl };
}

// --- Adapter -----------------------------------------------------------------

function mcpsoAdapter() {
  const adapterName = "mcpso";
  const type = "mcps";
  const seen = new Set();
  let usedFallback = false;
  let rawUrls = [];

  return {
    name: adapterName,
    type,

    async fetch() {
      try {
        rawUrls = await fetchAllViaApi();
        console.log(`[mcpso] sitemap API: collected ${rawUrls.length} server URLs`);
      } catch (apiErr) {
        console.warn(`[mcpso] sitemap unreachable: ${apiErr.message}`);
        try {
          rawUrls = fetchAllViaGitHub();
          usedFallback = true;
        } catch (fbErr) {
          throw new Error(`mcp.so unreachable — sitemap: ${apiErr.message} | GitHub: ${fbErr.message}`);
        }
      }
      return rawUrls;
    },

    toComponent(url) {
      const rec = normaliseUrl(url);
      const base = slugify(rec.name);
      const uname = uniqueName(base, seen);

      // Build a descriptive summary from the name — no live page scrape to stay bounded.
      const rawDesc = `${rec.displayName} MCP server listed on mcp.so.`;
      const desc = scrub(rawDesc).slice(0, 300);

      // GitHub source repo: owner/name — infer from author/name pattern.
      // mcp.so URL uses author as GitHub username in most cases.
      const ghRepo = rec.sourceRepo;

      const mcpsoPageUrl = `https://mcp.so/server/${rec.name}${rec.author ? "/" + rec.author : ""}`;

      return {
        frontmatter: {
          name: uname,
          type,
          description: desc,
          source_repo: ghRepo,
          source_url: mcpsoPageUrl,
          license: "unknown",
          cli_compat: ["claude", "cursor", "codex", "opencode", "gemini"],
          maturity: "experimental",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: ["mcp-so", "mcp"],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\n${desc}\n\n` +
          `## How to install / invoke\nSee the [mcp.so listing](${mcpsoPageUrl}) for install instructions.\n\n` +
          `## Notes\nDiscovered via mcp.so sitemap (${usedFallback ? "GitHub fallback" : "live sitemaps"}). Pending verify -> promote.`,
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
    const adapter = mcpsoAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[mcpso] No stubs produced — check source availability.");
      process.exit(1);
    }
    // Spot-check: print the first and a mid-range stub's slug.
    const first = written[0];
    const mid = written[Math.floor(written.length / 2)];
    console.log(`[mcpso] sample[0]: ${first.frontmatter.name}`);
    console.log(`[mcpso] sample[mid]: ${mid.frontmatter.name}`);
  } catch (err) {
    console.error(`[mcpso] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
