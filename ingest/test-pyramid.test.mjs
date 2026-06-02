// Armory test pyramid — L1 unit + contract + chaos, zero-dep (node:test).
// Run: node --test ingest/  (also runs in CI via .github/workflows/ci.yml and is a
// pre-promote gate). Complements ingest/test-gate.mjs (full-catalog behavioral gate)
// and armory-mcp's vitest. Nothing ships unless these pass.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter, TYPES } from "./catalog.mjs";
import { gradeComponent } from "./test-gate.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// A valid component stub (mirrors a real promoted brain entry).
const GOOD = `---
name: kaggle-mcp-server
type: mcps
description: >
  Enables AI assistants to interact with Kaggle competitions — list, download, submit.
source_url: https://github.com/Dishant27/kaggle-MCP
license: unknown
tags: [glama, mcp]
---
## What it is
Enables AI assistants to interact with Kaggle competitions, including submissions.
`;

// ── L1 unit: parseFrontmatter ────────────────────────────────────────────────
test("parseFrontmatter extracts the contract fields", () => {
  const fm = parseFrontmatter(GOOD);
  assert.equal(fm.name, "kaggle-mcp-server");
  assert.equal(fm.type, "mcps");
  assert.ok(String(fm.description).length > 12, "description parsed");
});

// ── L1 unit: TYPES is the 12 canonical types ─────────────────────────────────
test("TYPES is the 12 canonical component types", () => {
  assert.ok(Array.isArray(TYPES));
  assert.equal(TYPES.length, 12, "exactly 12 types");
  for (const t of ["mcps", "skills", "subagents", "hooks", "claudemd-rules", "workflows"]) {
    assert.ok(TYPES.includes(t), `TYPES includes ${t}`);
  }
});

// ── L1 unit: gradeComponent (the Hamel gate logic) ───────────────────────────
test("gradeComponent passes a well-formed component (no L1/L2 failures)", () => {
  const { l1, l2 } = gradeComponent(GOOD);
  assert.deepEqual(l1, [], "no functional failures");
  assert.deepEqual(l2, [], "no behavioral failures");
});

test("gradeComponent (L1) rejects an invalid type", () => {
  const bad = GOOD.replace("type: mcps", "type: not-a-real-type");
  const { l1 } = gradeComponent(bad);
  assert.ok(l1.some((f) => /type/.test(f)), "flags bad type");
});

test("gradeComponent (L1) rejects a non-slug name", () => {
  const bad = GOOD.replace("name: kaggle-mcp-server", "name: Not A Slug!");
  const { l1 } = gradeComponent(bad);
  assert.ok(l1.some((f) => /slug/.test(f)), "flags bad slug");
});

test("gradeComponent (L2) flags a husk (thin description)", () => {
  const husk = GOOD.replace(/description: >[\s\S]*?\n(?=\w)/, "description: x\n");
  const { l2 } = gradeComponent(husk);
  assert.ok(l2.length > 0, "flags behavioral drift / husk");
});

// ── Chaos: garbage input must not throw ──────────────────────────────────────
test("gradeComponent does not throw on garbage / empty input", () => {
  for (const junk of ["", "no frontmatter here", "---\nbroken", "{}"]) {
    assert.doesNotThrow(() => gradeComponent(junk));
    const r = gradeComponent(junk);
    assert.ok(Array.isArray(r.l1) && Array.isArray(r.l2), "returns the {l1,l2} shape");
  }
});

// ── Contract: catalog.json is the shape armory-mcp + web depend on ───────────
test("catalog.json honors the generator↔consumer contract", () => {
  const p = join(ROOT, "catalog.json");
  if (!existsSync(p)) return; // catalog is generated; skip if absent in a bare checkout
  const c = JSON.parse(readFileSync(p, "utf8"));
  assert.equal(typeof c.counts?.total, "number", "counts.total is a number");
  assert.ok(Array.isArray(c.components), "components[] array exists (NOT the legacy 'engrams' key)");
  assert.ok(!("engrams" in c), "the legacy 'engrams' key is gone");
  assert.equal(c.counts.total, c.components.length, "counts.total matches components length");
  for (const item of c.components.slice(0, 200)) {
    assert.ok(item.name && item.type && item.path, "each component has name+type+path");
    assert.ok(TYPES.includes(item.type), `type ${item.type} is one of the 12`);
  }
});
