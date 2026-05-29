#!/usr/bin/env node
// Armory test-gate — the Hamel testing pyramid as a promote/no-drift gate.
//   L1 functional (schema): frontmatter parses · required fields · valid type · slug name.
//   L2 behavioral: the component is actually USABLE gear, not an empty husk — non-trivial
//      description, resolvable source_url shape, non-empty body, tags present. This is what
//      stops skills going stale/adrift (chairman's ask): a drifting entry fails L2.
//   L3 semantic ("does it still work"): handled by `claude -p` in autolab.yml (out of scope here).
// Deterministic, zero-dep, CI-safe. Run: node ingest/test-gate.mjs [dir]  (default brain/components).
// Exit 0 = PASS · 1 = functional failures (hard block) · 2 = behavioral drift over tolerance.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TYPES = new Set([
  "mcps", "skills", "subagents", "hooks", "claudemd-rules", "clis-tools",
  "evals", "observability", "infrastructure", "workflows", "identity", "memory",
]);

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) walk(f, acc);
    // skip READMEs/MOCs and per-type hub pages (e.g. skills/skills.md — navigation, not a component)
    else if (f.endsWith(".md") && !/^(README|MOC|index)/i.test(e) && e.replace(/\.md$/, "") !== basename(dir)) acc.push(f);
  }
  return acc;
}

// Grade one component. Returns {l1:[failures], l2:[failures]}. Empty arrays = pass.
export function gradeComponent(raw) {
  const l1 = [], l2 = [];
  let fm;
  try { fm = parseFrontmatter(raw); } catch (e) { return { l1: [`frontmatter parse: ${e.message}`], l2 }; }
  // L1 — functional / schema
  if (!fm.name || !/^[a-z0-9][a-z0-9-]*$/.test(String(fm.name))) l1.push("name not a valid slug");
  if (!TYPES.has(fm.type)) l1.push(`type "${fm.type}" not one of the 12`);
  if (!("description" in fm)) l1.push("missing description");
  // L2 — behavioral / usability (anti-drift)
  const desc = String(fm.description || "").trim();
  if (desc.length < 12) l2.push("description too thin (<12 chars) — husk/stale");
  if (desc && desc.toLowerCase() === String(fm.name || "").replace(/-/g, " ")) l2.push("description == name (no info)");
  const url = String(fm.source_url || "");
  if (url && !/^https?:\/\//.test(url)) l2.push("source_url is not a URL");
  if (!Array.isArray(fm.tags) || fm.tags.length === 0) l2.push("no tags");
  const body = raw.replace(/^---[\s\S]*?---/, "").trim();
  if (body.length < 30) l2.push("body too short — not usable gear");
  return { l1, l2 };
}

function main(argv) {
  const dir = argv[2] ? join(ROOT, argv[2]) : join(ROOT, "brain/components");
  const files = walk(dir);
  let l1f = 0, l2f = 0;
  const sample = [];
  for (const f of files) {
    const { l1, l2 } = gradeComponent(readFileSync(f, "utf8"));
    if (l1.length) { l1f++; if (sample.length < 12) sample.push(`L1 ${f.replace(ROOT + "/", "")}: ${l1[0]}`); }
    if (l2.length) { l2f++; if (sample.length < 12) sample.push(`L2 ${f.replace(ROOT + "/", "")}: ${l2[0]}`); }
  }
  const total = files.length;
  const l2rate = total ? l2f / total : 0;
  console.log(`test-gate: ${total} components · L1(functional) fail ${l1f} · L2(behavioral) fail ${l2f} (${(l2rate * 100).toFixed(2)}%)`);
  for (const s of sample) console.log("  - " + s);
  if (l1f > 0) { console.error(`::error:: ${l1f} functional failures — block (no broken schema enters).`); process.exit(1); }
  if (l2rate > 0.02) { console.error(`::error:: behavioral fail ${(l2rate * 100).toFixed(2)}% > 2% — components drifting/stale.`); process.exit(2); }
  console.log("test-gate: PASS");
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
