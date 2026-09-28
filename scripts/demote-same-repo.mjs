#!/usr/bin/env node
// demote-same-repo.mjs — one GitHub repository, one row, on any shelf (CP138 T56, CP143).
//
// demote-renamed.mjs folds a repository entered twice inside ONE type. This folds the cases it leaves:
//   · the same repository root on two shelves: ruvnet/ruflo as `ruflo` (Tools) and `ruvnet-claude-flow`
//     (MCPs); langfuse/langfuse on Evals and Observability; stripe/ai on Sandbox and MCPs.
//   · a root written another way beside the root: `upstash/context7#readme`, `…/repo.git`,
//     `…/repo/tree/main` (lib/rank.mjs repoRootUrl).
//   · one folder or file listed under two branches, or as the folder and its README:
//     `servers/tree/HEAD/src/everything`, `servers/tree/main/src/everything` and
//     `servers/blob/main/src/everything/README.md`.
// A file or folder deeper inside a repository is a different component (a skill in a skills repo) and
// stays; lib/rank.mjs scores it on its own evidence, never on its parent's stars.
//
// Which row stays, in order: the one /stack names (web/src/data/stack.json); the one written as the plain
// root URL; the one with more evidence (tested, then mentions); the one named after the repository; a
// named branch over HEAD; the shelf order below; the shorter name. Evidence folds into whichever stays.
// The others are MOVED (git mv, never deleted) to brain/lookup/duplicates/<type>/, outside the catalog
// walk, with `folded_into: <type>/<name>`. Their mentions and test result fold into the kept row (the
// larger wins, so nothing is counted twice).
//
// It also folds one repository on ONE shelf under two names (the chairman's decision, CP147 T07): the MCP
// servers crawled from both PulseMCP and Glama, and an mcp.so page whose source_repo is a repository
// already listed. Rows that point at one file inside a repository stay: they are the entries that file
// lists (D-08). Which rows are the same component is lib/same-component.mjs; scripts/lint-catalog.mjs
// fails while any group is left.
//
//   node scripts/demote-same-repo.mjs                 # dry run: list the groups
//   node scripts/demote-same-repo.mjs --apply         # move, fold signals, then rebuild the catalog
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { repoRootUrl } from "../lib/rank.mjs";
import { duplicateGroups } from "../lib/same-component.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const apply = process.argv.includes("--apply");
const cat = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf-8")).components;
const stack = JSON.parse(readFileSync(join(ROOT, "web", "src", "data", "stack.json"), "utf-8"));
const lc = (s) => String(s || "").toLowerCase();
const flat = (s) => lc(s).replace(/[^a-z0-9]/g, "");

// The rows /stack shows as a pick or a runner-up: folding one would break a shelf's pick. Matched on the
// name AND the repository, since two rows can share a name (a skill called playwright-cli is not the CLI).
const PINNED = new Set(stack.components.flatMap((c) => (c.picks || [])
  .filter((p) => p.armoryName && repoRootUrl(p.url))
  .map((p) => `${p.armoryName}|${lc(repoRootUrl(p.url))}`)));
const pinned = (r) => PINNED.has(`${r.name}|${lc(repoRootUrl(r.source_url))}`);
// When evidence ties, the shelf where the repository most plausibly belongs. Eval platforms are
// observability platforms that also evaluate; output styles are workflows, not command-line tools.
const SHELF = ["observability", "workflows", "infrastructure", "mcps", "memory", "evals", "identity", "skills",
  "subagents", "hooks", "claudemd-rules", "plugins", "clis-tools"];
const shelf = (t) => (SHELF.includes(t) ? SHELF.indexOf(t) : SHELF.length);

