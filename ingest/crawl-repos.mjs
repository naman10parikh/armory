#!/usr/bin/env node
// crawl-repos.mjs — keep tabs on the upstream source repos.
//
// Reads repos/watchlist.json, asks the GitHub API for each repo's latest push,
// star count, and archived flag, then writes repos/status.json with a staleness
// flag per repo. This is how the self-improving loop "keeps tabs" on the sources
// Armory is built from — a source that just shipped new gear shows up as fresh;
// one that went quiet (or got archived) shows up as stale, flagging a re-crawl.
//
// Zero npm deps (Node 20 global fetch). Fault-isolated: a failed lookup is
// recorded per-repo and the run still exits 0, so it never breaks AutoLab.
// Auth is optional — uses GH_TOKEN / GITHUB_TOKEN if present (higher rate limit),
// works unauthenticated for the ~20 repos in the watchlist otherwise.
//
//   node ingest/crawl-repos.mjs            # fetch + write repos/status.json
//   node ingest/crawl-repos.mjs --offline  # re-summarize existing status.json, no network
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WATCHLIST = join(ROOT, "repos", "watchlist.json");
const STATUS = join(ROOT, "repos", "status.json");
const OFFLINE = process.argv.includes("--offline");

const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
const HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "armory-crawl-repos",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

const DAY = 86_400_000;

async function fetchRepo(repo) {
  const res = await fetch(`https://api.github.com/repos/${repo}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  return {
    stars: j.stargazers_count ?? null,
    pushed_at: j.pushed_at ?? null,
    archived: j.archived ?? false,
    description: j.description ?? "",
  };
}

// Run promises in small batches to stay polite with the API.
async function inBatches(items, size, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  }
  return out;
}

async function main() {
  const wl = JSON.parse(readFileSync(WATCHLIST, "utf8"));
  const staleAfter = wl.stale_after_days ?? 120;
  const now = Date.now();

  if (OFFLINE) {
    if (!existsSync(STATUS)) { console.error("no repos/status.json to summarize"); process.exit(0); }
    const s = JSON.parse(readFileSync(STATUS, "utf8"));
    console.log(`offline: ${s.repos.length} repos · ${s.stale} stale · ${s.errors} errors (generated ${s.generated_at})`);
    return;
  }

  const results = await inBatches(wl.repos, 5, async (entry) => {
    try {
      const meta = await fetchRepo(entry.repo);
      const days = meta.pushed_at ? Math.floor((now - Date.parse(meta.pushed_at)) / DAY) : null;
      const stale = meta.archived || (days !== null && days > staleAfter);
      return { ...entry, stars: meta.stars, pushed_at: meta.pushed_at, days_since_push: days, archived: meta.archived, stale };
    } catch (e) {
      console.warn(`  ! ${entry.repo}: ${e.message}`);
      return { ...entry, error: e.message, stale: null };
    }
  });

  const errors = results.filter((r) => r.error).length;
  const stale = results.filter((r) => r.stale === true).length;
  const status = {
    generated_at: new Date(now).toISOString(),
    stale_after_days: staleAfter,
    total: results.length,
    fresh: results.filter((r) => r.stale === false).length,
    stale,
    errors,
    repos: results.sort((a, b) => (b.stars || 0) - (a.stars || 0)),
  };
  writeFileSync(STATUS, JSON.stringify(status, null, 2) + "\n", "utf8");

  console.log(`crawl-repos: ${results.length} watched · ${status.fresh} fresh · ${stale} stale · ${errors} errors → repos/status.json`);
  for (const r of results.filter((x) => x.stale === true)) {
    console.log(`  STALE ${r.repo} (${r.archived ? "archived" : r.days_since_push + "d since push"})`);
  }
}

main().catch((e) => { console.error(e); process.exit(0); }); // never break AutoLab
