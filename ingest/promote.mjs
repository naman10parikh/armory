#!/usr/bin/env node
// Engram promoter. Validates stubs in a source dir against the engram contract,
// dedupes by (name,type) against the target components dir, and moves/copies the
// valid, unique ones into <to>/<type>/. DEFAULT --dry-run: the real target is
// NEVER touched unless BOTH --apply AND --to <path> are passed. Zero npm deps.
//
// Two modes:
//   single-source : promote.mjs --from <dir> [--to <componentsDir>] [--apply]
//   global (all)  : promote.mjs --all [--to <componentsDir>] [--apply]
//                   walks every incoming/<source> in PRIORITY order and dedupes
//                   GLOBALLY by (normalized-name, type) across all sources +
//                   existing components. One winner per component, ever.
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { join, dirname, basename, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter, TYPES } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
// Per the contract (mirrors validate.mjs REQUIRED).
const REQUIRED = ["name", "type", "description", "source_url", "license", "verified_at"];

// Source priority for global dedup (lower index = higher priority = wins ties of
// provenance). TRUE Energy SEED (hand-authored) is handled separately (rank -1,
// always wins). The chairman ladder for the mega-crawl scale-up is:
//   existing-SEED-Energy > anthropic-official/official > modelcontextprotocol
//   > pulsemcp (enriched) > ecc > curated collections > awesome-lists.
// `modelcontextprotocol`/official servers live INSIDE pulsemcp-full, so they win
// via the richness tiebreak (their descriptions are fuller). The enriched
// pulsemcp-full SUPERSET outranks the thin awesome-mcp-servers first-pass, so a
// pulsemcp entry for the same component beats the bulk awesome import — exactly
// the chairman's "collapse those into the pulsemcp entries" directive.
const SOURCE_PRIORITY = [
  // official Anthropic
  "anthropic-official",
  "anthropic-skills",
  // enriched registries (pulsemcp is the 16K superset; ecc-full is the deep ecc)
  "pulsemcp-full",
  "pulsemcp",
  "ecc-full",
  "ecc",
  // curated, hand-authored collections
  "cc-subagents",
  "cc-hooks",
  // awesome-* community lists (superset ranks just after the curated subset)
  "awesome-claude-code",
  "awesome-claude-code-full",
  "wshobson",
  "cursor-rules",
  "awesome-mcp-servers",
];

// Map an existing (already-promoted) component's BODY text to the rank it WOULD
// have had if re-ingested today. The mega-crawl re-imports the same upstreams,
// so a component bulk-imported from awesome-mcp-servers in the first pass must be
// BEATABLE by its richer pulsemcp-full twin. TRUE Energy SEED (hand-authored,
// naman10parikh, or no recognizable collection marker) returns -1 (unbeatable).
// Detection keys off the migration footer each importer stamps into the body.
const PROVENANCE_RANK = (() => {
  const idx = (s) => { const i = SOURCE_PRIORITY.indexOf(s); return i === -1 ? SOURCE_PRIORITY.length : i; };
  // ordered: first matching pattern wins
  const patterns = [
    [/naman10parikh/, -1],                                   // TRUE Energy SEED
    [/anthropic-quickstarts|Official `anthropics/, idx("anthropic-official")],
    [/PulseMCP registry|pulsemcp\.com/, idx("pulsemcp-full")],
    [/affaan-m\/ecc|Vendored from `affaan/, idx("ecc-full")],
    [/VoltAgent\/awesome-claude-code-subagents/, idx("cc-subagents")],
    [/decider\/claude-hooks|claude-hooks/, idx("cc-hooks")],
    [/awesome-cursorrules/, idx("cursor-rules")],
    [/wshobson/, idx("wshobson")],
    [/awesome-claude-code/, idx("awesome-claude-code-full")],
    [/awesome-mcp-servers navigation/, idx("awesome-mcp-servers")],
  ];
  return (raw) => {
    for (const [re, rank] of patterns) if (re.test(raw)) return rank;
    return -1; // unrecognized → treat as TRUE SEED (hand-authored), unbeatable
  };
})();

