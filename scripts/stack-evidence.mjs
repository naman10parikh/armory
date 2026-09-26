#!/usr/bin/env node
// scripts/stack-evidence.mjs — re-derive the evidence behind /stack (CP138 T45).
//
// For each of the eleven harness components: the pick, its live score, where it places on its own
// shelf, the shelf's top-scored row, and how much of the shelf carries any signal at all. It reads the
// files the site reads (catalog.json, lib/rank.mjs, web/src/data/stack.json), so its numbers are the
// page's numbers. A pick that is not its shelf's top row is a deliberate override; this is where the
// override is visible.
//
//   node scripts/stack-evidence.mjs          # a table
//   node scripts/stack-evidence.mjs --json   # the same rows as JSON
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { computeRows, orderByScore } from "../lib/rank.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const stack = JSON.parse(readFileSync(join(ROOT, "web/src/data/stack.json"), "utf8"));
const catalog = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf8"));
const ordered = orderByScore(computeRows(catalog.components));

const rows = stack.components.map((c) => {
  const shelf = ordered.filter((r) => c.aggregates.includes(r.component) && r.fits);
  const scored = shelf.filter((r) => r.scores.universal != null);
  const pick = c.picks[0];
  const place = scored.findIndex((r) => r.name === pick.armoryName);
  const row = place >= 0 ? scored[place] : null;
  return {
    component: c.label,
    pick: pick.name,
    score: row ? row.scores.universal : null,
    place: place >= 0 ? place + 1 : null,
    shelfTop: scored[0]?.name ?? null,
    shelfTopScore: scored[0]?.scores.universal ?? null,
    scored: scored.length,
    pool: shelf.length,
  };
});

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ asOf: stack.asOf, generatedAt: catalog.generated_at, rows }, null, 2));
} else {
  const pad = (v, n) => String(v ?? "unranked").padEnd(n);
  const one = (v) => (v == null ? null : v.toFixed(1));
  console.log(`Picks as of ${stack.asOf} · catalog generated ${catalog.generated_at}\n`);
  console.log(`${pad("Component", 15)}${pad("Pick", 30)}${pad("Score", 10)}${pad("Place", 7)}${pad("Shelf top", 38)}Scored / on shelf`);
  for (const r of rows) {
    const top = r.shelfTop ? `${r.shelfTop} ${one(r.shelfTopScore)}` : "none";
    console.log(`${pad(r.component, 15)}${pad(r.pick, 30)}${pad(one(r.score), 10)}${pad(r.place, 7)}${pad(top, 38)}${r.scored} / ${r.pool}`);
  }
}