// Branch names a note may use; a named default branch beats HEAD, which is whatever it points at today.
const branchRank = (c) => (/\/(?:tree|blob)\/(?:main|master)\//i.test(c.source_url || "") ? 0 : 1);
function keeper(rows, repo) {
  const repoName = flat(repo.split("/")[1]);
  const plainRoot = (r) => Number(repoRootUrl(r.source_url) === String(r.source_url || "").trim().replace(/\/+$/, ""));
  return [...rows].sort((a, b) =>
    Number(pinned(b)) - Number(pinned(a)) ||
    plainRoot(b) - plainRoot(a) ||
    (b.eval_score || 0) - (a.eval_score || 0) ||
    (b.mentions || 0) - (a.mentions || 0) ||
    Number(flat(b.name) === repoName) - Number(flat(a.name) === repoName) ||
    branchRank(a) - branchRank(b) ||
    shelf(a.type) - shelf(b.type) ||
    a.name.length - b.name.length || a.name.localeCompare(b.name),
  )[0];
}

function setField(text, field, value) {
  const end = text.indexOf("\n---", 4);
  const head = text.slice(0, end), rest = text.slice(end);
  const re = new RegExp(`^${field}:.*$`, "m");
  return (re.test(head) ? head.replace(re, `${field}: ${value}`) : `${head}\n${field}: ${value}`) + rest;
}

// A destination that does not overwrite an earlier fold of the same name.
function destination(type, name) {
  const dir = join(ROOT, "brain", "lookup", "duplicates", type);
  let to = join(dir, `${name}.md`);
  for (let i = 2; existsSync(to); i += 1) to = join(dir, `${name}--${i}.md`);
  return { dir, to };
}

let hit = 0, moved = 0;
const kinds = { crossShelf: 0, rootWrittenTwice: 0, branchTwice: 0, sameShelfSameUrl: 0, registryPage: 0 };
const movedBy = { ...kinds };
const lines = [];
for (const { kind, repo, rows } of duplicateGroups(cat)) {
  const keep = keeper(rows, repo);
  const others = rows.filter((r) => r !== keep);
  hit++;
  kinds[kind]++;
  movedBy[kind] += others.length;
  lines.push(`  ${kind.padEnd(16)} keep ${keep.type}/${keep.name}  ←  ${others.map((o) => `${o.type}/${o.name}`).join(", ")}`);
  if (!apply) { moved += others.length; continue; }
  const keepPath = join(ROOT, "brain", keep.path);
  if (existsSync(keepPath)) {
    let t = readFileSync(keepPath, "utf-8");
    const mentions = Math.max(keep.mentions || 0, ...others.map((o) => o.mentions || 0));
    if (mentions > (keep.mentions || 0)) t = setField(t, "mentions", mentions);
    const tested = Math.max(keep.eval_score || 0, ...others.map((o) => o.eval_score || 0));
    if (tested > (keep.eval_score || 0)) t = setField(t, "eval_score", tested);
    writeFileSync(keepPath, t);
  }
  for (const o of others) {
    const from = join(ROOT, "brain", o.path);
    if (!existsSync(from)) continue;
    const { dir, to } = destination(o.type, o.name);
    mkdirSync(dir, { recursive: true });
    execFileSync("git", ["-C", ROOT, "mv", from, to]);
    writeFileSync(to, setField(readFileSync(to, "utf-8"), "folded_into", `${keep.type}/${keep.name}`));
    moved++;
  }
}
lines.sort();
console.log(lines.slice(0, 80).join("\n"));
if (lines.length > 80) console.log(`  … and ${lines.length - 80} more`);
console.log(`\n${hit} repositories entered more than once · ${moved} rows ${apply ? "moved to brain/lookup/duplicates/" : "would move (dry run; --apply)"}`);
const said = (k) => `${kinds[k]} (${movedBy[k]} rows)`;
console.log(`  on two or more shelves ${said("crossShelf")} · a root written two ways ${said("rootWrittenTwice")} · one folder under two branches ${said("branchTwice")}`);
console.log(`  one shelf, one URL, two names ${said("sameShelfSameUrl")} · a registry page (mcp.so) for a repository already listed ${said("registryPage")}`);
if (apply) console.log("Next: node ingest/catalog.mjs && node ingest/validate.mjs && node ingest/test-gate.mjs");
