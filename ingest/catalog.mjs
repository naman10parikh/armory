#!/usr/bin/env node
// Engram catalog generator. Walks brain/components/<type>/*.md, parses YAML
// frontmatter (minimal hand-rolled parser, zero npm deps), writes catalog.json.
// Counts are COMPUTED, never hardcoded. Run: node ingest/catalog.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENTS = join(ROOT, "brain", "components");
const OUT = join(ROOT, "catalog.json");

// The 12 category dirs (the `type:` value === the folder). Source of truth.
export const TYPES = [
  "mcps", "skills", "hooks", "subagents", "identity", "memory",
  "claudemd-rules", "clis-tools", "evals", "observability",
  "infrastructure", "workflows",
];

// Fields the catalog emits per engram, with their default when absent.
const FIELDS = {
  name: "", type: "", description: "", source_repo: "", source_url: "",
  license: "", cli_compat: [], maturity: "", stars: null, eval_score: null,
  verified_at: "", related: [], tags: [],
};

// --- Minimal frontmatter parser (~30 lines) -------------------------------
// Handles: scalars, "null", numbers, [inline, lists], folded (>) blocks,
// and block lists ("- item"). Enough for the engram contract; not full YAML.
export function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const lines = m[1].split(/\r?\n/);
  const out = {};
  let key = null, folded = false, foldBuf = [], listBuf = null;
  const flush = () => {
    if (folded && key) { out[key] = foldBuf.join(" ").trim(); foldBuf = []; folded = false; }
    if (listBuf && key) { out[key] = listBuf; listBuf = null; }
  };
  for (const line of lines) {
    if (folded) { // collecting a folded (>) block until a non-indented line
      if (/^\s+\S/.test(line) || line.trim() === "") { foldBuf.push(line.trim()); continue; }
      flush();
    }
    if (listBuf && /^\s*-\s+/.test(line)) { listBuf.push(coerce(line.replace(/^\s*-\s+/, "").trim())); continue; }
    if (listBuf) flush();
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    flush();
    key = kv[1];
    const val = kv[2].trim();
    if (val === ">" || val === "|") { folded = true; foldBuf = []; }
    else if (val === "") { listBuf = []; } // expect a block list (or stays empty)
    else if (val.startsWith("[")) { out[key] = parseInline(val); }
    else { out[key] = coerce(stripComment(val)); }
  }
  flush();
  return out;
}

function stripComment(v) {
  if (v.startsWith('"') || v.startsWith("'")) return v; // don't strip inside quotes
  return v.replace(/\s+#.*$/, "").trim();
}
function parseInline(v) {
  const inner = v.replace(/^\[/, "").replace(/\].*$/, "").trim();
  if (!inner) return [];
  return inner.split(",").map((s) => coerce(s.trim())).filter((s) => s !== "");
}
function coerce(v) {
  if (v === "null" || v === "~" || v === "") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v.replace(/^["']/, "").replace(/["']$/, "");
}

// --- Walk + build ----------------------------------------------------------
export function buildCatalog() {
  const engrams = [];
  const by_type = Object.fromEntries(TYPES.map((t) => [t, 0]));
  for (const type of TYPES) {
    const dir = join(COMPONENTS, type);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const slug = basename(file, ".md");
      if (slug === type) continue; // skip the category hub note (e.g. mcps/mcps.md)
      const fm = parseFrontmatter(readFileSync(join(dir, file), "utf8"));
      const engram = {};
      for (const [k, def] of Object.entries(FIELDS)) {
        engram[k] = fm[k] !== undefined ? fm[k] : def;
      }
      engram.path = `components/${type}/${file}`;
      engrams.push(engram);
      by_type[type] += 1;
    }
  }
  engrams.sort((a, b) =>
    a.type === b.type ? a.name.localeCompare(b.name) : a.type.localeCompare(b.type)
  );
  return {
    generated_at: new Date().toISOString(),
    counts: { total: engrams.length, by_type },
    engrams,
  };
}

// catalog.json is committed; the CI workflow fails the build if it goes stale.
// `generated_at` changes every run, so compare structure-only when checking drift.
function main() {
  const catalog = buildCatalog();
  writeFileSync(OUT, JSON.stringify(catalog, null, 2) + "\n");
  const { total, by_type } = catalog.counts;
  console.log(`engram catalog → ${OUT}`);
  console.log(`  total: ${total}`);
  for (const t of TYPES) console.log(`  ${t}: ${by_type[t]}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
