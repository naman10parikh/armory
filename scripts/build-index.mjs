#!/usr/bin/env node
// scripts/build-index.mjs — build a compact, queryable inverted index from catalog.json.
//
// WHY: catalog.json (63k+ artifacts, ~37MB) is the version-controlled source of truth, but scanning
// it linearly for every slice/search is slow. This derives a small companion store — brain/index.json —
// that answers "which components are of type X / in domain Y / mentioning keyword Z" in O(1) via posting
// lists. It reuses lib/rank.mjs (computeRows) so the type/domain/signal normalization here is IDENTICAL
// to what the site, CLI and MCP already rank on — one formula, no divergent copy.
//
// NO NEW DEPENDENCY: better-sqlite3 is not installed and we do NOT add it. A plain JSON inverted index
// is enough for slice/search and stays git-diffable, like the catalog itself.
//
// ── QUERY SHAPE (how a consumer reads brain/index.json) ─────────────────────────────────────────────
//   const idx = JSON.parse(fs.readFileSync("brain/index.json", "utf8"));
//   idx.components[i]           → one artifact: { n, t, d, s, k, sig }
//         n=name  t=type(component)  d=domain  s=source_type
//         k=[keywords] the record's salient name/tag terms; by_keyword ALSO indexes description
//           terms, so it has wider search recall than any single record's k.
//         sig={ stars?, usage?, tested?, mentions? }   (only NON-null signals are stored)
//   idx.by_type["skill"]        → [i, …]  indices of every skill        (slice by component)
//   idx.by_domain["payments"]   → [i, …]  indices in the payments domain (slice by domain)
//   idx.by_keyword["stripe"]    → [i, …]  indices whose keywords include "stripe" (search)
//   AND-filter = intersect posting lists, then map indices back to records:
//     const hits = intersect(idx.by_type.skill, idx.by_domain.payments, idx.by_keyword.stripe);
//     hits.map((i) => idx.components[i]);          // → the skills in payments that mention "stripe"
//   Every posting list is ascending, so intersection is a linear two-pointer merge.
// ────────────────────────────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { computeRows } from "../lib/rank.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CATALOG = join(HERE, "..", "catalog.json");
const OUT = join(HERE, "..", "brain", "index.json");

// Grammatical stopwords only — domain words (react, stripe, postgres…) stay fully searchable. Terms that
// are ubiquitous in THIS corpus (mcp, server, ai…) are dropped later by document-frequency, not hardcoded.
const STOP = new Set(
  ("a an the and or of to for in on at by with from into via is are be was were been as it its this that " +
    "these those you your we our they their he she his her not no all any can will would should could may " +
    "use uses used using such more most other than then so if but out over about not").split(/\s+/)
);
const KEEP2 = new Set(["ai", "ui", "ux", "db", "js", "ts", "go", "os", "ci", "cd", "qa", "3d"]); // meaningful 2-char
const DESC_TOKEN_CAP = 20; // descriptions can run long; keep the first N distinct meaningful tokens

// tokenize → lowercase words split on any non-alphanumeric; keep len≥3 (plus a few tech 2-char tokens),
// drop pure-numeric tokens (years/versions) and stopwords. Returns a de-duped, order-preserving list.
function tokenize(str, cap = Infinity) {
  const out = [], seen = new Set();
  for (const w of String(str || "").toLowerCase().split(/[^a-z0-9]+/)) {
    if (!w || seen.has(w) || /^\d+$/.test(w)) continue;
    if (w.length < 3 && !KEEP2.has(w)) continue;
    if (STOP.has(w)) continue;
    seen.add(w); out.push(w);
    if (out.length >= cap) break;
  }
  return out;
}

// source_type — where the artifact lives, bucketed to a small filterable set (github vs registries).
function sourceType(url) {
  let host = "";
  try { host = new URL(url).host.replace(/^www\./, ""); } catch { return "other"; }
  if (host === "github.com") return "github";
  if (host === "smithery.ai") return "smithery";
  if (host === "mcp.so") return "mcp.so";
  if (host === "pulsemcp.com") return "pulsemcp";
  if (host.endsWith("npmjs.com")) return "npm";
  if (host.endsWith("pypi.org")) return "pypi";
  return "registry"; // other MCP registries / directories
}