// --- name normalization (the dedup key) -----------------------------------
// lowercase, strip a trailing -mcp / -server (and -mcp-server) suffix, then
// strip every non-alphanumeric char. Collapses near-dupes like
// stripe/stripe-mcp, context7/context7-mcp, github/github-server. Does NOT
// strip owner prefixes, so microsoft-playwright-mcp and
// executeautomation-playwright-mcp-server stay distinct (different repos).
export function normName(name) {
  let s = String(name || "").toLowerCase().trim();
  // strip common server/mcp suffixes (repeatedly, e.g. "-mcp-server")
  let prev;
  do {
    prev = s;
    s = s.replace(/[-_](mcp|server)$/i, "");
  } while (s !== prev);
  s = s.replace(/[^a-z0-9]/g, "");
  return s;
}

// Recursively collect every .md under a dir (stubs may be nested by source).
// README.md is skipped — it is source documentation, not an engram.
function walkMd(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === "README.md") continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walkMd(p));
    else if (entry.endsWith(".md")) out.push(p);
  }
  return out;
}

// Validate one stub's frontmatter against the contract. Returns string[] of errors.
function validateStub(fm, filePath) {
  const errs = [];
  const slug = basename(filePath, ".md");
  for (const f of REQUIRED) {
    if (fm[f] === undefined || fm[f] === null || fm[f] === "") errs.push(`missing required field "${f}"`);
  }
  if (fm.type !== undefined && !TYPES.includes(fm.type)) errs.push(`type "${fm.type}" not one of the 12 categories`);
  if (fm.name !== undefined && fm.name !== slug) errs.push(`name "${fm.name}" must equal filename "${slug}"`);
  return errs;
}

// Build the set of (name|type) keys already present in the target components dir.
function existingKeys(toDir) {
  const keys = new Set();
  for (const type of TYPES) {
    const dir = join(toDir, type);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const fm = parseFrontmatter(readFileSync(join(dir, file), "utf8"));
      if (fm.name && fm.type) keys.add(`${fm.name}|${fm.type}`);
    }
  }
  return keys;
}

// --- richness scoring for tie-breaks --------------------------------------
function hasRealLicense(lic) {
  const v = String(lic || "").toLowerCase().trim();
  return v !== "" && v !== "unknown" && v !== "~" && v !== "null";
}
// Higher = better. Used when two candidates share provenance rank.
function richness(fm) {
  const desc = (fm.description || "").length;
  const lic = hasRealLicense(fm.license) ? 1 : 0;
  const stars = typeof fm.stars === "number" ? fm.stars : 0;
  return { desc, lic, stars };
}
// Returns true if candidate A should beat the currently-held winner B.
// Priority: (1) lower source rank, (2) richer description, (3) real license,
// (4) more stars. existing-SEED candidates carry rank = -1 and are unbeatable.
function beats(a, b) {
  if (a.rank !== b.rank) return a.rank < b.rank;
  const ra = a.score, rb = b.score;
  if (ra.desc !== rb.desc) return ra.desc > rb.desc;
  if (ra.lic !== rb.lic) return ra.lic > rb.lic;
  if (ra.stars !== rb.stars) return ra.stars > rb.stars;
  return false; // genuine tie — keep incumbent (stable, deterministic by walk order)
}

