#!/usr/bin/env node
// persist-stars-to-brain.mjs — push star counts from catalog.json back into the brain markdown.
//
// brain/components/**/*.md is the SOURCE OF TRUTH; catalog.json is the derived index that
// `ingest/catalog.mjs` rebuilds from it. backfill-stars.mjs writes the derived file, so without
// this step the next nightly rebuild silently reverts every star it fetched. This closes that loop:
// markdown gets the number, the rebuild preserves it, and the work survives.
//
// Only touches the `stars:` line. Never reorders or rewrites anything else in the file.
//
//   node scripts/persist-stars-to-brain.mjs            # dry run
//   node scripts/persist-stars-to-brain.mjs --apply
//
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const apply = process.argv.includes("--apply");

const cat = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf-8"));
let written = 0, same = 0, cleared = 0, noFile = 0, noPath = 0;

for (const c of cat.components || []) {
  if (!c.path) { noPath++; continue; }
  const file = join(ROOT, "brain", c.path);
  if (!existsSync(file)) { noFile++; continue; }

  const src = readFileSync(file, "utf-8");
  const has = /^stars:.*$/m.test(src);
  const want = typeof c.stars === "number" && c.stars > 0 ? String(c.stars) : "null";
  const current = has ? (src.match(/^stars:[ \t]*(.*)$/m) || [])[1]?.trim() : null;
  if (current === want) { same++; continue; }

  let next;
  if (has) {
    next = src.replace(/^stars:.*$/m, `stars: ${want}`);
  } else {
    // Insert into the frontmatter block, right before its closing delimiter.
    const end = src.indexOf("\n---", 4);
    if (end === -1) { noFile++; continue; }
    next = `${src.slice(0, end)}\nstars: ${want}${src.slice(end)}`;
  }
  if (want === "null") cleared++; else written++;
  if (apply) writeFileSync(file, next);
}

console.log(`stars written to markdown : ${written.toLocaleString()}`);
console.log(`stars cleared (inherited)  : ${cleared.toLocaleString()}`);
console.log(`already correct            : ${same.toLocaleString()}`);
if (noFile) console.log(`markdown not found         : ${noFile.toLocaleString()}`);
if (noPath) console.log(`no path in catalog entry   : ${noPath.toLocaleString()}`);
console.log(apply ? "\nAPPLIED — re-run `node ingest/catalog.mjs` to confirm the rebuild keeps them." : "\nDRY RUN — nothing written. Re-run with --apply.");
