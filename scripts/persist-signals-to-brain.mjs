#!/usr/bin/env node
// persist-signals-to-brain.mjs — push ranking signals from catalog.json back into the brain markdown.
//
// brain/components/**/*.md is the SOURCE OF TRUTH; catalog.json is the derived index that
// `ingest/catalog.mjs` rebuilds from it. Any signal that lives only in catalog.json is therefore
// DELETED by the next rebuild, silently. That bit us twice in one session:
//   • the star backfill wrote catalog.json → a rebuild reverted all 19,367 stars
//   • the rebuild then dropped enrichment too → tested 60→3, mentions 275→0
// Both are the same bug. This writes all three signals into the frontmatter so a rebuild preserves
// them, which is the only way the ranking survives the nightly loop.
//
// Only touches the signal lines. Never reorders or rewrites anything else in the file.
//
//   node scripts/persist-signals-to-brain.mjs            # dry run
//   node scripts/persist-signals-to-brain.mjs --apply
//
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const apply = process.argv.includes("--apply");

const FIELDS = ["stars", "eval_score", "mentions"];
const render = (v) => (typeof v === "number" ? String(v) : "null");

const cat = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf-8"));
const changed = Object.fromEntries(FIELDS.map((f) => [f, 0]));
let files = 0, same = 0, noFile = 0, noPath = 0;

for (const c of cat.components || []) {
  if (!c.path) { noPath++; continue; }
  const file = join(ROOT, "brain", c.path);
  if (!existsSync(file)) { noFile++; continue; }

  let src = readFileSync(file, "utf-8");
  const orig = src;
  if (src.indexOf("\n---", 4) === -1) { noFile++; continue; }

  for (const f of FIELDS) {
    // A signal the catalog does not carry is left alone — never blank out a value we simply did not
    // compute this run. That would be the same silent-deletion bug, just pointed the other way.
    if (c[f] === undefined || c[f] === null) continue;
    const want = render(c[f]);
    const re = new RegExp(`^${f}:[ \\t]*(.*)$`, "m");
    const m = src.match(re);
    if (m) {
      if (m[1].trim() === want) continue;
      src = src.replace(re, `${f}: ${want}`);
    } else {
      const end = src.indexOf("\n---", 4);
      src = `${src.slice(0, end)}\n${f}: ${want}${src.slice(end)}`;
    }
    changed[f]++;
  }
  if (src !== orig) { files++; if (apply) writeFileSync(file, src); } else same++;
}

for (const f of FIELDS) console.log(`${f.padEnd(11)} updated : ${changed[f].toLocaleString()}`);
console.log(`files touched      : ${files.toLocaleString()}`);
console.log(`already correct    : ${same.toLocaleString()}`);
if (noFile) console.log(`markdown not found : ${noFile.toLocaleString()}`);
if (noPath) console.log(`no path in entry   : ${noPath.toLocaleString()}`);
console.log(apply ? "\nAPPLIED — re-run `node ingest/catalog.mjs` and confirm the counts hold." : "\nDRY RUN — nothing written. Re-run with --apply.");