// --- single-source promote (original behaviour, exact-key dedup) ----------
export function promote(fromDir, toComponentsDir, { dryRun = true, log = console.log } = {}) {
  const result = { promoted: [], skipped: [], invalid: [] };
  const seen = existingKeys(toComponentsDir); // dedupe vs target + within this run
  for (const filePath of walkMd(fromDir)) {
    const raw = readFileSync(filePath, "utf8");
    const fm = parseFrontmatter(raw);
    const errs = validateStub(fm, filePath);
    if (errs.length) { result.invalid.push({ filePath, errs }); log(`  ✗ INVALID ${filePath}: ${errs.join("; ")}`); continue; }
    const key = `${fm.name}|${fm.type}`;
    if (seen.has(key)) { result.skipped.push({ filePath, key }); log(`  = DUP     ${filePath} (${key} already present)`); continue; }
    seen.add(key);
    const dest = join(toComponentsDir, fm.type, `${fm.name}.md`);
    if (dryRun) { log(`  [dry-run] would promote ${filePath} -> ${dest}`); }
    else {
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, raw);   // copy content to target
      rmSync(filePath);           // then remove the stub (move semantics)
      log(`  -> PROMOTE ${filePath} -> ${dest}`);
    }
    result.promoted.push({ filePath, dest, key });
  }
  log(`${dryRun ? "[dry-run] " : ""}promote: ${result.promoted.length} promoted, ${result.skipped.length} dup, ${result.invalid.length} invalid`);
  return result;
}

