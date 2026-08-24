#!/usr/bin/env node
// scripts/crawl-to-pr.mjs — the SELF-IMPROVING FEED that turns the freshness crawler's
// discoveries into real catalog rows through the repo's EXISTING intake path.
//
// WHY: scripts/crawl-discover.mjs finds recently-pushed OSS harness components and writes
// brain/discovered.json — but it deliberately stops at "reported, not added" (admission stays
// human-reviewed). This script closes the loop: it takes those candidates, drops the ones the
// catalog already knows and the low-signal ones, converts each survivor into a component stub in
// the SAME shape the promoter expects, and stages them into incoming/crawl-feed/ — exactly where
// the existing verify+promote flow (test-gate.mjs → promote.mjs → catalog.mjs) already reads from.
// Nothing new is invented: the frontmatter is the promote.mjs contract, the staging dir is the
// incoming/<source>/ convention every ingest/crawl-*.mjs adapter uses, and the serializer is the
// SAME toMarkdown() those adapters call.
//
// SAFE BY DEFAULT: dry-run unless --apply. Dry-run writes only a plan file (brain/crawl-feed-plan.json)
// and touches nothing else. --apply stages stubs into the gitignored incoming/crawl-feed/ (idempotent:
// a stub already staged is skipped). --pr (opt-in, needs --apply + gh) runs the existing gate→promote→
// rebuild chain and opens a PR with the resulting catalog diff.
//
// USAGE:
//   node scripts/crawl-to-pr.mjs [--min-stars N] [--max N] [--apply] [--pr]
//     --min-stars N   keep only candidates with >= N GitHub stars (default 50). The signal floor.
//     --max N         cap how many stubs to stage per run, highest-signal first (default 25).
//     --apply         stage surviving stubs into incoming/crawl-feed/ (default: dry-run, stage nothing).
//     --pr            after --apply, run gate→promote→rebuild and open a PR (needs `gh`; no-op without --apply).
//     --help          this text.
//
// If brain/discovered.json is missing, this runs scripts/crawl-discover.mjs once to produce it.
// Zero new dependencies: node stdlib + the `gh`/`git` binaries (only for --pr) + the repo's own
// ingest helpers (crawl.mjs, catalog.mjs). Mirrors the style of scripts/crawl-discover.mjs.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { slugify, toMarkdown } from "../ingest/crawl.mjs";
import { parseFrontmatter, TYPES } from "../ingest/catalog.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const CATALOG = join(ROOT, "catalog.json");
const DISCOVERED = join(ROOT, "brain", "discovered.json");
const PLAN = join(ROOT, "brain", "crawl-feed-plan.json");
const CRAWLER = join(HERE, "crawl-discover.mjs");
// The intake path we reuse: incoming/<source>/ — same convention as ingest/crawl-glama.mjs et al.
// A stub written here is picked up as-is by `promote.mjs --from incoming/crawl-feed`.
const FEED_SOURCE = "crawl-feed";
const INCOMING_FEED = join(ROOT, "incoming", FEED_SOURCE);

const DEFAULT_MIN_STARS = 50;
const DEFAULT_MAX = 25;
// cli_compat / body sections mirror ingest/crawl.mjs's own adapters so stubs are indistinguishable
// from the ones the established crawlers emit.
const CLI_COMPAT = ["claude", "codex", "cursor", "gemini", "opencode"];

// ---- arg parsing --------------------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { minStars: DEFAULT_MIN_STARS, max: DEFAULT_MAX, apply: false, pr: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--apply") opts.apply = true;
    else if (a === "--pr") opts.pr = true;
    else if (a === "--min-stars") opts.minStars = parseInt(argv[++i], 10);
    else if (a.startsWith("--min-stars=")) opts.minStars = parseInt(a.slice(12), 10);
    else if (a === "--max") opts.max = parseInt(argv[++i], 10);
    else if (a.startsWith("--max=")) opts.max = parseInt(a.slice(6), 10);
    else throw new Error(`unknown argument: ${a} (try --help)`);
  }
  if (!Number.isFinite(opts.minStars) || opts.minStars < 0) throw new Error("--min-stars must be a non-negative integer");
  if (!Number.isFinite(opts.max) || opts.max < 1) throw new Error("--max must be a positive integer");
  return opts;
}

