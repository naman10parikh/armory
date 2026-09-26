#!/usr/bin/env node
// demote-renamed.mjs — one project, two names (CP138 T56, CP143).
//
// GitHub keeps a renamed repository's old URL working, and crawls that met the old name and the new
// one each added a row: ruvnet/claude-code-flow and ruvnet/ruflo, googleapis/genai-toolbox and
// googleapis/mcp-toolbox. Both rows carry the same stars, forks and last push, so the project ranks
// twice and its signal is split. GitHub says which name is current (an old name redirects), so this
// asks it instead of guessing. Within each type, the row on the current name stays; when no row is on
// it, the row with the most mentions stays and takes the current name. The others are MOVED (git mv,
// never deleted) to brain/lookup/duplicates/<type>/, outside the catalog walk, and their mentions fold
// into the kept row: the larger count wins, so no note is counted twice.
//
//   node scripts/demote-renamed.mjs            # dry run: list the groups
//   node scripts/demote-renamed.mjs --apply    # move, fold mentions, rename, then rebuild the catalog
//
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const apply = process.argv.includes("--apply");
const cat = JSON.parse(readFileSync(join(ROOT, "catalog.json"), "utf-8")).components;
const lc = (s) => String(s || "").toLowerCase();

const groups = new Map();
for (const c of cat) {
  if (!c.source_repo || !c.pushed_at || (c.stars || 0) < 50) continue;
  const k = `${c.stars}|${c.forks}|${c.pushed_at}`;
  (groups.get(k) || groups.set(k, []).get(k)).push(c);
}

const canonCache = new Map();
function canonical(repo) {
  if (!canonCache.has(lc(repo))) {
    let name = null;
    try {
      name = execFileSync("gh", ["api", `repos/${repo}`, "--jq", ".full_name"], { encoding: "utf-8" }).trim() || null;
    } catch { /* gone or private: leave the group alone */ }
    canonCache.set(lc(repo), name);
  }
  return canonCache.get(lc(repo));
}

function setField(text, field, value) {
  const end = text.indexOf("\n---", 4);
  const head = text.slice(0, end), rest = text.slice(end);
  const re = new RegExp(`^${field}:.*$`, "m");
  return (re.test(head) ? head.replace(re, `${field}: ${value}`) : `${head}\n${field}: ${value}`) + rest;
}

let groupsHit = 0, moved = 0, renamed = 0, skipped = 0;
for (const rows of groups.values()) {
  if (new Set(rows.map((r) => lc(r.source_repo))).size < 2) continue;
  const names = [...new Set(rows.map((r) => r.source_repo))];
  const canon = names.map(canonical);
  if (canon.some((c) => !c) || new Set(canon.map(lc)).size !== 1) { skipped++; continue; } // coincidence, not a rename
  const current = canon[0];
  groupsHit++;
  const byType = new Map();
  for (const r of rows) (byType.get(r.type) || byType.set(r.type, []).get(r.type)).push(r);
  for (const [type, list] of byType) {
    const keep = list.find((r) => lc(r.source_repo) === lc(current))
      || [...list].sort((a, b) => (b.mentions || 0) - (a.mentions || 0) || (b.eval_score || 0) - (a.eval_score || 0))[0];
    const others = list.filter((r) => r !== keep && lc(r.source_repo) !== lc(keep.source_repo));
    const keepPath = join(ROOT, "brain", keep.path);
    if (lc(keep.source_repo) !== lc(current)) renamed++;
    if (apply && existsSync(keepPath)) {
      let t = readFileSync(keepPath, "utf-8");
      const folded = Math.max(keep.mentions || 0, ...others.map((o) => o.mentions || 0));
      if (folded !== (keep.mentions || 0)) t = setField(t, "mentions", folded);
      if (lc(keep.source_repo) !== lc(current)) {
        t = setField(setField(t, "source_repo", current), "source_url", `https://github.com/${current}`);
      }
      writeFileSync(keepPath, t);
    }
    for (const o of others) {
      const from = join(ROOT, "brain", o.path);
      if (!existsSync(from)) continue;
      if (apply) {
        const toDir = join(ROOT, "brain", "lookup", "duplicates", type);
        mkdirSync(toDir, { recursive: true });
        const to = join(toDir, basename(o.path));
        execFileSync("git", ["-C", ROOT, "mv", "-k", from, to]);
        if (existsSync(to)) writeFileSync(to, setField(readFileSync(to, "utf-8"), "renamed_to", current));
      }
      moved++;
    }
    if (groupsHit <= 40) console.log(`  ${type}: keep ${keep.source_repo}${lc(keep.source_repo) !== lc(current) ? ` → ${current}` : ""}  ←  ${others.map((o) => o.source_repo).join(", ") || "(nothing to move)"}`);
  }
}
console.log(`\n${groupsHit} renamed projects · ${moved} rows ${apply ? "moved to brain/lookup/duplicates/" : "would move (dry run; --apply)"} · ${renamed} kept rows ${apply ? "took" : "would take"} the current name · ${skipped} groups left alone (not one repo)`);
if (apply) console.log("Next: node ingest/catalog.mjs && node ingest/validate.mjs && node ingest/test-gate.mjs");
