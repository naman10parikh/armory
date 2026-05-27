import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { rankEngrams, type Catalog } from "../src/catalog.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(
  readFileSync(join(HERE, "fixture-catalog.json"), "utf8")
) as Catalog;

describe("rankEngrams", () => {
  it("ranks browser-related engrams first for 'browser'", () => {
    const ranked = rankEngrams(catalog.engrams, "browser");
    const names = ranked.map((r) => r.engram.name);
    expect(names).toContain("playwright-mcp");
    expect(names).toContain("stagehand");
    // memory-compression has no browser signal → excluded.
    expect(names).not.toContain("memory-compression");
  });

  it("weights a name match above a description-only match", () => {
    const ranked = rankEngrams(catalog.engrams, "stagehand");
    expect(ranked[0]?.engram.name).toBe("stagehand");
  });

  it("matches on tags as well as name and description", () => {
    const ranked = rankEngrams(catalog.engrams, "compression");
    expect(ranked[0]?.engram.name).toBe("memory-compression");
  });

  it("returns empty for a query with no matches", () => {
    expect(rankEngrams(catalog.engrams, "quantum-blockchain")).toHaveLength(0);
  });

  it("returns empty for an empty query", () => {
    expect(rankEngrams(catalog.engrams, "   ")).toHaveLength(0);
  });

  it("produces a deterministic, descending-score order", () => {
    const ranked = rankEngrams(catalog.engrams, "web automation");
    for (let i = 1; i < ranked.length; i += 1) {
      expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
    }
  });
});