// --- GLOBAL promote across all incoming sources ---------------------------
// Walks every source in SOURCE_PRIORITY order, validates, then dedupes by
// (normName, type) GLOBALLY (against existing SEED components too). Keeps the
// single best engram per key using beats(). Writes winners to <to>/<type>/.
export function promoteAll(incomingDir, toComponentsDir, sources, { dryRun = true, log = console.log, quiet = true } = {}) {
  // 1. Seed the winners map with the components already in brain/components/.
  //    TRUE Energy SEED (hand-authored) is rank -1 and unbeatable. Components
  //    bulk-imported from an upstream collection in a PRIOR pass are seeded at
  //    THAT collection's rank (via PROVENANCE_RANK), so the mega-crawl's richer
  //    twin of the same component can beat & replace it. `existingPath` is kept
  //    so a winning challenger can delete the stale (differently-slugged) file.
  const winners = new Map(); // dedupKey -> { fm, raw, filePath, existingPath, rank, score, source, fromExisting }
  let existingCount = 0;
  let trueSeedCount = 0;
  for (const type of TYPES) {
    const dir = join(toComponentsDir, type);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const slug = basename(file, ".md");
      if (slug === type) continue; // category hub note — not an engram
      const path = join(dir, file);
      const raw = readFileSync(path, "utf8");
      const fm = parseFrontmatter(raw);
      if (!fm.name || !fm.type) continue;
      const k = `${normName(fm.name)}|${fm.type}`;
      const rank = PROVENANCE_RANK(raw);
      if (rank === -1) trueSeedCount += 1;
      winners.set(k, { fm, raw: null, filePath: null, existingPath: path, rank, score: richness(fm), source: "existing", fromExisting: true });
      existingCount += 1;
    }
  }

  const stats = {
    totalStubs: 0, invalid: 0, validUnique: 0, duplicatesCollapsed: 0,
    bySource: {}, perKeyConsidered: 0, existingSeed: existingCount, trueSeed: trueSeedCount,
    existingReplaced: 0, invalidSamples: [], collapsedSamples: [],
  };

  // 2. Walk sources in priority order; for each valid stub, contest its dedup key.
  sources.forEach((source, idx) => {
    const rank = idx; // SOURCE_PRIORITY order; existing SEED is -1
    const srcDir = join(incomingDir, source);
    const files = walkMd(srcDir);
    stats.bySource[source] = { stubs: 0, invalid: 0, won: 0, lost: 0 };
    for (const filePath of files) {
      stats.totalStubs += 1;
      stats.bySource[source].stubs += 1;
      const raw = readFileSync(filePath, "utf8");
      const fm = parseFrontmatter(raw);
      const errs = validateStub(fm, filePath);
      if (errs.length) {
        stats.invalid += 1; stats.bySource[source].invalid += 1;
        if (stats.invalidSamples.length < 15) stats.invalidSamples.push(`${filePath}: ${errs.join("; ")}`);
        continue;
      }
      const k = `${normName(fm.name)}|${fm.type}`;
      const cand = { fm, raw, filePath, existingPath: null, rank, score: richness(fm), source, fromExisting: false };
      const cur = winners.get(k);
      if (!cur) {
        winners.set(k, cand);
        stats.bySource[source].won += 1;
      } else {
        // a duplicate of an already-claimed component
        stats.duplicatesCollapsed += 1;
        if (beats(cand, cur)) {
          // candidate is better — it takes over; the previous winner becomes a loss.
          if (cur.fromExisting) {
            // We're displacing a component already on disk (a beatable prior
            // import). Carry its path so the emit loop deletes the stale file
            // (the new winner may have a different slug, else it overwrites).
            cand.existingPath = cur.existingPath;
            stats.existingReplaced += 1;
          } else if (cur.source && stats.bySource[cur.source]) {
            stats.bySource[cur.source].won -= 1; stats.bySource[cur.source].lost += 1;
            if (cur.existingPath) cand.existingPath = cur.existingPath; // preserve chain
          }
          winners.set(k, cand);
          stats.bySource[source].won += 1;
        } else {
          stats.bySource[source].lost += 1;
        }
        if (stats.collapsedSamples.length < 20) {
          const w = winners.get(k);
          stats.collapsedSamples.push(`${k}: kept ${w.source}/${basename(w.filePath || w.existingPath || "existing")}, dropped ${source}/${basename(filePath)}`);
        }
      }
    }
  });

  // 3. Emit winners that came from incoming/. A winner is either NET-NEW (no
  //    existing component held this dedup key) or a REPLACEMENT (it beat a prior
  //    on-disk import). For replacements with a different slug, delete the stale
  //    existing file so we never leave an orphan twin behind.
  let promoted = 0;          // files written from incoming/ (net-new + replacements)
  let netNew = 0;            // dedup keys not previously on disk
  let staleRemoved = 0;      // stale existing files deleted because the new slug differs
  const promotedPaths = [];
  for (const [, w] of winners) {
    if (w.fromExisting) continue; // unchanged existing component — already live
    const dest = join(toComponentsDir, w.fm.type, `${w.fm.name}.md`);
    const replacing = !!w.existingPath;
    if (!replacing) netNew += 1;
    const slugDiffers = replacing && resolvePath(w.existingPath) !== resolvePath(dest);
    if (dryRun) {
      if (!quiet) log(`  [dry-run] would ${replacing ? "REPLACE" : "promote"} ${w.filePath} -> ${dest}${slugDiffers ? ` (remove stale ${basename(w.existingPath)})` : ""}`);
    } else {
      mkdirSync(dirname(dest), { recursive: true });
      if (slugDiffers && existsSync(w.existingPath)) rmSync(w.existingPath); // drop orphan twin
      writeFileSync(dest, w.raw);
      rmSync(w.filePath); // move semantics: stub consumed from incoming/
    }
    if (slugDiffers) staleRemoved += 1;
    promoted += 1;
    promotedPaths.push(dest);
  }
  stats.validUnique = promoted;
  stats.netNew = netNew;
  stats.staleRemoved = staleRemoved;
  // Final unique count = unchanged existing + replacements (same slug, no orphan) +
  // net-new. Replacements that removed a differently-named orphan don't grow the
  // count; same-slug replacements overwrite in place. So: existing - staleRemoved
  // (orphans deleted) + promoted (all incoming winners written).
  stats.totalAfter = existingCount - staleRemoved + promoted;

  // 4. Report.
  log(`${dryRun ? "[dry-run] " : ""}promoteAll across ${sources.length} sources:`);
  log(`  total stubs scanned : ${stats.totalStubs}`);
  log(`  invalid (skipped)   : ${stats.invalid}`);
  log(`  existing on disk     : ${existingCount} (TRUE seed: ${trueSeedCount})`);
  log(`  duplicates collapsed: ${stats.duplicatesCollapsed}`);
  log(`  existing replaced   : ${stats.existingReplaced} (stale orphans removed: ${staleRemoved})`);
  log(`  net-new promoted    : ${netNew}`);
  log(`  files written       : ${promoted}`);
  log(`  TOTAL after promote : ${stats.totalAfter}`);
  log(`  per-source: ` + sources.map((s) => `${s}=${stats.bySource[s].won}w/${stats.bySource[s].lost}l/${stats.bySource[s].invalid}x`).join("  "));
  return { stats, promotedPaths };
}