// keep only non-null signals so the vast majority of records carry an empty sig (the compactness win).
function packSignals(s) {
  const o = {};
  if (s.stars != null) o.stars = s.stars;
  if (s.usage != null) o.usage = s.usage;
  if (s.tested != null) o.tested = s.tested;
  if (s.mentions != null) o.mentions = s.mentions;
  return o;
}

function build() {
  const cat = JSON.parse(readFileSync(CATALOG, "utf8"));
  const raw = cat.components || [];
  const rows = computeRows(raw); // index-aligned with raw; same normalization the ranking engine uses
  const N = rows.length;

  // pass 1 — tokenize each artifact and count document frequency. Two token sets per artifact:
  //   salient = name + tags (few, high-signal) → stored on the record as its own `k` descriptor.
  //   full    = salient + capped description   → powers by_keyword, so search reaches descriptions.
  const salient = new Array(N), full = new Array(N);
  const df = new Map();
  for (let i = 0; i < N; i++) {
    const c = raw[i];
    const tagStr = Array.isArray(c.tags) ? c.tags.join(" ") : c.tags || "";
    const nameTags = [...new Set([...tokenize(c.name), ...tokenize(tagStr)])];
    const set = new Set([...nameTags, ...tokenize(c.description, DESC_TOKEN_CAP)]);
    salient[i] = nameTags; full[i] = set;
    for (const t of set) df.set(t, (df.get(t) || 0) + 1);
  }
  // corpus-ubiquitous terms (in >30% of artifacts) don't discriminate and bloat the index — drop them.
  const CEIL = Math.ceil(0.3 * N);
  const common = new Set([...df].filter(([, n]) => n > CEIL).map(([t]) => t));

  // pass 2 — emit compact records + the three posting-list maps (ascending, since i increases).
  const components = new Array(N);
  // null-prototype maps: keyword tokens like "constructor"/"toString" must not hit Object.prototype.
  const byType = Object.create(null), byDomain = Object.create(null), byKeyword = Object.create(null);
  const push = (m, key, i) => (m[key] || (m[key] = [])).push(i);
  for (let i = 0; i < N; i++) {
    const r = rows[i];
    const k = salient[i].filter((t) => !common.has(t)); // record's own salient keywords (name+tags)
    components[i] = { n: r.name, t: r.component, d: r.domain, s: sourceType(r.url), k, sig: packSignals(r.signals) };
    push(byType, r.component, i);
    push(byDomain, r.domain, i);
    for (const t of full[i]) if (!common.has(t)) push(byKeyword, t, i); // full recall incl. description
  }

  const index = {
    generated_at: new Date().toISOString(),
    source: "catalog.json",
    count: N,
    fields: "components[i]={n:name,t:type,d:domain,s:source_type,k:keywords,sig:{stars?,usage?,tested?,mentions?}}",
    maps: "by_type|by_domain|by_keyword → ascending arrays of components[] indices; intersect for AND",
    dropped_common_keywords: [...common].sort(),
    components, by_type: byType, by_domain: byDomain, by_keyword: byKeyword,
  };
  writeFileSync(OUT, JSON.stringify(index));
  return { N, index, keywords: Object.keys(byKeyword).length, common };
}

// ── run + self-verify ───────────────────────────────────────────────────────────────────────────────
const { N, index, keywords, common } = build();
const bytes = readFileSync(OUT).length; // read back = proves the file was written and parses on disk
const mb = (bytes / 1048576).toFixed(1);
const line = (m) => Object.entries(m).sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `${k}:${v.length}`).join("  ");
console.log(`✓ wrote ${OUT}`);
console.log(`  ${N.toLocaleString()} components · ${keywords.toLocaleString()} keywords · ${mb} MB`);
console.log(`  by_type    ${line(index.by_type)}`);
console.log(`  by_domain  ${line(index.by_domain)}`);
console.log(`  dropped ${common.size} ubiquitous keyword(s): ${[...common].sort().join(", ") || "(none)"}`);
