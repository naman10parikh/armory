import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { rankComponents, type Catalog } from "../src/catalog.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(
  readFileSync(join(HERE, "fixture-catalog.json"), "utf8")
) as Catalog;

describe("rankComponents", () => {
  it("ranks browser-related components first for 'browser'", () => {
    const ranked = rankComponents(catalog.components, "browser");
    const names = ranked.map((r) => r.component.name);
    expect(names).toContain("playwright-mcp");
    expect(names).toContain("stagehand");
    // memory-compression has no browser signal → excluded.
    expect(names).not.toContain("memory-compression");
  });

  it("weights a name match above a description-only match", () => {
    const ranked = rankComponents(catalog.components, "stagehand");
    expect(ranked[0]?.component.name).toBe("stagehand");
  });

  it("matches on tags as well as name and description", () => {
    const ranked = rankComponents(catalog.components, "compression");
    expect(ranked[0]?.component.name).toBe("memory-compression");
  });

  it("returns empty for a query with no matches", () => {
    expect(rankComponents(catalog.components, "quantum-blockchain")).toHaveLength(0);
  });

  it("returns empty for an empty query", () => {
    expect(rankComponents(catalog.components, "   ")).toHaveLength(0);
  });

  it("produces a deterministic, descending-score order", () => {
    const ranked = rankComponents(catalog.components, "web automation");
    for (let i = 1; i < ranked.length; i += 1) {
      expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
    }
  });
});
