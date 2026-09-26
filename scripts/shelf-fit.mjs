#!/usr/bin/env node
// shelf-fit.mjs: what the shelf-fit gate (lib/rank.mjs SHELF_FIT, docs/SHELF-FIT-PROPOSAL.md) does to the
// Sandbox, Tools and Dispatch shelves: rows and ranked rows before and after, the first rows that fit, and
// whether each pick does. Rows listed on a shelf by lib/rank.mjs SHELF_MOVES print "moved from <type>".
// A report only: it changes nothing. The site, /api/rank, the CLI and the MCP server
// all list through the same `fits` flag this prints.
//
//   node scripts/shelf-fit.mjs          # counts, the first 50 rows that fit, and the picks
//   node scripts/shelf-fit.mjs 20 out   # the first 20, plus every ranked row left out
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SHELF_FIT, SHELF_MOVES, computeRows, orderByScore } from "../lib/rank.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cat = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf8"));
const stack = JSON.parse(readFileSync(join(ROOT, "web", "src", "data", "stack.json"), "utf8"));
const rows = orderByScore(computeRows(cat.components));
const full = new Map(cat.components.map((c) => [`${c.type}/${c.name}`, c.description || ""]));
const N = Number(process.argv[2]) || 50;
const ranked = (list) => list.filter((r) => r.scores.universal != null).length;
const line = (s) => s.replace(/\s+/g, " ").slice(0, 110);

for (const entry of stack.components.filter((c) => c.aggregates.some((a) => SHELF_FIT[a]))) {
  const rule = SHELF_FIT[entry.aggregates.find((a) => SHELF_FIT[a])];
  const filed = rows.filter((r) => entry.aggregates.includes(r.component));
  const listed = filed.filter((r) => r.fits);
  console.log(`\n${entry.label}: lists only rows made to ${rule.purpose}`);
  console.log(`  rows ${filed.length} -> ${listed.length} · ranked ${ranked(filed)} -> ${ranked(listed)}`);
  listed.slice(0, N).forEach((r, i) => {
    const how = SHELF_MOVES[`${r.type}/${r.name}`] ? `moved from ${r.type} ` : rule.allow.includes(r.name) ? "allowed " : "";
    console.log(`  ${String(i + 1).padStart(3)} ${String(r.scores.universal ?? "-").padStart(5)} ${how}${r.name} | ${line(full.get(`${r.type}/${r.name}`) ?? "")}`);
  });
  const picks = entry.picks.map((p) => p.armoryName).filter(Boolean);
  console.log(`  picks: ${picks.map((n) => `${n} ${listed.some((r) => r.name === n) ? "listed" : "NOT LISTED"}`).join(" · ")}`);
  if (process.argv.includes("out")) {
    console.log("  ranked rows left out:");
    for (const r of filed.filter((x) => !x.fits && x.scores.universal != null)) console.log(`    ${r.scores.universal} ${r.name} | ${line(full.get(`${r.type}/${r.name}`) ?? "")}`);
  }
}
