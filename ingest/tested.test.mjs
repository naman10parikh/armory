// Feed `tested` list → eval_score (CP143 T53): matching, precedence and the frontmatter write. Zero-dep
// (node:test), no files touched. The script that applies it is scripts/ingest-sentinel-feed.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { planTested, fieldUpdates, setField } from "./tested.mjs";

const row = (name, source_url, extra = {}) => ({ name, type: "clis-tools", source_url, eval_score: null, ...extra });
const trial = (repo, eval_score, date, tool = "Tool") => ({ tool, repo, outcome: "ran", eval_score, one_line: "", date });

test("tested: a trial reaches the repository root row, never a file inside the repository", () => {
  const rows = [row("root", "https://github.com/Acme/Tool#readme"), row("file", "https://github.com/acme/tool/blob/main/SKILL.md")];
  const { scored, unmatched } = planTested(rows, [trial("https://github.com/acme/tool", 1, "2026-09-26")]);
  assert.deepEqual([...scored.keys()].map((r) => r.name), ["root"]);
  assert.deepEqual(unmatched, []);
});

test("tested: the latest trial wins, a same-day failure beats a pass, and a null never clears a score", () => {
  const r = row("t", "https://github.com/o/t");
  const later = planTested([r], [trial("https://github.com/o/t", 1, "2026-09-27"), trial("https://github.com/o/t", 0, "2026-09-25"),
    trial("https://github.com/o/t", null, "2026-09-28")]);
  assert.deepEqual(later.scored.get(r), { eval_score: 1, date: "2026-09-27" });
  const sameDay = planTested([r], [trial("https://github.com/o/t", 0, "2026-09-26"), trial("https://github.com/o/t", 1, "2026-09-26")]);
  assert.equal(sameDay.scored.get(r).eval_score, 0);
});

test("tested: unmatched trials are reported with a reason, no row is created, a contributor's note is never echoed", () => {
  const rows = [row("a", "https://github.com/o/a")];
  const { scored, unscored, unmatched } = planTested(rows, [
    { ...trial(null, 1, "2026-09-25", "Hosted"), note: "brain/raw/hands-on/hosted.md" },
    trial("https://github.com/o/other", 0, "2026-09-26", "Other"),
    trial("https://github.com/o/a", null, "2026-09-26", "A"),
  ]);
  assert.equal(rows.length, 1);
  assert.equal(scored.size, 0);
  assert.deepEqual(unmatched, [
    { tool: "Hosted", repo: null, reason: "no GitHub repository" },
    { tool: "Other", repo: "https://github.com/o/other", reason: "no row for this repository" },
  ]);
  assert.deepEqual(unscored, [{ tool: "A", rows: ["clis-tools/a"] }]);
  assert.ok(!JSON.stringify({ unmatched, unscored }).includes("hands-on"));
});

test("tested: verified_at moves forward only, and a repeat of the recorded score changes nothing", () => {
  assert.deepEqual(fieldUpdates({ eval_score: null, verified_at: "2026-05-27" }, { eval_score: 1, date: "2026-09-26" }),
    { eval_score: 1, verified_at: "2026-09-26" });
  assert.deepEqual(fieldUpdates({ eval_score: 1, verified_at: "2026-09-30" }, { eval_score: 0, date: "2026-09-26" }), { eval_score: 0 });
  assert.deepEqual(fieldUpdates({ eval_score: 1, verified_at: "2026-09-26" }, { eval_score: 1, date: "2026-09-26" }), {});
});

test("tested: setField edits only the frontmatter", () => {
  const md = "---\nname: t\neval_score: null\nverified_at: 2026-05-27\n---\n## Notes\neval_score: in the body\n";
  assert.equal(setField(setField(md, "eval_score", 1), "verified_at", "2026-09-26"),
    "---\nname: t\neval_score: 1\nverified_at: 2026-09-26\n---\n## Notes\neval_score: in the body\n");
  assert.equal(setField("---\nname: t\n---\nbody\n", "eval_score", 0), "---\nname: t\neval_score: 0\n---\nbody\n");
});
