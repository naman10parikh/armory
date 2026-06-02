// Agentic "as a user" E2E (B6 + dogfood/D) — shells out to the REAL built CLI exactly
// as an agent or human would, and asserts behavior + exit codes. This is the chairman's
// "test it as a user, which is the final test." Locks in the bugs found by live
// dogfooding on 2026-06-01 (engram-free help, "a component" grammar, graceful no-match,
// loud failure on bad commands). Zero-dep (node:test). Requires cli/dist (CI builds it).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "..", "dist", "index.js");
const run = (args) => spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8" });

test("the CLI is built (cli/dist/index.js present)", () => {
  assert.ok(existsSync(CLI), "run `tsc` in cli/ before this gate");
});

test("agentic-user: --help is branded Armory, engram-free, and grammatical", () => {
  const r = run(["--help"]);
  assert.equal(r.status, 0, "help exits 0");
  assert.match(r.stdout, /armory/i, "branded Armory");
  assert.doesNotMatch(r.stdout, /engram/i, "no legacy 'engram' noun (F1/F4 regression guard)");
  assert.doesNotMatch(r.stdout, /\ban component\b/, "no 'an component' grammar bug (regression guard)");
});

test("agentic-user: search returns ranked results for a real query", () => {
  const r = run(["search", "playwright"]);
  assert.equal(r.status, 0, "search exits 0");
  assert.match(r.stdout, /playwright/i, "surfaces the matching component");
});

test("agentic-user: search degrades gracefully on a no-match query", () => {
  const r = run(["search", "zzqxnonexistentzz"]);
  assert.equal(r.status, 0, "a zero-result search is success, not error");
  assert.match(r.stdout, /no components matched/i, "tells the user nothing matched");
});

test("break-it: an unknown command fails loudly (non-zero exit)", () => {
  const r = run(["boguscmd"]);
  assert.notEqual(r.status, 0, "unknown command must NOT exit 0 (agents need to detect failure)");
  assert.match((r.stderr || "") + (r.stdout || ""), /unknown command/i);
});

test("break-it: no args prints usage and exits non-zero", () => {
  const r = run([]);
  assert.notEqual(r.status, 0, "bare invocation is not a success");
  assert.match((r.stdout || "") + (r.stderr || ""), /Usage:/);
});
