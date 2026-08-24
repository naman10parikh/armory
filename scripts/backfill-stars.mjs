#!/usr/bin/env node
// backfill-stars.mjs — fill in the star counts we never fetched.
//
// 80% of the catalog is unranked, and 95% of those rows point at a GitHub repo whose star count is
// public — we simply never asked for it. This asks, in bulk: GitHub's GraphQL API lets one request
// alias many repository() lookups, and the whole batch costs ONE rate-limit point. So ~44k repos is
// ~440 points against a 5,000/hour budget — minutes, not hours, and free.
//
// Read-only against GitHub. Dry-run by default. Uses the `gh` CLI's existing auth (no token here).
//
//   node scripts/backfill-stars.mjs                 # dry run, whole backlog
//   node scripts/backfill-stars.mjs --limit 500     # sample first (recommended)
//   node scripts/backfill-stars.mjs --apply         # write stars into catalog.json
//
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const CATALOG = join(HERE, "..", "catalog.json");
const BATCH = 100; // repos per GraphQL request — one rate-limit point regardless

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

if (has("--help")) {
  console.log(`backfill-stars — fetch the GitHub stars we never fetched

  --limit N   only process the first N repos (sample before committing to a full run)
  --apply     write the results into catalog.json (default: dry run, writes nothing)
  --help

Dry run prints what it would fill in. Requires the \`gh\` CLI to be logged in.`);
  process.exit(0);
}

/** owner/repo from any github URL, or null. Strips .git, refs, and deep paths. */
function repoKey(url) {
  const m = String(url || "").match(/github\.com\/([^/\s#?]+)\/([^/\s#?]+)/i);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2].replace(/\.git$/i, "");
  if (!owner || !repo || owner === "sponsors" || owner === "orgs") return null;
  return `${owner}/${repo}`;
}

/** One GraphQL request covering up to BATCH repos. Returns Map<key, stars>. */
function fetchBatch(keys) {
  const fields = keys
    .map((k, i) => {
      const [owner, name] = k.split("/");
      return `  a${i}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { nameWithOwner stargazerCount }`;
    })
    .join("\n");
  const query = `{\n${fields}\n  rateLimit { cost remaining }\n}`;
  let out;
  try {
    out = execFileSync("gh", ["api", "graphql", "-f", `query=${query}`], {
      encoding: "utf-8",
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch (err) {
    // A dead repo in the batch (renamed, deleted, gone private) makes GitHub return errors alongside
    // the GOOD rows, and `gh` exits non-zero on any error. The payload is still on stdout, so parse
    // it rather than throwing away 99 good answers because 1 repo vanished.
    out = err && typeof err.stdout === "string" ? err.stdout : "";
    if (!out) {
      console.warn(`  ! batch dropped (${keys.length} repos): ${String(err?.message || err).slice(0, 100)}`);
      return { found: new Map(), cost: 0, remaining: null };
    }
  }
  let parsed;
  try { parsed = JSON.parse(out); } catch { return { found: new Map(), cost: 0, remaining: null }; }
  const data = parsed.data || {};
  const found = new Map();
  keys.forEach((k, i) => {
    const node = data[`a${i}`];
    // null = repo deleted, renamed, or private now. Not an error — just nothing to record.
    if (node && typeof node.stargazerCount === "number") found.set(k, node.stargazerCount);
  });
  return { found, cost: data.rateLimit?.cost ?? 0, remaining: data.rateLimit?.remaining ?? null };
}

const cat = JSON.parse(readFileSync(CATALOG, "utf-8"));
const components = cat.components || [];

// Only rows that ARE a repo get that repo's stars. A row pointing at a file INSIDE a repo (a rule,
// a skill, a sub-agent) has not earned the repo's stars — 1,643 entries inside one 30k-star repo do
// not each have 30k stars, and an inherited number would outrank tools that earned their own. Those
// rows stay honestly blank until they get a signal of their own.
const isRepoRoot = (u) => /^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/#?]+\/?$/i.test(String(u || "").trim());
const needing = components.filter((c) => {
  const hasStars = typeof c.stars === "number" && c.stars > 0;
  const url = c.source_url || c.source_repo;
  return !hasStars && repoKey(url) && isRepoRoot(url);
});
const byRepo = new Map();
for (const c of needing) {
  const k = repoKey(c.source_url || c.source_repo);
  if (!byRepo.has(k)) byRepo.set(k, []);
  byRepo.get(k).push(c);
}

let keys = [...byRepo.keys()];
const limit = Number(val("--limit", 0));
if (limit > 0) keys = keys.slice(0, limit);

console.log(`catalog          : ${components.length.toLocaleString()} components`);
console.log(`missing stars    : ${needing.length.toLocaleString()} rows`);
console.log(`unique repos     : ${byRepo.size.toLocaleString()}${limit ? ` (sampling ${keys.length.toLocaleString()})` : ""}`);
console.log(`plan             : ${Math.ceil(keys.length / BATCH).toLocaleString()} GraphQL requests @ ~1 rate-limit point each\n`);

const stars = new Map();
let cost = 0, remaining = null;
for (let i = 0; i < keys.length; i += BATCH) {
  const slice = keys.slice(i, i + BATCH);
  const res = fetchBatch(slice);
  for (const [k, v] of res.found) stars.set(k, v);
  cost += res.cost;
  if (res.remaining != null) remaining = res.remaining;
  const done = Math.min(i + BATCH, keys.length);
  process.stdout.write(`\r  fetched ${done.toLocaleString()}/${keys.length.toLocaleString()} repos · ${stars.size.toLocaleString()} found · ${cost} points used${remaining != null ? ` · ${remaining} left this hour` : ""}   `);
}
process.stdout.write("\n\n");

// Apply to every component sharing a repo (a repo with 12 skills in it lights up all 12).
let rowsFilled = 0, withStars = 0;
for (const [k, cs] of byRepo) {
  const s = stars.get(k);
  if (s == null || s <= 0) continue;
  withStars++;
  for (const c of cs) { c.stars = s; rowsFilled++; }
}

const before = components.filter((c) => typeof c.stars === "number" && c.stars > 0).length - (has("--apply") ? rowsFilled : 0);
console.log(`repos answered   : ${stars.size.toLocaleString()} of ${keys.length.toLocaleString()} asked (${withStars.toLocaleString()} had >0 stars)`);
console.log(`rows filled      : ${rowsFilled.toLocaleString()}`);
console.log(`rows with stars  : ${before.toLocaleString()} → ${(before + rowsFilled).toLocaleString()}`);
console.log(`rate limit used  : ${cost} points${remaining != null ? ` (${remaining} remaining this hour)` : ""}`);

if (!has("--apply")) {
  console.log(`\nDRY RUN — nothing written. Re-run with --apply to save into catalog.json.`);
} else {
  writeFileSync(CATALOG, JSON.stringify(cat, null, 2) + "\n");
  console.log(`\nWROTE ${CATALOG}`);
  console.log(`Next: re-run the leaderboard/API — the score recomputes from catalog.json automatically.`);
}
