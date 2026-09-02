#!/usr/bin/env node
// ingest-sentinel-feed.mjs — Armory's half of the Sentinel → Armory feed (CP137, T18/T20).
//
// Sentinel (the scout) emits one JSON: tools practitioners actually mention, each with how many
// independent notes cited it, classified against our catalog. This script applies it:
//   • `existing` rows → the `mentions` signal (monotone: never lowered), then MUST be persisted to the
//     brain markdown (scripts/persist-signals-to-brain.mjs) or the next rebuild deletes it — the same
//     silent-deletion bug that already bit stars, mentions, and the tested tools.
//   • `new` rows (have a source URL) → a stub in incoming/sentinel/ shaped to the promote contract
//     (identical to the crawler's), so they pass the SAME gate → promote path. No LLM anywhere.
//   • `unresolved` (name only) → listed in the report; Sentinel's resolver upgrades them over time.
//
//   node scripts/ingest-sentinel-feed.mjs                       # dry run against the newest feed
//   node scripts/ingest-sentinel-feed.mjs --feed <path> --apply
//   then: node scripts/persist-signals-to-brain.mjs --apply && node ingest/catalog.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { slugify, toMarkdown } from "../ingest/crawl.mjs";
import { parseFrontmatter } from "../ingest/catalog.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const CATALOG = join(ROOT, "catalog.json");
const INCOMING = join(ROOT, "incoming", "sentinel");
const FEED_DIR = join(ROOT, "..", "sentinel", "brain", "updates", "armory-feed");
const CLI_COMPAT = ["claude", "codex", "cursor", "gemini", "opencode"];

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

function newestFeed() {
  if (!existsSync(FEED_DIR)) return null;
  const f = readdirSync(FEED_DIR).filter((x) => /^20\d\d-\d\d-\d\d\.json$/.test(x)).sort().pop();
  return f ? join(FEED_DIR, f) : null;
}

const feedPath = val("--feed", newestFeed());
if (!feedPath || !existsSync(feedPath)) {
  console.error("no feed found — run sentinel/access/emit_to_armory.py first, or pass --feed <path>");
  process.exit(1);
}
const feed = JSON.parse(readFileSync(feedPath, "utf-8"));
const cat = JSON.parse(readFileSync(CATALOG, "utf-8"));
const byName = new Map(cat.components.map((c) => [c.name, c]));

// ── existing rows: raise `mentions` (never lower) ─────────────────────────────────────────────
let raised = 0, unchanged = 0, missing = 0;
for (const r of feed.existing || []) {
  const row = byName.get(r.armory_name);
  if (!row) { missing++; continue; }
  const cur = typeof row.mentions === "number" ? row.mentions : 0;
  if (r.mentions > cur) { if (has("--apply")) row.mentions = r.mentions; raised++; } else unchanged++;
}

// ── new rows: stubs in the promote contract ───────────────────────────────────────────────────
const repoKey = (u) => { const m = String(u || "").match(/github\.com\/([^/\s#?]+)\/([^/\s#?]+)/i); return m ? `${m[1]}/${m[2].replace(/\.git$/i, "")}` : ""; };
const typeOf = (name, url) => (/mcp/i.test(name) || /mcp/i.test(url) ? "mcps" : "clis-tools");
const today = new Date().toISOString().slice(0, 10);
let stubs = 0, skipped = 0;
const planned = [];
for (const r of feed.new || []) {
  const url = r.urls?.[0] || "";
  if (!url) { skipped++; continue; }
  const slug = slugify(repoKey(url) || r.name);
  if (byName.has(slug)) { skipped++; continue; } // already in the catalog under its canonical slug
  const type = typeOf(r.name, url);
  const frontmatter = {
    name: slug, type,
    description: `${r.name} — cited by ${r.mentions} practitioner note${r.mentions === 1 ? "" : "s"} in the Sentinel brain.`,
    source_repo: repoKey(url), source_url: url, license: "unknown", cli_compat: CLI_COMPAT,
    maturity: "experimental", stars: null, eval_score: null, mentions: r.mentions, verified_at: today,
    related: [], tags: ["sentinel-feed", type === "mcps" ? "mcp" : "cli"],
  };
  const body =
    `## What it is\n${frontmatter.description}\n\n## When to use it\nSee the source: ${url}\n\n` +
    `## How to install / invoke\nSee the source README: ${url}\n\n` +
    `## Notes\nSurfaced by the Sentinel→Armory feed (practitioner mentions), ${today}. Pending verify → promote.`;
  const md = toMarkdown({ frontmatter, body });
  const back = parseFrontmatter(md); // roundtrip self-check, like the crawler
  if (back.name !== slug) { skipped++; continue; }
  planned.push({ slug, type, url, mentions: r.mentions });
  if (has("--apply")) {
    mkdirSync(INCOMING, { recursive: true });
    const file = join(INCOMING, `${slug}.md`);
    if (!existsSync(file)) writeFileSync(file, md);
  }
  stubs++;
}

if (has("--apply")) writeFileSync(CATALOG, JSON.stringify(cat, null, 2) + "\n");

console.log(`feed: ${feedPath}`);
console.log(`existing → mentions raised ${raised} · unchanged ${unchanged} · name-not-found ${missing}`);
console.log(`new → stubs ${has("--apply") ? "written" : "planned"} ${stubs} · skipped ${skipped}`);
for (const p of planned.slice(0, 15)) console.log(`   + ${p.slug} (${p.type}, ×${p.mentions}) ${p.url}`);
console.log(`unresolved (name only, Sentinel will resolve): ${(feed.unresolved || []).length}`);
console.log(has("--apply")
  ? "\nAPPLIED. Now: node scripts/persist-signals-to-brain.mjs --apply && node ingest/catalog.mjs && node ingest/test-gate.mjs incoming/sentinel && node ingest/promote.mjs --from incoming/sentinel --to brain/components --apply"
  : "\nDRY RUN — nothing written. Re-run with --apply.");
