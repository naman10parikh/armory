// Armory integration + chaos tests (B2 + B5) — the crawl→promote→catalog round-trip
// and malformed-input resilience, over throwaway tmp fixtures so the REAL brain is
// never touched. Zero-dep (node:test). Runs in CI via `node --test ingest/` and as a
// pre-promote gate. Complements test-pyramid.test.mjs (L1 unit + contract) and
// test-gate.mjs (full-catalog behavioral gate). Nothing ships unless these pass.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { promote, normName } from "./promote.mjs";
import { parseFrontmatter } from "./catalog.mjs";
import { gradeComponent } from "./test-gate.mjs";

// A fully-valid stub (filename must equal `name`; carries every REQUIRED field).
function validStub(name = "acme-mcp") {
  return `---
name: ${name}
type: mcps
description: >
  ${name} exposes ACME's widget API to agents — list, create, and reconcile widgets
  with idempotency keys and cursor pagination.
source_url: https://github.com/acme/${name}
license: MIT
verified_at: 2026-06-01
tags: [test, mcp]
---
## What it is
A real-shaped component used only by the integration test.
`;
}

function freshSandbox() {
  const root = mkdtempSync(join(tmpdir(), "armory-it-"));
  const incoming = join(root, "incoming", "testsrc");
  const components = join(root, "components");
  mkdirSync(incoming, { recursive: true });
  mkdirSync(components, { recursive: true });
  return { root, incoming, components };
}
const silent = () => {};

// ── B2 integration: crawl→promote round-trip lands a catalog-ingestible file ──
test("integration: a valid crawled stub promotes into <type>/ and is catalog-ingestible", () => {
  const { root, incoming, components } = freshSandbox();
  try {
    writeFileSync(join(incoming, "acme-mcp.md"), validStub("acme-mcp"));
    const res = promote(incoming, components, { dryRun: false, log: silent });
    assert.equal(res.promoted.length, 1, "one component promoted");
    assert.equal(res.invalid.length, 0, "nothing invalid");
    const dest = join(components, "mcps", "acme-mcp.md");
    assert.ok(existsSync(dest), "landed under components/mcps/");
    // round-trip: the promoted file parses AND passes the same gate buildCatalog relies on.
    const written = readFileSync(dest, "utf8");
    assert.equal(parseFrontmatter(written).name, "acme-mcp", "frontmatter survives the move");
    const { l1, l2 } = gradeComponent(written);
    assert.deepEqual(l1, [], "promoted output has no functional gate failures");
    assert.deepEqual(l2, [], "promoted output has no behavioral gate failures");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ── B2 integration: dedup — the same (name,type) is not promoted twice ────────
test("integration: promote dedupes a component already present in the target", () => {
  const { root, incoming, components } = freshSandbox();
  try {
    // First pass: promote acme-mcp.
    writeFileSync(join(incoming, "acme-mcp.md"), validStub("acme-mcp"));
    promote(incoming, components, { dryRun: false, log: silent });
    // Second source carries the same component → must be skipped as a dup, not re-written.
    const incoming2 = join(root, "incoming", "othersrc");
    mkdirSync(incoming2, { recursive: true });
    writeFileSync(join(incoming2, "acme-mcp.md"), validStub("acme-mcp"));
    const res2 = promote(incoming2, components, { dryRun: false, log: silent });
    assert.equal(res2.promoted.length, 0, "duplicate not promoted");
    assert.equal(res2.skipped.length, 1, "duplicate counted as skipped");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ── B2 integration: validation gate — a malformed stub is rejected, not landed ─
test("integration: an invalid stub (missing required field) is rejected, nothing written", () => {
  const { root, incoming, components } = freshSandbox();
  try {
    const bad = validStub("broken-mcp").replace(/source_url:.*\n/, ""); // drop a REQUIRED field
    writeFileSync(join(incoming, "broken-mcp.md"), bad);
    const res = promote(incoming, components, { dryRun: false, log: silent });
    assert.equal(res.promoted.length, 0, "invalid stub not promoted");
    assert.equal(res.invalid.length, 1, "flagged invalid");
    assert.ok(!existsSync(join(components, "mcps", "broken-mcp.md")), "no file leaked into target");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ── B2 integration: default is dry-run — promote NEVER writes without {dryRun:false} ──
test("integration: promote is dry-run by default (no accidental writes)", () => {
  const { root, incoming, components } = freshSandbox();
  try {
    writeFileSync(join(incoming, "acme-mcp.md"), validStub("acme-mcp"));
    const res = promote(incoming, components, { log: silent }); // dryRun defaults true
    assert.equal(res.promoted.length, 1, "reports what it WOULD promote");
    assert.ok(!existsSync(join(components, "mcps", "acme-mcp.md")), "but writes nothing in dry-run");
    assert.ok(existsSync(join(incoming, "acme-mcp.md")), "and leaves the source stub in place");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ── B5 chaos/monkey: garbage stubs must be rejected without crashing ──────────
test("chaos: promote survives garbage/binary/huge stubs without throwing", () => {
  const { root, incoming, components } = freshSandbox();
  try {
    writeFileSync(join(incoming, "empty.md"), "");
    writeFileSync(join(incoming, "nofm.md"), "just text, no frontmatter at all");
    writeFileSync(join(incoming, "brokenfm.md"), "---\nname: x\n  : : :\n---\n");
    writeFileSync(join(incoming, "huge.md"), "---\nname: huge\ntype: mcps\n---\n" + "A".repeat(2_000_000));
    writeFileSync(join(incoming, "binary.md"), Buffer.from([0, 1, 2, 255, 254, 0, 0, 10]));
    let res;
    assert.doesNotThrow(() => { res = promote(incoming, components, { dryRun: false, log: silent }); });
    assert.equal(res.promoted.length, 0, "no garbage stub is ever promoted");
    assert.ok(res.invalid.length >= 1, "garbage is classified as invalid");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ── unit: normName is the dedup key (collapses -mcp/-server suffixes) ──────────
test("unit: normName collapses suffix/spelling variants to one dedup key", () => {
  assert.equal(normName("Stripe-MCP"), normName("stripe"));
  assert.equal(normName("github-mcp-server"), normName("github"));
  assert.notEqual(normName("microsoft-playwright-mcp"), normName("executeautomation-playwright-mcp-server"));
});
