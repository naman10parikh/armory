#!/usr/bin/env node
// scripts/crawl-discover.mjs — the PROACTIVE freshness crawler for the Armory catalog.
//
// WHY: catalog.json was crawled once (~May 2026). Open-source harness components ship every day —
// new MCP servers, Claude skills, agent tools — so a static catalog goes stale the moment it's built.
// This script closes that gap: it sweeps GitHub for RECENTLY-PUSHED repos tagged with harness-component
// topics/keywords, drops everything the catalog already knows, and REPORTS what's new. It never mutates
// the catalog — it only READS it to dedup, then writes a candidate list (brain/discovered.json) that a
// later PR/review flow turns into real catalog rows. This is the seed of the freshness fix, not the fix
// itself: discovery is automatic, admission stays human-reviewed.
//
// HOW: uses the authenticated `gh` CLI (free — no PAT juggling, no paid API) to hit GitHub's
// /search/repositories endpoint once per topic lens, filtered to `pushed:>=<since>`. Results are merged,
// deduped across lenses, then filtered against a Set of every owner/repo already in the catalog (built
// from source_url + source_repo, the same owner/repo canonicalization scripts/data-quality.mjs uses).
// Zero new dependencies: node stdlib + the `gh` binary already on PATH.
//
// USAGE:
//   node scripts/crawl-discover.mjs [--max N] [--since YYYY-MM-DD]
//     --max N        cap the NEW candidates written/printed (default 50). Also sizes each query page.
//     --since DATE   only repos pushed on/after DATE (default: 90 days ago).
//     --help         this text.
//
// OUTPUT: a TPM-style summary (queried · found · new · already-known) + a candidate table on stdout,
// and brain/discovered.json = { generated_at, since, queries, summary, candidates[] } where each
// candidate is { name, url, stars, description, pushed_at, why }.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CATALOG = join(HERE, "..", "catalog.json");
const OUT = join(HERE, "..", "brain", "discovered.json");

// The topic/keyword lenses we sweep. Topic qualifiers are precise (repo maintainers opt in by tagging);
// the trailing keyword lens widens recall to repos that name the term but never tagged a topic. GitHub
// search excludes forks by default, so these already skip fork noise.
const QUERIES = [
  "topic:mcp-server",
  "topic:model-context-protocol",
  "topic:claude-skill",
  "topic:claude-code",
  "topic:agent-tool",
  "mcp-server in:name,description",
];

const DAY = 86_400_000;
const PER_PAGE_MAX = 100; // GitHub's hard cap for search/repositories

// ---- arg parsing --------------------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { max: 50, since: new Date(Date.now() - 90 * DAY).toISOString().slice(0, 10), help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--max") opts.max = parseInt(argv[++i], 10);
    else if (a.startsWith("--max=")) opts.max = parseInt(a.slice(6), 10);
    else if (a === "--since") opts.since = argv[++i];
    else if (a.startsWith("--since=")) opts.since = a.slice(8);
    else throw new Error(`unknown argument: ${a} (try --help)`);
  }
  if (!Number.isFinite(opts.max) || opts.max < 1) throw new Error("--max must be a positive integer");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.since)) throw new Error("--since must be an ISO date (YYYY-MM-DD)");
  return opts;
}

// ---- catalog dedup ------------------------------------------------------------------------------------

