// tested.mjs — a contributor's hands-on trial verdicts → a row's `eval_score` (CP143 T53).
//
// A feed's `tested` list holds one entry per trial: { tool, repo, outcome, eval_score, one_line, date }.
// `eval_score` is 1 (installed, and the documented first run did what the docs say), 0 (the install or that
// first run failed) or null (not run far enough to say). The rules:
//   • An entry reaches rows through its GitHub repository root, the key the dedupe uses (lib/rank.mjs
//     repoRootUrl), so a file or folder inside a repository never takes its parent's result.
//   • It never creates a row. An entry with no row is reported with the reason.
//   • The latest trial wins. On the same date the lower score wins: a failure is not outvoted by a pass.
//   • A null never clears a recorded score.
//   • `verified_at`, the date a row was last confirmed, takes the trial's date and only moves forward (the
//     first measured scores, in May 2026, set it the same way).
// Nothing here reads, writes or prints the contributor's own notes.
import { repoRootUrl } from "../lib/rank.mjs";

const repoKey = (url) => repoRootUrl(url)?.toLowerCase() ?? null;

export function planTested(components, tested) {
  const rowsByRepo = new Map();
  for (const c of components || []) {
    const k = repoKey(c.source_url);
    if (k) rowsByRepo.set(k, [...(rowsByRepo.get(k) || []), c]);
  }
  const scored = new Map(); // row → { eval_score, date } of the trial that wins
  const unscored = [], unmatched = [];
  const ordered = [...(tested || [])].sort((a, b) =>
    String(a.date || "").localeCompare(String(b.date || "")) || (b.eval_score ?? -1) - (a.eval_score ?? -1));
  for (const t of ordered) {
    const k = repoKey(t.repo);
    const rows = k ? rowsByRepo.get(k) : null;
    if (!rows) { unmatched.push({ tool: t.tool, repo: t.repo || null, reason: k ? "no row for this repository" : "no GitHub repository" }); continue; }
    if (t.eval_score !== 0 && t.eval_score !== 1) { unscored.push({ tool: t.tool, rows: rows.map((r) => `${r.type}/${r.name}`) }); continue; }
    for (const r of rows) scored.set(r, { eval_score: t.eval_score, date: t.date });
  }
  return { scored, unscored, unmatched };
}

// What a winning trial changes on its row: the score, and `verified_at` when the trial is newer. {} = nothing.
export function fieldUpdates(row, t) {
  const out = {};
  if (row.eval_score !== t.eval_score) out.eval_score = t.eval_score;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(t.date || "")) && String(row.verified_at || "") < t.date) out.verified_at = t.date;
  return out;
}

// Set one frontmatter line, or add it before the closing `---`. The body is never touched.
export function setField(text, field, value) {
  const end = text.indexOf("\n---", 4);
  if (!text.startsWith("---") || end === -1) return text;
  const head = text.slice(0, end), rest = text.slice(end);
  const re = new RegExp(`^${field}:.*$`, "m");
  return (re.test(head) ? head.replace(re, `${field}: ${value}`) : `${head}\n${field}: ${value}`) + rest;
}
