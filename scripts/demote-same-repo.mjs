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
// `--same-type` also folds root rows on ONE shelf that share a URL but not a name: 2,872 MCP servers
// crawled from both PulseMCP and Glama on 26 September 2026. Off by default: it moves about 3,000
// notes, so it waits for a decision. The ranked lists already fold those pairs on screen.
//
//   node scripts/demote-same-repo.mjs                 # dry run: list the groups
//   node scripts/demote-same-repo.mjs --apply         # move, fold signals, then rebuild the catalog
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { repoRootUrl } from "../lib/rank.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const apply = process.argv.includes("--apply");
const sameType = process.argv.includes("--same-type");
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

// A folder or file inside a repository, keyed without its branch: owner/repo/<path>.
const SUB = /^https?:\/\/(?:www\.)?github\.com\/([^/\s#?]+)\/([^/\s#?]+)\/(?:tree|blob)\/[^/\s#?]+\/([^#?\s]+?)\/?(?:[#?].*)?$/i;
function keyOf(c) {
  const root = repoRootUrl(c.source_url);
  if (root) return { key: `root:${lc(root)}`, repo: lc(root).replace("https://github.com/", ""), root: true };
  const m = SUB.exec(String(c.source_url || "").trim());
  // A folder's README is the folder: `…/blob/main/src/everything/README.md` names `…/tree/main/src/everything`.
  const path = m ? m[3].replace(/\/readme(?:\.md)?$/i, "") : "";
  return m ? { key: `sub:${lc(`${m[1]}/${m[2]}/${path}`)}`, repo: lc(`${m[1]}/${m[2]}`), root: false } : null;
}

const groups = new Map();
for (const c of cat) {
  const k = keyOf(c);
  if (!k) continue;
  c._k = k;
  (groups.get(k.key) || groups.set(k.key, []).get(k.key)).push(c);
}

// Branch names a note may use; a named default branch beats HEAD, which is whatever it points at today.
const branchRank = (c) => (/\/(?:tree|blob)\/(?:main|master)\//i.test(c.source_url || "") ? 0 : 1);
function keeper(rows) {
  const repoName = (r) => flat(r._k.repo.split("/")[1]);
  const plainRoot = (r) => Number(repoRootUrl(r.source_url) === String(r.source_url || "").trim().replace(/\/+$/, ""));
  return [...rows].sort((a, b) =>
    Number(pinned(b)) - Number(pinned(a)) ||
    plainRoot(b) - plainRoot(a) ||
    (b.eval_score || 0) - (a.eval_score || 0) ||
    (b.mentions || 0) - (a.mentions || 0) ||
    Number(flat(b.name) === repoName(b)) - Number(flat(a.name) === repoName(a)) ||
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
const kinds = { crossShelf: 0, rootWrittenTwice: 0, branchTwice: 0, sameShelfSameUrl: 0 };
const lines = [];
for (const rows of groups.values()) {
  if (rows.length < 2) continue;
  const types = new Set(rows.map((r) => r.type));
  const urls = new Set(rows.map((r) => lc(r.source_url).replace(/\/+$/, "")));
  const isRoot = rows[0]._k.root;
  // Same shelf and the very same URL: two crawls of one server under two names. Only with --same-type.
  if (types.size === 1 && urls.size === 1 && !sameType) continue;
  const kind = types.size > 1 ? "crossShelf" : urls.size === 1 ? "sameShelfSameUrl" : isRoot ? "rootWrittenTwice" : "branchTwice";
  const keep = keeper(rows);
  const others = rows.filter((r) => r !== keep);
  hit++;
  kinds[kind]++;
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
console.log(`  on two or more shelves ${kinds.crossShelf} · a root written two ways ${kinds.rootWrittenTwice} · one folder under two branches ${kinds.branchTwice}${sameType ? ` · one shelf, one URL, two names ${kinds.sameShelfSameUrl}` : ""}`);
if (apply) console.log("Next: node ingest/catalog.mjs && node ingest/validate.mjs && node ingest/test-gate.mjs");
