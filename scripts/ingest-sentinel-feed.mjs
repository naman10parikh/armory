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
import { execFileSync } from "node:child_process";
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
  if (r.mentions > cur) {
    if (has("--apply")) {
      row.mentions = r.mentions;
      // Write the raise into the note itself, not only catalog.json: the catalog is rebuilt from the
      // markdown, and a rebuild that runs before persist-signals wipes a catalog-only raise (it did,
      // twice, in one night). Same edit persist-signals would make — done here so order cannot matter.
      const file = join(ROOT, "brain", row.path || "");
      if (row.path && existsSync(file)) {
        const src = readFileSync(file, "utf-8");
        const next = /^mentions:.*$/m.test(src)
          ? src.replace(/^mentions:.*$/m, `mentions: ${r.mentions}`)
          : src.replace(/\n---/, `\nmentions: ${r.mentions}\n---`);
        if (next !== src) writeFileSync(file, next);
      }
    }
    raised++;
  } else unchanged++;
}

// ── new rows: stubs in the promote contract ───────────────────────────────────────────────────
const repoKey = (u) => { const m = String(u || "").match(/github\.com\/([^/\s#?]+)\/([^/\s#?]+)/i); return m ? `${m[1]}/${m[2].replace(/\.git$/i, "")}` : ""; };
const typeOf = (name, url) => (/mcp/i.test(name) || /mcp/i.test(url) ? "mcps" : /\bmem(ory)?\b|-mem\b/i.test(name) ? "memory" : "clis-tools");
const today = new Date().toISOString().slice(0, 10);
// Taste floor for NEW rows: a name-only mention resolved to a repo must show real adoption before it
// enters the catalog (the crawler uses the same idea). Mentions alone do not admit a row.
const MIN_STARS = Number(val("--min-stars", 100));
const MIN_MENTIONS = Number(val("--min-mentions", 3)); // one note naming a tool is noise; three is a pattern
let stubs = 0, skipped = 0, belowFloor = 0, noRepo = 0;
const planned = [];
// A new row must point at a GitHub repo: that is where its stars/forks come from, and a row that can
// never earn a signal is a permanent husk (platform.openai.com, kimi.com, a marketing site). Rows with
// only a product URL stay in Sentinel's unresolved pile for the resolver to find the repo.
const githubUrl = (r) => (r.urls || []).find((u) => repoKey(u)) || "";
// Unknown stars are not a pass: fetch them (one aliased GraphQL request for the whole feed) so the
// floor is applied to every candidate, not only the ones the resolver happened to score.
// The same request also brings the repo's own one-liner: "goose — cited by 4 notes" is provenance,
// not a description, and the note's `## Notes` already carries the provenance.
const unknown = [...new Set((feed.new || []).filter((r) => githubUrl(r)).map((r) => repoKey(githubUrl(r))))];
const fetched = new Map();
// ≤50 aliases per request: a 132-alias query came back empty and every stub silently fell back to
// "cited by N notes" as its description.
for (let i = 0; i < unknown.length; i += 50) {
  const slice = unknown.slice(i, i + 50);
  const q = `{\n${slice.map((k, j) => { const [o, n] = k.split("/"); return `a${j}: repository(owner:${JSON.stringify(o)}, name:${JSON.stringify(n)}) { stargazerCount description }`; }).join("\n")}\n}`;
  let out = "";
  try { out = execFileSync("gh", ["api", "graphql", "-f", `query=${q}`], { encoding: "utf-8", maxBuffer: 16 * 1024 * 1024 }); }
  catch (e) { out = e && typeof e.stdout === "string" ? e.stdout : ""; }
  try { const d = JSON.parse(out).data || {}; slice.forEach((k, j) => { if (d[`a${j}`]) fetched.set(k, d[`a${j}`]); }); } catch { /* no answers → those rows stay unadmitted */ }
}
if (unknown.length && fetched.size === 0) console.warn("  ! GitHub answered nothing — descriptions will fall back to provenance; check `gh auth status`");
for (const r of feed.new || []) {
  const url = githubUrl(r);
  if (!url) { noRepo++; continue; }
  const stars = typeof r.stars === "number" ? r.stars : fetched.get(repoKey(url))?.stargazerCount;
  if (typeof stars !== "number" || stars < MIN_STARS) { belowFloor++; continue; }
  r.stars = stars;
  if (r.mentions < MIN_MENTIONS) { belowFloor++; continue; }
  const slug = slugify(repoKey(url) || r.name);
  if (byName.has(slug)) { skipped++; continue; } // already in the catalog under its canonical slug
  const type = typeOf(r.name, url);
  const frontmatter = {
    name: slug, type,
    description: (fetched.get(repoKey(url))?.description || "").trim() || `${r.name} — cited by ${r.mentions} practitioner note${r.mentions === 1 ? "" : "s"} in the Sentinel brain.`,
    source_repo: repoKey(url), source_url: url, license: "unknown", cli_compat: CLI_COMPAT,
    maturity: "experimental", stars: typeof r.stars === "number" ? r.stars : null, eval_score: null, mentions: r.mentions, verified_at: today,
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

// --reset re-baselines the signal after a crediting-rule change: every row's mentions become exactly
// what the feed credits (null when it credits nothing), in catalog.json AND in the brain markdown —
// the persist script never blanks a value, so the markdown has to be reset here or the next rebuild
// brings the old numbers back. Monotone --apply stays the nightly path.
let reset = 0;
if (has("--reset") && has("--apply")) {
  const credited = new Map((feed.existing || []).map((r) => [r.armory_name, r.mentions]));
  for (const c of cat.components || []) {
    const target = credited.has(c.name) ? credited.get(c.name) : null;
    if ((c.mentions ?? null) === target) continue;
    c.mentions = target;
    const file = join(ROOT, "brain", c.path);
    if (!existsSync(file)) continue;
    const src = readFileSync(file, "utf-8");
    const next = src.replace(/^mentions:.*$/m, `mentions: ${target == null ? "null" : target}`);
    if (next !== src) writeFileSync(file, next);
    reset++;
  }
}

if (has("--apply")) writeFileSync(CATALOG, JSON.stringify(cat, null, 2) + "\n");

console.log(`feed: ${feedPath}`);
if (has("--reset")) console.log(`reset → ${reset} rows re-baselined to the feed's URL-credited counts`);
console.log(`existing → mentions raised ${raised} · unchanged ${unchanged} · name-not-found ${missing}`);
console.log(`new → stubs ${has("--apply") ? "written" : "planned"} ${stubs} · skipped ${skipped} · below ${MIN_STARS}★ floor ${belowFloor} · no GitHub repo ${noRepo}`);
for (const p of planned.slice(0, 15)) console.log(`   + ${p.slug} (${p.type}, ×${p.mentions}) ${p.url}`);
console.log(`unresolved (name only, Sentinel will resolve): ${(feed.unresolved || []).length}`);
console.log(has("--apply")
  ? "\nAPPLIED. Now: node scripts/persist-signals-to-brain.mjs --apply && node ingest/catalog.mjs && node ingest/test-gate.mjs incoming/sentinel && node ingest/promote.mjs --from incoming/sentinel --to brain/components --apply"
  : "\nDRY RUN — nothing written. Re-run with --apply.");
