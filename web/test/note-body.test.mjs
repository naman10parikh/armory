// A note's body as its detail page shows it (web/src/lib/note-body.ts): the crawlers' provenance lines in plain
// words, their workflow state dropped, and a section that only points at the source left out. Node strips the
// TypeScript: run with Node 22.6 or newer and --experimental-strip-types (CI's last step), or plain node from 23.6.
import { test } from "node:test";
import assert from "node:assert/strict";
import { plainNoteBody } from "../src/lib/note-body.ts";

const D = "\u2014";
const AR = "\u2192";
const notes = (line) => plainNoteBody(`## Notes\n${line}\n`).replace(/^## Notes\n/, "").trim();

test("note-body: a PulseMCP note reads as listed from the registry, with a plain license sentence", () => {
  const body = [
    "## What it is",
    "MCP server `Playwright Browser Automation`, catalogued on PulseMCP. Enables web browser control.",
    "",
    "## How to install / invoke",
    "See the source for the `mcpServers` config block (command + args). Source: https://github.com/microsoft/playwright-mcp",
    "",
    "## Notes",
    `Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/microsoft-playwright). License not declared in registry metadata ${D} confirm before production use. Pending verify -> promote.`,
    "",
  ].join("\n");
  assert.equal(
    plainNoteBody(body),
    [
      "## What it is",
      "MCP server `Playwright Browser Automation`, catalogued on PulseMCP. Enables web browser control.",
      "",
      "## Notes",
      "Listed from the PulseMCP registry. The registry does not state a license. Check it before production use.",
      "",
    ].join("\n"),
  );
});

test("note-body: each registry and list note in plain words, with no workflow state", () => {
  const cases = [
    ["Discovered via the Glama MCP registry (live API). Pending verify -> promote.", "Listed from the Glama MCP registry."],
    ["Discovered via mcp.so sitemap (live sitemaps). Pending verify -> promote.", "Listed from the mcp.so sitemap."],
    ["Discovered via the Smithery MCP registry (GitHub fallback). Pending verify -> promote.", "Listed from the Smithery MCP registry."],
    ["Discovered via the Engram infra-tools curated list. Pending verify -> promote.", "Listed from Armory's infra-tools list."],
    ["Discovered via the observability-tools curated list. Pending verify -> promote.", "Listed from Armory's observability-tools list."],
    ["Curated by the Engram browser-tools adapter. Pending verify -> promote.", "Listed from Armory's browser-tools list."],
    [
      `Discovered via [\`a/b\`](https://github.com/a/b) ${D} section: General Purpose Implementations. Pending verify -> promote.`,
      "Listed from [`a/b`](https://github.com/a/b), under General Purpose Implementations.",
    ],
    [`Discovered via [\`a/b\`](https://github.com/a/b) ${D} category: Documentation. Pending verify -> promote.`, "Listed from [`a/b`](https://github.com/a/b), under Documentation."],
    ["Discovered via [`a/b`](https://github.com/a/b). Pending verify -> promote.", "Listed from [`a/b`](https://github.com/a/b)."],
    [
      `Extracted from [\`a/b\`](https://github.com/a/b/blob/main/x.json) ${D} devtools category. Type: mcps. Pending verify -> promote.`,
      "Extracted from [`a/b`](https://github.com/a/b/blob/main/x.json), devtools category.",
    ],
    [
      `Quickstart "Agents" from anthropics/anthropic-quickstarts ${D} a runnable starter project. License: MIT. Pending verify ${AR} promote.`,
      'Quickstart "Agents" from anthropics/anthropic-quickstarts, a runnable starter project. License: MIT.',
    ],
    [
      "Seeded 2026-09-07 by CP138 T18 to give the identity shelf enough depth to rank. Verified live on GitHub at seed time; not already in the catalogue.",
      "Added on 2026-09-07 so the identity list has enough rows to rank. Checked live on GitHub when added.",
    ],
    [
      `Contributed by Sentinel through the contributor feed (practitioner mentions), 2026-09-26. Pending verify ${AR} promote.`,
      "Contributed by Sentinel through the contributor feed (practitioner mentions), 2026-09-26.",
    ],
    [`Ingested from the affaan-m/ecc harness library (MIT). Pending verify ${AR} promote.`, "Ingested from the affaan-m/ecc harness library (MIT)."],
  ];
  for (const [line, want] of cases) assert.equal(notes(line), want, line);
});

test("note-body: a section whose only body is a See-the-source line is left out, whatever its heading", () => {
  const pointers = [
    "See the source for the `mcpServers` config block (command + args). Source: https://github.com/a/b",
    "See the source README: https://github.com/a/b",
    "See the source repo README.",
    "See the source: https://github.com/a/b",
    "See the source repo README: https://github.com/a/b",
    "See the source repo README for the `mcpServers` config block (command + args).",
    "See the source repo or docs at https://a.dev",
    "See the source repo or link above.",
  ];
  for (const p of pointers) {
    const body = `## What it is\nA tool.\n\n## When to use it\n${p}\n\n## How to install / invoke\n${p}\n\n## Notes\nListed from the Glama MCP registry.\n`;
    assert.equal(plainNoteBody(body), "## What it is\nA tool.\n\n## Notes\nListed from the Glama MCP registry.\n", p);
  }
  const kept = "## How to install / invoke\nRun `npx a`.\nSee the source README: https://github.com/a/b\n";
  assert.equal(plainNoteBody(kept), kept, "a section with more than the pointer stays");
});

test("note-body: text written by hand is left as it is", () => {
  const body = "## Notes\nKeep grids visible to the operator rather than headless.\n";
  assert.equal(plainNoteBody(body), body);
});
