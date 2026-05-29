import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { rankComponents, type Catalog } from "../src/catalog.js";
import { validateMarkdown } from "../src/submit.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(
  readFileSync(join(HERE, "fixture-catalog.json"), "utf8")
) as Catalog;

describe("rankComponents (mcp)", () => {
  it("ranks browser components for 'browser' and excludes unrelated ones", () => {
    const names = rankComponents(catalog.components, "browser").map((r) => r.component.name);
    expect(names).toContain("playwright-mcp");
    expect(names).not.toContain("memory-compression");
  });

  it("returns empty for an empty query", () => {
    expect(rankComponents(catalog.components, "")).toHaveLength(0);
  });
});

describe("validateMarkdown (mcp)", () => {
  const good = `---
name: example-mcp
type: mcps
description: >
  Use it when you need an example.
source_url: https://github.com/acme/example-mcp
license: MIT
---

## What it is
An example.
`;

  it("accepts a well-formed component", () => {
    const result = validateMarkdown(good);
    expect(result.ok).toBe(true);
    expect(result.name).toBe("example-mcp");
  });

  it("rejects a missing required field", () => {
    const bad = good.replace("license: MIT\n", "");
    const result = validateMarkdown(bad);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("license"))).toBe(true);
  });

  it("rejects a bad type and non-kebab name", () => {
    const bad = good
      .replace("type: mcps", "type: notacategory")
      .replace("name: example-mcp", "name: Example_MCP");
    const result = validateMarkdown(bad);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("not one of the 12"))).toBe(true);
    expect(result.errors.some((e) => e.includes("kebab-case"))).toBe(true);
  });
});