// --- light related[] enrichment (the synapses) ----------------------------
// Adds up to `maxLinks` `related:` links to engrams that currently have an
// EMPTY related list, linking to siblings of the SAME type that share >= 2
// tags. NEVER overwrites an existing (curated) related list. Restricted to a
// small set of types — generic, high-cardinality buckets (mcps, skills,
// workflows) are skipped because their tags are too coarse to make a real
// synapse. Cheap: a single in-place line edit per touched file. Idempotent.
const ENRICH_TYPES = ["observability", "hooks", "claudemd-rules", "subagents", "clis-tools"];
export function enrichRelated(toComponentsDir, { types = ENRICH_TYPES, maxLinks = 2, apply = false, log = console.log } = {}) {
  let touched = 0, links = 0;
  for (const type of types) {
    const dir = join(toComponentsDir, type);
    if (!existsSync(dir)) continue;
    const items = [];
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const slug = basename(file, ".md");
      if (slug === type) continue;
      const raw = readFileSync(join(dir, file), "utf8");
      const fm = parseFrontmatter(raw);
      items.push({ file, slug, name: fm.name, tags: Array.isArray(fm.tags) ? fm.tags : [], related: Array.isArray(fm.related) ? fm.related : [], raw });
    }
    for (const it of items) {
      if (it.related.length > 0) continue; // never clobber curated synapses
      // score siblings by shared-tag count
      const scored = items
        .filter((o) => o.name !== it.name)
        .map((o) => ({ name: o.name, shared: o.tags.filter((t) => it.tags.includes(t)).length }))
        .filter((o) => o.shared >= 2)
        .sort((a, b) => (b.shared - a.shared) || a.name.localeCompare(b.name))
        .slice(0, maxLinks)
        .map((o) => o.name);
      if (scored.length === 0) continue;
      touched += 1; links += scored.length;
      if (apply) {
        // replace the first `related: [...]` (or `related:`) line in the frontmatter
        const replacement = `related: [${scored.join(", ")}]`;
        const next = it.raw.replace(/^related:.*$/m, replacement);
        writeFileSync(join(dir, it.file), next);
      }
    }
  }
  log(`${apply ? "" : "[dry-run] "}enrichRelated: ${touched} engram(s) linked, ${links} synapse(s) added across ${types.length} types`);
  return { touched, links };
}

