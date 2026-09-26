#!/usr/bin/env node
// shelf-fit.mjs — how many rows on the Sandbox, Tools and Dispatch shelves do that shelf's job, by a
// purpose-word gate over name + description. A report only: it changes nothing (docs/SHELF-FIT-PROPOSAL.md).
//
//   node scripts/shelf-fit.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { computeRows, orderByScore } from "../lib/rank.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cat = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf8"));
const stack = JSON.parse(readFileSync(join(ROOT, "web", "src", "data", "stack.json"), "utf8"));
const rows = orderByScore(computeRows(cat.components)).filter((r) => r.scores.universal != null);

const GATES = {
  sandbox: /\b(sandbox(es|ed|ing)?|micro-?vms?|firecracker|isolat(ed|ion)|containers?|virtual machines?|code (execution|interpreter)|execut(e|es|ion) (untrusted|ai-generated|arbitrary)|run(s|ning)? (untrusted|ai-generated) code|dev(elopment)? environments?|workspaces?)\b/i,
  tools: /\b(cli|command[- ]line|terminal|tui|shell)\b/i,
  dispatch: /\b(orchestrat\w*|workflows?|dispatch\w*|pipelines?|schedul\w*|queues?|multi-agent|swarms?|state machines?|durable execution)\b/i,
};
const NOT = {
  tools: /\b(autonomous (coding )?agent|ai (coding )?agent|coding agent|personal ai assistant)\b/i,
  dispatch: /\b(tutorial|guide|course|curriculum|book|awesome|list of|paper|from scratch)\b/i,
};

for (const slug of Object.keys(GATES)) {
  const entry = stack.components.find((c) => c.slug === slug);
  const shelf = rows.filter((r) => entry.aggregates.includes(r.component));
  const text = (r) => `${r.name} ${r.desc}`;
  const fits = (r) => GATES[slug].test(text(r)) && !(NOT[slug] && NOT[slug].test(text(r)));
  const top = shelf.slice(0, 20);
  console.log(`\n${slug}: ${shelf.length} ranked · top 20 that fit: ${top.filter(fits).length} · all that fit: ${shelf.filter(fits).length}`);
  top.forEach((r, i) => console.log(`  ${String(i + 1).padStart(2)} ${fits(r) ? "fits " : "  -  "} ${r.name}`));
  const picks = (entry.picks || []).map((p) => p.armoryName).filter(Boolean);
  console.log(`  picks: ${picks.map((n) => { const r = shelf.find((x) => x.name === n); return `${n} ${r ? (fits(r) ? "fits" : "does not fit") : "not on the shelf"}`; }).join(" · ")}`);
}
