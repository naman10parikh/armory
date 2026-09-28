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
import { promoteAll } from "./promote.mjs";
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

// ── the mega-crawl's replace keeps a note's title (CP143) ─────────────────────
// promoteAll (promote.mjs --all) replaces an imported note when a richer stub of the same component arrives. The
// Playwright MCP row is a PulseMCP import whose title was set by hand, and no crawl source writes a title, so the
// replace carries the title line over; every other line is the stub's.
test("integration: promoteAll replacing the Playwright MCP row keeps title: microsoft-playwright-mcp", () => {
  const root = mkdtempSync(join(tmpdir(), "armory-it-"));
  try {
    const components = join(root, "components");
    const incoming = join(root, "incoming");
    mkdirSync(join(components, "mcps"), { recursive: true });
    mkdirSync(join(incoming, "pulsemcp-full"), { recursive: true });
    const note = readFileSync(new URL("../brain/components/mcps/microsoft-playwright.md", import.meta.url), "utf8");
    assert.match(note, /^title: microsoft-playwright-mcp$/m, "the brain's note carries the title");
    const notePath = join(components, "mcps", "microsoft-playwright.md");
    writeFileSync(notePath, note);
    const stub = `---
name: microsoft-playwright
type: mcps
description: >
  Playwright MCP server from Microsoft: an agent drives a real browser through structured accessibility snapshots rather than screenshots, with navigation, clicks, typing, tabs and file uploads.
source_repo: microsoft/playwright-mcp
source_url: https://github.com/microsoft/playwright-mcp
license: Apache-2.0
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 36722
verified_at: 2026-09-27
related: []
tags: [mcp, pulsemcp]
---
## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/microsoft-playwright).
`;
    const stubPath = join(incoming, "pulsemcp-full", "microsoft-playwright.md");
    writeFileSync(stubPath, stub);
    // The CLI's source order up to pulsemcp-full: the stub ties the note on source and wins on its longer description.
    const sources = ["anthropic-official", "anthropic-skills", "pulsemcp-full"];

    const lines = [];
    promoteAll(incoming, components, sources, { dryRun: true, quiet: false, log: (l) => lines.push(l) });
    assert.ok(lines.some((l) => l.includes("would REPLACE") && l.endsWith(notePath)), lines.join("\n"));
    assert.ok(lines.includes("    keeps title: microsoft-playwright-mcp"), lines.join("\n"));
    assert.equal(readFileSync(notePath, "utf8"), note, "a dry run writes nothing");

    promoteAll(incoming, components, sources, { dryRun: false, log: silent });
    const written = readFileSync(notePath, "utf8");
    assert.equal(parseFrontmatter(written).title, "microsoft-playwright-mcp");
    const expected = stub.replace("name: microsoft-playwright\n", "name: microsoft-playwright\ntitle: microsoft-playwright-mcp\n");
    assert.equal(written, expected, "every other line is the stub's");
    assert.ok(!existsSync(stubPath), "the stub is consumed");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ── one repository, one row: no second row under another name (CP147 T07) ────
// 2,973 MCP rows came in twice because registries name one server differently (PulseMCP `aaronroef-apple`,
// Glama `apple-mcp`) while the promote step compared names only, and 525 mcp.so pages came in beside a
// GitHub row of the same repository. Both promote paths now key on the repository (lib/same-component.mjs).
function stubFor(name, sourceUrl, sourceRepo = "") {
  return validStub(name)
    .replace(/^source_url:.*$/m, `source_url: ${sourceUrl}${sourceRepo ? `\nsource_repo: ${sourceRepo}` : ""}`);
}

test("integration: promote (the nightly path) adds no second row for a repository already listed", () => {
  const { root, incoming, components } = freshSandbox();
  try {
    mkdirSync(join(components, "mcps"), { recursive: true });
    writeFileSync(join(components, "mcps", "aaronroef-apple.md"), stubFor("aaronroef-apple", "https://github.com/aaronroef/apple-mcp"));
    // Glama's spelling of the same repository: another name, another case, a trailing .git.
    writeFileSync(join(incoming, "apple-mcp.md"), stubFor("apple-mcp", "https://github.com/AaronRoef/apple-mcp.git"));
    // mcp.so's page for it: the repository is only in source_repo.
    writeFileSync(join(incoming, "apple-notes-mcp.md"), stubFor("apple-notes-mcp", "https://mcp.so/server/apple-mcp/aaronroef", "aaronroef/apple-mcp"));
    // A different repository with a similar name is a different product and enters.
    writeFileSync(join(incoming, "apple-music-mcp.md"), stubFor("apple-music-mcp", "https://github.com/someone-else/apple-mcp"));
    const res = promote(incoming, components, { dryRun: false, log: silent });
    assert.deepEqual(res.promoted.map((p) => p.key), ["apple-music-mcp|mcps"], "only the other repository enters");
    assert.equal(res.skipped.length, 2, "both spellings of the listed repository are skipped");
    assert.ok(!existsSync(join(components, "mcps", "apple-mcp.md")));
    assert.ok(!existsSync(join(components, "mcps", "apple-notes-mcp.md")));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("integration: promote lists a different product with the same name under its owner's name (CP147 D-03)", () => {
  const { root, incoming, components } = freshSandbox();
  try {
    mkdirSync(join(components, "mcps"), { recursive: true });
    writeFileSync(join(components, "mcps", "apple-mcp.md"), stubFor("apple-mcp", "https://github.com/aaronroef/apple-mcp"));
    mkdirSync(join(incoming, "a"), { recursive: true });
    // The same name from another repository is another product: it enters as someone-else-apple-mcp.
    writeFileSync(join(incoming, "apple-mcp.md"), stubFor("apple-mcp", "https://github.com/Someone-Else/apple-mcp"));
    // The listed repository under the same name again adds nothing.
    writeFileSync(join(incoming, "a", "apple-mcp.md"), stubFor("apple-mcp", "https://github.com/aaronroef/apple-mcp"));
    const res = promote(incoming, components, { dryRun: false, log: silent });
    assert.deepEqual(res.promoted.map((p) => p.key), ["someone-else-apple-mcp|mcps"]);
    assert.equal(res.skipped.length, 1);
    const written = readFileSync(join(components, "mcps", "someone-else-apple-mcp.md"), "utf8");
    assert.equal(parseFrontmatter(written).name, "someone-else-apple-mcp", "the file and its name agree");
    assert.ok(readFileSync(join(components, "mcps", "apple-mcp.md"), "utf8").includes("aaronroef/apple-mcp"), "the first product is untouched");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("integration: promoteAll (the bulk path) adds no second row for a repository already listed", () => {
  const root = mkdtempSync(join(tmpdir(), "armory-it-"));
  try {
    const components = join(root, "components");
    const incoming = join(root, "incoming");
    mkdirSync(join(components, "mcps"), { recursive: true });
    mkdirSync(join(incoming, "pulsemcp-full"), { recursive: true });
    const held = join(components, "mcps", "aaronroef-apple.md");
    writeFileSync(held, stubFor("aaronroef-apple", "https://github.com/aaronroef/apple-mcp"));
    // Another name for the same repository (the names normalize apart), and a richer description.
    const stub = stubFor("apple-mcp", "https://github.com/aaronroef/apple-mcp").replace("A real-shaped", "A longer, richer, real-shaped");
    writeFileSync(join(incoming, "pulsemcp-full", "apple-mcp.md"), stub);
    writeFileSync(join(incoming, "pulsemcp-full", "apple-music-mcp.md"), stubFor("apple-music-mcp", "https://github.com/someone-else/apple-mcp"));
    const before = readFileSync(held, "utf8");
    const { stats } = promoteAll(incoming, components, ["pulsemcp-full"], { dryRun: false, log: silent });
    assert.equal(stats.sameRepository, 1, "the second name for the repository is counted as a duplicate");
    assert.equal(stats.netNew, 1, "the other repository still enters");
    assert.ok(!existsSync(join(components, "mcps", "apple-mcp.md")), "no second row");
    assert.ok(existsSync(join(components, "mcps", "apple-music-mcp.md")));
    assert.equal(readFileSync(held, "utf8"), before, "the row that holds the repository is untouched");
  } finally { rmSync(root, { recursive: true, force: true }); }
});