// --- secondary dedup by identical source_url ------------------------------
// The (normName,type) pass misses two same-component spellings that don't
// normalize-match: owner-prefixed vs bare (21st-dev-magic-mcp / magic-21st-dev)
// and numeric-disambiguated re-listings (foo / foo-2). The strongest signal
// that two engrams are the SAME component is an identical source_url. This pass
// collapses same-(source_url,type) groups, keeping ONE — EXCEPT when the URL is
// a SEED repo or a config-file aggregator, because one such repo/file
// legitimately contributes MANY distinct engrams (claude-harness's rules,
// agentswarm's subagents, ecc's .mcp.json listing exa+memory+playwright).
function normUrl(u) {
  return String(u || "").toLowerCase().trim()
    .replace(/^https?:\/\//, "").replace(/\.git$/, "").replace(/\/+$/, "");
}
// A URL that legitimately hosts multiple engrams — never collapse these.
function isMultiComponentUrl(u) {
  return /naman10parikh/.test(u)          // the Energy SEED monorepos
    || /\.json($|\?)/.test(u)             // a config file (.mcp.json, *.json)
    || /mcp-servers/.test(u);             // an aggregated server list
}
// Keep-preference within a same-url group: cleaner canonical name wins.
// (no owner prefix) > (no trailing -N) > real license > more stars > shorter name.
function keepRank(fm) {
  const name = String(fm.name || "");
  const ownerPrefixed = name.split("-").length >= 3 ? 1 : 0; // crude: 3+ tokens ~ owner-repo-suffix
  const numbered = /-\d+$/.test(name) ? 1 : 0;
  const noLic = hasRealLicense(fm.license) ? 0 : 1;
  const negStars = -(typeof fm.stars === "number" ? fm.stars : 0);
  const len = name.length;
  return [ownerPrefixed, numbered, noLic, negStars, len]; // lexicographically smaller = kept
}
function cmpRank(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}
export function dedupBySourceUrl(toComponentsDir, { apply = false, log = console.log } = {}) {
  const groups = new Map(); // `${url}|${type}` -> [{file, type, fm}]
  for (const type of TYPES) {
    const dir = join(toComponentsDir, type);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const slug = basename(file, ".md");
      if (slug === type) continue;
      const path = join(dir, file);
      const fm = parseFrontmatter(readFileSync(path, "utf8"));
      const u = normUrl(fm.source_url);
      if (!u) continue;
      const k = `${u}|${type}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push({ path, file, type, fm });
    }
  }
  let removed = 0, collapsedGroups = 0;
  for (const [k, arr] of groups) {
    if (arr.length < 2) continue;
    const u = k.split("|")[0];
    if (isMultiComponentUrl(u)) continue; // legit multi-component repo/config
    collapsedGroups += 1;
    arr.sort((a, b) => cmpRank(keepRank(a.fm), keepRank(b.fm)));
    const keep = arr[0];
    const drop = arr.slice(1);
    log(`  collapse ${k}: keep ${keep.file}, drop ${drop.map((d) => d.file).join(", ")}`);
    for (const d of drop) {
      removed += 1;
      if (apply) rmSync(d.path);
    }
  }
  log(`${apply ? "" : "[dry-run] "}dedupBySourceUrl: ${collapsedGroups} group(s), ${removed} redundant engram(s) removed`);
  return { collapsedGroups, removed };
}

// --- CLI ------------------------------------------------------------------
function main(argv) {
  const args = argv.slice(2);
  const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : undefined; };
  const all = args.includes("--all");
  const enrich = args.includes("--enrich");
  const dedupUrl = args.includes("--dedup-url");
  const from = get("--from");
  const to = get("--to");
  const apply = args.includes("--apply");
  const verbose = args.includes("--verbose");

  if (enrich) {
    const target = to || join(ROOT, "brain", "components");
    enrichRelated(target, { apply });
    return;
  }

  if (dedupUrl) {
    const target = to || join(ROOT, "brain", "components");
    dedupBySourceUrl(target, { apply: apply && !!to });
    return;
  }

  if (all) {
    // GUARD: real promotion requires BOTH --apply AND an explicit --to.
    const dryRun = !(apply && to);
    if (apply && !to) { console.error("refusing to --apply without --to <componentsDir> (no implicit target)"); process.exit(2); }
    const target = to || join(ROOT, "brain", "components");
    promoteAll(INCOMING, target, SOURCE_PRIORITY, { dryRun, quiet: !verbose });
    return;
  }

  if (!from) { console.error("usage: promote.mjs --all [--to <dir>] [--apply]   |   --from <dir> [--to <dir>] [--apply]   (default: dry-run)"); process.exit(2); }
  // GUARD: real promotion requires BOTH --apply AND an explicit --to. No implicit
  // default target — promote.mjs will never write to the real brain on its own.
  const dryRun = !(apply && to);
  if (apply && !to) { console.error("refusing to --apply without --to <componentsDir> (no implicit target)"); process.exit(2); }
  const target = to || join(ROOT, "brain", "components"); // only used to READ existing keys in dry-run
  promote(from, target, { dryRun });
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