// Extract a canonical lowercase `owner/repo` from a GitHub URL or a bare "owner/repo" string; null if the
// string names no GitHub repo. Robust to git@ SCP form, .git suffix, and any in-repo path (blob/tree/…),
// so a catalog row pointing deep inside a repo still reduces to the repo the discovered candidate names.
function repoKey(s) {
  if (typeof s !== "string") return null;
  const u = s.replace(/^git@github\.com:/i, "https://github.com/").trim();
  const gh = /github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[/#?\s].*)?$/i.exec(u);
  if (gh) return `${gh[1].toLowerCase()}/${gh[2].toLowerCase()}`;
  const bare = /^([\w.-]+)\/([\w.-]+?)(?:\.git)?$/.exec(u); // source_repo often is just "owner/repo"
  if (bare) return `${bare[1].toLowerCase()}/${bare[2].toLowerCase()}`;
  return null;
}

// Build the Set of every owner/repo the catalog already contains — from BOTH source_url and source_repo,
// so recall is maximal and we never re-report a repo the catalog knows under either field.
function knownRepos() {
  const cat = JSON.parse(readFileSync(CATALOG, "utf8"));
  const components = Array.isArray(cat) ? cat : cat.components || [];
  const set = new Set();
  for (const c of components) {
    const a = repoKey(c.source_url);
    if (a) set.add(a);
    const b = repoKey(c.source_repo);
    if (b) set.add(b);
  }
  return { set, total: components.length };
}

// ---- github search ------------------------------------------------------------------------------------

// One authenticated search call via `gh api`. On a GET, gh appends every -f field as a URL-encoded query
// param, so spaces/`:`/`>=` in the qualifier are handled for us. Throws on non-zero exit (bad auth, rate
// limit) — the caller records the error per-lens and keeps going.
function ghSearch(qualifier, since, perPage) {
  const args = [
    "api", "-X", "GET", "search/repositories",
    "-H", "Accept: application/vnd.github+json",
    "-f", `q=${qualifier} pushed:>=${since}`,
    "-f", "sort=updated",
    "-f", "order=desc",
    "-f", `per_page=${perPage}`,
  ];
  const raw = execFileSync("gh", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  const json = JSON.parse(raw);
  return { total: json.total_count ?? 0, items: Array.isArray(json.items) ? json.items : [] };
}

// ---- reporting (TPM-style tables — same shape as scripts/data-quality.mjs) -----------------------------

function table(headers, rows, aligns = []) {
  const cols = headers.map((h, i) => Math.max(String(h).length, ...rows.map((r) => String(r[i] ?? "").length)));
  const line = (cells) => cells.map((c, i) => {
    const s = String(c ?? "");
    return aligns[i] === "r" ? s.padStart(cols[i]) : s.padEnd(cols[i]);
  }).join("  ");
  const out = [line(headers), cols.map((w) => "─".repeat(w)).join("  ")];
  for (const r of rows) out.push(line(r));
  return out.map((l) => "  " + l.replace(/\s+$/, "")).join("\n");
}

const clip = (s, n) => { const t = String(s || "").replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 1) + "…" : t; };
const day = (iso) => String(iso || "").slice(0, 10);

// ---- main ---------------------------------------------------------------------------------------------

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write(
      "Usage: node scripts/crawl-discover.mjs [--max N] [--since YYYY-MM-DD]\n" +
      "  Discover recently-pushed OSS harness components NOT already in catalog.json.\n" +
      "  --max N        cap NEW candidates written/printed (default 50).\n" +
      "  --since DATE   only repos pushed on/after DATE (default: 90 days ago).\n" +
      "  Reports to stdout + writes brain/discovered.json. Read-only toward the catalog.\n");
    return;
  }

  const perPage = Math.min(PER_PAGE_MAX, Math.max(opts.max, 25)); // headroom so dedup can still reach --max
  const { set: known, total: catalogSize } = knownRepos();

  process.stdout.write("\nArmory freshness crawler — proactive discovery\n");
  process.stdout.write(`catalog.json · ${catalogSize.toLocaleString()} known components · pushed:>=${opts.since} · gh CLI\n\n`);

  // Sweep each lens. Merge into a map keyed by owner/repo; a repo matching several lenses is kept once,
  // its `matched` list unioned (that becomes the "why").
  const found = new Map();
  const perQuery = [];
  const errors = [];
  let rawPulled = 0;

  for (const q of QUERIES) {
    let got = 0, added = 0;
    try {
      const { items } = ghSearch(q, opts.since, perPage);
      rawPulled += items.length;
      for (const it of items) {
        const fullName = it.full_name || (it.owner?.login && it.name ? `${it.owner.login}/${it.name}` : it.name);
        if (!fullName) continue;
        got++;
        const key = fullName.toLowerCase();
        const prev = found.get(key);
        if (prev) { if (!prev.matched.includes(q)) prev.matched.push(q); continue; } // already seen via another lens
        found.set(key, {
          name: fullName,
          url: it.html_url || `https://github.com/${fullName}`,
          stars: typeof it.stargazers_count === "number" ? it.stargazers_count : 0,
          description: it.description || "",
          pushed_at: it.pushed_at || "",
          matched: [q],
        });
        added++;
      }
      perQuery.push([q, got, added]);
    } catch (err) {
      const msg = String(err?.stderr || err?.message || err).split("\n")[0].slice(0, 120);
      errors.push([q, msg]);
      perQuery.push([q, "ERR", "—"]);
    }
  }

  if (found.size === 0 && errors.length === QUERIES.length) {
    process.stdout.write("PER-LENS\n");
    process.stdout.write(table(["lens", "error"], errors, ["l", "l"]) + "\n\n");
    process.stderr.write("crawl-discover: every query failed — is `gh` authenticated? (`gh auth status`)\n");
    process.exit(1);
  }

  // Split found repos into new (not in catalog) vs already-known.
  const all = [...found.values()];
  const isNew = (r) => !known.has(r.name.toLowerCase());
  const fresh = all.filter(isNew).sort((a, b) => (b.pushed_at || "").localeCompare(a.pushed_at || "") || b.stars - a.stars);
  const knownHits = all.length - fresh.length;

  // The candidates we actually record — freshest first, capped at --max. `why` states plainly why it's here.
  const candidates = fresh.slice(0, opts.max).map((r) => ({
    name: r.name,
    url: r.url,
    stars: r.stars,
    description: r.description,
    pushed_at: r.pushed_at,
    why: `new to catalog; matched ${r.matched.join(", ")}`,
  }));

  // ---- write brain/discovered.json (the only file this script writes) ----
  const payload = {
    generated_at: new Date().toISOString(),
    since: opts.since,
    queries: QUERIES,
    catalog_size: catalogSize,
    summary: { queries_run: QUERIES.length, repos_pulled: rawPulled, unique_found: all.length, already_known: knownHits, new_candidates: fresh.length, written: candidates.length },
    candidates,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");

  // ---- stdout report ----
  process.stdout.write("PER-LENS (repos returned · new-this-run)\n");
  process.stdout.write(table(["lens", "returned", "unique-added"], perQuery, ["l", "r", "r"]) + "\n\n");
  if (errors.length) {
    process.stdout.write(`  note: ${errors.length} lens(es) errored (shown as ERR above) — partial results below.\n\n`);
  }

  process.stdout.write("SUMMARY\n");
  process.stdout.write(table(
    ["metric", "value"],
    [
      ["queries run", QUERIES.length],
      ["repos pulled (raw)", rawPulled],
      ["unique repos found", all.length],
      ["already in catalog", knownHits],
      ["NEW candidates", fresh.length],
      [`written to discovered.json (cap --max ${opts.max})`, candidates.length],
    ],
    ["l", "r"],
  ) + "\n\n");

  if (candidates.length) {
    process.stdout.write(`NEW CANDIDATES (top ${candidates.length}, freshest first — REPORTED, not added)\n`);
    process.stdout.write(table(
      ["#", "stars", "pushed", "repo", "description"],
      candidates.map((c, i) => [i + 1, c.stars.toLocaleString(), day(c.pushed_at), clip(c.name, 40), clip(c.description, 52)]),
      ["r", "r", "l", "l", "l"],
    ) + "\n");
  } else {
    process.stdout.write("NEW CANDIDATES: none — every discovered repo is already in the catalog for this window.\n");
  }
  process.stdout.write(`\n  wrote ${OUT.replace(HERE + "/", "scripts/")} (${candidates.length} candidate${candidates.length === 1 ? "" : "s"}). Review, then feed to the PR/admission flow.\n\n`);
}

main();
