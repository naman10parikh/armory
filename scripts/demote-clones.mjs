#!/usr/bin/env node
// demote-clones.mjs — catalog clean pass (CP137 T55): numbered clone rows out of the catalog.
//
// An older ingest handled a name collision by suffixing (`a2a-ui`, `a2a-ui-2`, `…-3`) instead of
// deduping on the URL, so 533 groups of identical rows — same type, same source_url, same description —
// sat in the catalog, tripled /ask answers, and inflated every count. The base name stays; the clones
// are MOVED (git mv — never deleted) to brain/lookup/duplicates/<type>/, outside the catalog walk.
//
//   node scripts/demote-clones.mjs            # dry run: list the groups
//   node scripts/demote-clones.mjs --apply    # git mv the clones, then rebuild the catalog
//
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const apply = process.argv.includes("--apply");
const cat = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf-8")).components;

const key = (c) => `${c.type}|${String(c.source_url || "").toLowerCase().replace(/\/$/, "")}`;
const groups = new Map();
for (const c of cat) {
  if (!c.source_url) continue;
  (groups.get(key(c)) || groups.set(key(c), []).get(key(c))).push(c);
}

let moved = 0, groupsHit = 0;
for (const rows of groups.values()) {
  if (rows.length < 2) continue;
  // Only the suffix pattern: every name in the group shares one base once a trailing -N is removed.
  const base = (n) => n.replace(/-\d+$/, "");
  if (new Set(rows.map((r) => base(r.name))).size !== 1) continue;
  // Keep the unsuffixed row when it exists, else the lowest suffix. A clone with a DIFFERENT
  // description is not a clone — leave that whole group alone for a human.
  const sorted = [...rows].sort((a, b) => a.name.length - b.name.length || a.name.localeCompare(b.name));
  const keep = sorted[0];
  const clones = sorted.slice(1);
  if (clones.some((c) => (c.description || "").trim() !== (keep.description || "").trim())) continue;
  groupsHit++;
  for (const c of clones) {
    const from = join(ROOT, "brain", c.path);
    if (!existsSync(from)) continue;
    const toDir = join(ROOT, "brain", "lookup", "duplicates", c.type);
    if (apply) {
      mkdirSync(toDir, { recursive: true });
      execFileSync("git", ["-C", ROOT, "mv", "-k", from, join(toDir, `${c.name}.md`)]);
    }
    moved++;
  }
  if (groupsHit <= 5) console.log(`  ${keep.name}  ←  ${clones.map((c) => c.name).join(", ")}`);
}
console.log(`\n${groupsHit} clone groups · ${moved} rows ${apply ? "moved to brain/lookup/duplicates/" : "would move (dry run; --apply)"}`);
if (apply) console.log("Next: node ingest/catalog.mjs && node ingest/validate.mjs && node ingest/test-gate.mjs");