// ---- catalog dedup (mirrors scripts/crawl-discover.mjs — crawl-discover.mjs runs main() on import, so
//      it cannot be imported; this is the same canonicalization, kept in sync deliberately) ------------

// Canonical lowercase `owner/repo` from a GitHub URL or bare "owner/repo"; null if it names no repo.
function repoKey(s) {
  if (typeof s !== "string") return null;
  const u = s.replace(/^git@github\.com:/i, "https://github.com/").trim();
  const gh = /github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[/#?\s].*)?$/i.exec(u);
  if (gh) return `${gh[1].toLowerCase()}/${gh[2].toLowerCase()}`;
  const bare = /^([\w.-]+)\/([\w.-]+?)(?:\.git)?$/.exec(u);
  if (bare) return `${bare[1].toLowerCase()}/${bare[2].toLowerCase()}`;
  return null;
}

// The Set of every owner/repo the catalog already contains (from source_url AND source_repo).
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

// ---- candidate -> component stub ----------------------------------------------------------------------

// Map a discovered candidate to one of the 12 component TYPES using the lens(es) it matched (recorded
// in `why`). MCP is the highest-precision signal, then claude-skill; everything else (agent-tool,
// claude-code, …) lands in clis-tools — the catch-all bucket for agent-invocable tools.
function mapType(candidate) {
  const why = String(candidate.why || "").toLowerCase();
  if (/mcp|model-context-protocol/.test(why)) return "mcps";
  if (/claude-skill|(^|[^a-z])skill/.test(why)) return "skills";
  return "clis-tools";
}

// A folded-scalar-safe one-line description. If the repo gave none (or a husk too thin to pass the
// behavioral gate), synthesize an HONEST provenance line — it states where the tool came from, never a
// fabricated capability claim. `dropReason` on the returned meta lets the caller flag synthesized ones.
function describe(candidate, type) {
  const raw = String(candidate.description || "").replace(/\s+/g, " ").trim();
  if (raw.length >= 12) return { text: raw.slice(0, 300), synthesized: false };
  const lens = (String(candidate.why || "").match(/matched (.+)$/) || [, "a harness-component lens"])[1];
  return {
    text: `${candidate.name} — a ${type.replace(/s$/, "")} discovered via the Armory freshness crawler (matched ${lens}). Description pending review.`,
    synthesized: true,
  };
}

// Turn one candidate into { slug, type, dest, md, frontmatter, synthesized }. Uses the repo's own
// toMarkdown() serializer + parseFrontmatter() roundtrip check — the exact self-validation the
// established ingest/crawl-*.mjs adapters run before writing a stub.
function toStub(candidate, verifiedAt) {
  const type = mapType(candidate);
  const slug = slugify(candidate.name); // owner-repo form: collision-safe AND equals the filename
  const desc = describe(candidate, type);
  const sourceRepo = repoKey(candidate.name) || "";
  const typeTag = type === "mcps" ? "mcp" : type.replace(/s$/, "");
  const frontmatter = {
    name: slug,
    type,
    description: desc.text,
    source_repo: sourceRepo,
    source_url: candidate.url || (sourceRepo ? `https://github.com/${sourceRepo}` : ""),
    license: "unknown", // the crawler does not capture license; honest placeholder (a valid required value)
    cli_compat: CLI_COMPAT,
    maturity: "experimental",
    stars: typeof candidate.stars === "number" ? candidate.stars : null,
    eval_score: null,
    verified_at: verifiedAt,
    related: [],
    tags: [FEED_SOURCE, typeTag],
  };
  const pushed = String(candidate.pushed_at || "").slice(0, 10);
  const body =
    `## What it is\n${desc.text}\n\n` +
    `## When to use it\n${desc.text}\n\n` +
    `## How to install / invoke\nSee the source repo README: ${frontmatter.source_url}\n\n` +
    `## Notes\nDiscovered via the Armory freshness crawler (scripts/crawl-discover.mjs); ` +
    `${candidate.why || "new to catalog"}${pushed ? `, pushed ${pushed}` : ""}. Pending verify -> promote.`;
  const md = toMarkdown({ frontmatter, body });
  // Self-check: the serialized name must roundtrip to the slug (same guard crawl-glama.mjs uses).
  const back = parseFrontmatter(md);
  if (back.name !== slug) throw new Error(`name roundtrip mismatch for ${slug}: parsed "${back.name}"`);
  if (!TYPES.includes(type)) throw new Error(`internal: mapped type "${type}" is not a valid category`);
  return { slug, type, dest: join(INCOMING_FEED, `${slug}.md`), md, frontmatter, synthesized: desc.synthesized };
}

// ---- reporting (compact tables — same shape as scripts/crawl-discover.mjs) -----------------------------

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

// ---- discovered.json loading (self-bootstrap if missing) ----------------------------------------------

function loadDiscovered(max) {
  if (!existsSync(DISCOVERED)) {
    console.warn(`brain/discovered.json not found — running the crawler once to produce it…`);
    try {
      // A generous pool so star-filter + dedup still have room to reach --max survivors.
      const pool = Math.max(100, max * 4);
      execFileSync("node", [CRAWLER, "--max", String(pool)], { cwd: ROOT, stdio: "inherit" });
    } catch (err) {
      const msg = String(err?.stderr || err?.message || err).split("\n")[0];
      console.error(`crawl-to-pr: could not generate brain/discovered.json (${msg}).`);
      console.error(`  Fix the crawler first: node scripts/crawl-discover.mjs  (check \`gh auth status\`).`);
      process.exit(1);
    }
  }
  if (!existsSync(DISCOVERED)) {
    console.error("crawl-to-pr: crawler ran but brain/discovered.json still absent — aborting.");
    process.exit(1);
  }
  let data;
  try { data = JSON.parse(readFileSync(DISCOVERED, "utf8")); }
  catch (err) { console.error(`crawl-to-pr: brain/discovered.json is not valid JSON (${err.message}).`); process.exit(1); }
  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
  return { data, candidates };
}

// ---- --pr: run the existing gate -> promote -> rebuild chain, then open a PR ---------------------------

function ghAvailable() {
  try { execFileSync("gh", ["--version"], { stdio: "ignore" }); return true; }
  catch { return false; }
}
function run(cmd, args) {
  console.log(`  $ ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { cwd: ROOT, stdio: "inherit" });
}

// Drive the SAME commands a maintainer runs by hand (incoming/README.md): gate the staged stubs, promote
// the survivors into brain/components/, rebuild catalog.json, then branch + commit + push + open the PR.
function openPr(staged, summaryLines) {
  if (!ghAvailable()) {
    console.warn("\n--pr: `gh` CLI not found on PATH — skipping PR. Stubs are staged in incoming/crawl-feed/;");
    console.warn("      a maintainer can run: node ingest/promote.mjs --from incoming/crawl-feed --to brain/components --apply");
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  const branch = `crawl-feed/${date}`;
  console.log(`\n--pr: running the existing verify+promote flow, then opening PR on branch ${branch}\n`);
  // 1. Hamel gate on ONLY the freshly-staged stubs (functional + behavioral). A failure blocks promotion.
  run("node", ["ingest/test-gate.mjs", `incoming/${FEED_SOURCE}`]);
  // 2. Promote the gated stubs into the committed tree, then 3. rebuild the index.
  run("node", ["ingest/promote.mjs", "--from", `incoming/${FEED_SOURCE}`, "--to", "brain/components", "--apply"]);
  run("node", ["ingest/catalog.mjs"]);
  // 4. Nothing changed in the committed tree? Then every stub was a dup at promote time — no PR to open.
  try {
    execFileSync("git", ["diff", "--quiet", "--", "brain/components", "catalog.json"], { cwd: ROOT });
    console.warn("--pr: promote produced no net-new catalog rows (all dups) — nothing to PR.");
    return;
  } catch { /* non-zero exit = there IS a diff, proceed */ }
  // 5. Branch, commit the catalog diff, push, and open the PR.
  run("git", ["checkout", "-b", branch]);
  run("git", ["add", "brain/components", "catalog.json"]);
  run("git", ["commit", "-m", `feat(catalog): crawl-feed adds ${staged.length} discovered component(s) [skip ci]`]);
  run("git", ["push", "-u", "origin", branch]);
  const body = [
    "## Crawl-feed: newly-discovered harness components",
    "",
    "Auto-generated by `scripts/crawl-to-pr.mjs` from the freshness crawler (`scripts/crawl-discover.mjs`).",
    "Each row was NEW to the catalog, cleared the `--min-stars` signal floor, passed the Hamel test-gate,",
    "and was promoted via the standard `ingest/promote.mjs` flow.",
    "",
    ...summaryLines.map((l) => `- ${l}`),
    "",
    "Review the staged components under `brain/components/**` before merging.",
  ].join("\n");
  run("gh", ["pr", "create", "--title", `crawl-feed: +${staged.length} discovered components (${date})`, "--body", body]);
  console.log(`\n--pr: PR opened from ${branch}.`);
}

// ---- main ---------------------------------------------------------------------------------------------

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write(
      "Usage: node scripts/crawl-to-pr.mjs [--min-stars N] [--max N] [--apply] [--pr]\n" +
      "  Feed the freshness crawler's discoveries into the catalog via the existing incoming/->promote path.\n" +
      "  --min-stars N   keep only candidates with >= N stars (default " + DEFAULT_MIN_STARS + "). The signal floor.\n" +
      "  --max N         cap stubs staged per run, highest-signal first (default " + DEFAULT_MAX + ").\n" +
      "  --apply         stage stubs into incoming/crawl-feed/ (default: dry-run — plan only, stage nothing).\n" +
      "  --pr            after --apply, run gate->promote->rebuild and open a PR (needs `gh`).\n" +
      "  Reads brain/discovered.json (runs the crawler once if absent). Idempotent; dry-run by default.\n");
    return;
  }
  if (opts.pr && !opts.apply) {
    console.error("crawl-to-pr: --pr requires --apply (a PR needs staged stubs). Re-run with --apply --pr.");
    process.exit(2);
  }

  const { data, candidates } = loadDiscovered(opts.max);
  const { set: known, total: catalogSize } = knownRepos();
  const verifiedAt = String(data?.generated_at || "").slice(0, 10) || new Date().toISOString().slice(0, 10);

  process.stdout.write("\nArmory crawl-to-PR — freshness crawler → catalog feed\n");
  process.stdout.write(
    `catalog.json · ${catalogSize.toLocaleString()} known · discovered.json · ${candidates.length} candidate(s) · ` +
    `min-stars ${opts.minStars} · max ${opts.max} · ${opts.apply ? (opts.pr ? "APPLY+PR" : "APPLY") : "DRY-RUN"}\n\n`);

  // 1. Dedup vs the catalog (belt-and-suspenders — the crawler already did this, but the catalog may
  //    have advanced since discovered.json was written).
  const notKnown = candidates.filter((c) => { const k = repoKey(c.name); return !k || !known.has(k); });
  const droppedKnown = candidates.length - notKnown.length;

  // 2. Signal floor.
  const highSignal = notKnown.filter((c) => (typeof c.stars === "number" ? c.stars : 0) >= opts.minStars);
  const droppedLowSignal = notKnown.length - highSignal.length;

  // 3. Rank highest-signal first, cap at --max, convert to stubs.
  highSignal.sort((a, b) => (b.stars - a.stars) || String(b.pushed_at || "").localeCompare(String(a.pushed_at || "")));
  const chosen = highSignal.slice(0, opts.max);
  const stubs = [];
  for (const c of chosen) {
    try { stubs.push({ candidate: c, ...toStub(c, verifiedAt) }); }
    catch (err) { console.warn(`  ! skipped ${c.name}: ${err.message}`); }
  }

  // 4. Idempotency: a stub already staged in incoming/crawl-feed/ is a no-op.
  for (const s of stubs) s.status = existsSync(s.dest) ? "exists" : "new";
  const fresh = stubs.filter((s) => s.status === "new");

  // ---- report ----
  process.stdout.write("PIPELINE\n");
  process.stdout.write(table(
    ["stage", "count"],
    [
      ["candidates in discovered.json", candidates.length],
      ["dropped — already in catalog", droppedKnown],
      [`dropped — below --min-stars ${opts.minStars}`, droppedLowSignal],
      ["survivors (new + high-signal)", highSignal.length],
      [`selected (cap --max ${opts.max})`, chosen.length],
      ["already staged (idempotent skip)", stubs.length - fresh.length],
      [opts.apply ? "staged this run" : "WOULD stage (dry-run)", fresh.length],
    ],
    ["l", "r"],
  ) + "\n\n");

  if (stubs.length) {
    process.stdout.write(`${opts.apply ? "STAGED" : "WOULD ADD"} (highest-signal first)\n`);
    process.stdout.write(table(
      ["#", "stars", "type", "repo", "status"],
      stubs.map((s, i) => [i + 1, (s.frontmatter.stars ?? 0).toLocaleString(), s.type, clip(s.candidate.name, 40), s.status + (s.synthesized ? " (desc synth)" : "")]),
      ["r", "r", "l", "l", "l"],
    ) + "\n\n");
  } else {
    process.stdout.write("No candidates survived dedup + signal floor — nothing to add this run.\n\n");
  }

  const summaryLines = stubs.map((s) => `\`${s.frontmatter.name}\` (${s.type}, ${s.frontmatter.stars ?? 0}★) — ${s.candidate.url}`);

  // 5. Emit. Dry-run: plan file only. --apply: stage new stubs. --pr: run the promote chain + PR.
  const plan = {
    generated_at: new Date().toISOString(),
    source: "brain/discovered.json",
    discovered_generated_at: data?.generated_at || null,
    catalog_size: catalogSize,
    min_stars: opts.minStars,
    max: opts.max,
    mode: opts.apply ? (opts.pr ? "apply+pr" : "apply") : "dry-run",
    summary: {
      candidates: candidates.length,
      dropped_known: droppedKnown,
      dropped_low_signal: droppedLowSignal,
      survivors: highSignal.length,
      selected: chosen.length,
      already_staged: stubs.length - fresh.length,
      would_add: fresh.length,
    },
    components: stubs.map((s) => ({
      name: s.frontmatter.name, type: s.type, stars: s.frontmatter.stars,
      source_url: s.frontmatter.source_url, source_repo: s.frontmatter.source_repo,
      dest: `incoming/${FEED_SOURCE}/${s.slug}.md`, status: s.status, description_synthesized: s.synthesized,
    })),
  };
  mkdirSync(dirname(PLAN), { recursive: true });
  writeFileSync(PLAN, JSON.stringify(plan, null, 2) + "\n");
  console.log(`wrote plan → brain/crawl-feed-plan.json`);

  let staged = [];
  if (opts.apply) {
    mkdirSync(INCOMING_FEED, { recursive: true });
    for (const s of stubs) {
      if (s.status === "exists") { console.log(`  = skip (already staged) ${s.slug}.md`); continue; }
      writeFileSync(s.dest, s.md);
      console.log(`  -> staged incoming/${FEED_SOURCE}/${s.slug}.md`);
      staged.push(s);
    }
    console.log(`\nstaged ${staged.length} new stub(s) into incoming/${FEED_SOURCE}/ (${stubs.length - fresh.length} already present).`);
    if (opts.pr) openPr(staged.length ? staged : stubs, summaryLines);
    else console.log(`next: node ingest/test-gate.mjs incoming/${FEED_SOURCE} && node ingest/promote.mjs --from incoming/${FEED_SOURCE} --to brain/components --apply && node ingest/catalog.mjs`);
  }

  // 6. One-line summary.
  const verb = opts.apply ? `staged ${staged.length}` : `would-add ${fresh.length}`;
  console.log(`\ncrawl-to-pr: crawled ${candidates.length} · new-after-dedup ${notKnown.length} · kept(≥${opts.minStars}★) ${highSignal.length} · ${verb} → ${plan.mode}\n`);
}

main();
