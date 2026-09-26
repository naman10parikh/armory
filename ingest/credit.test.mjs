// The row a contributor's mention reaches (ingest/credit.mjs). Zero-dep (node:test), no files touched.
import { test } from "node:test";
import assert from "node:assert/strict";
import { creditRows } from "./credit.mjs";

const row = (type, name, source_url) => ({ type, name, source_url });
const mention = (name, url, armory_name, mentions = 5) => ({ name, urls: [url], mentions, armory_name });

test("credit: a repository's mentions never reach a folder inside it; with no root row the tool is a new candidate", () => {
  const folder = row("mcps", "mastra-docs", "https://github.com/mastra-ai/mastra/tree/HEAD/packages/mcp-docs-server");
  const alone = creditRows({ existing: [mention("Mastra", "https://github.com/mastra-ai/mastra", "mastra-docs")] }, [folder]);
  assert.deepEqual(alone.credited, []);
  assert.deepEqual(alone.fresh.map((e) => e.name), ["Mastra"]);
  assert.deepEqual(alone.moved, [{ tool: "Mastra", from: "mcps/mastra-docs", to: null }]);
  const root = row("clis-tools", "mastra-ai-mastra", "https://github.com/mastra-ai/mastra");
  const both = creditRows({ existing: [mention("Mastra", "https://github.com/mastra-ai/mastra", "mastra-docs")] }, [folder, root]);
  assert.deepEqual(both.credited.map((c) => c.row), [root]);
  assert.deepEqual(both.fresh, []);
});

test("credit: a slug shared by two shelves reaches the repository's root row, not the row listed last", () => {
  const tool = row("clis-tools", "firecrawl-firecrawl", "https://github.com/firecrawl/firecrawl");
  const mcp = row("mcps", "firecrawl-firecrawl", "https://mcp.so/server/firecrawl-firecrawl");
  const { credited, moved } = creditRows({ existing: [mention("Firecrawl", "https://github.com/firecrawl/firecrawl", "firecrawl-firecrawl")] }, [tool, mcp]);
  assert.deepEqual(credited.map((c) => c.row), [tool]);
  assert.deepEqual(moved, [{ tool: "Firecrawl", from: "mcps/firecrawl-firecrawl", to: "clis-tools/firecrawl-firecrawl" }]);
});

test("credit: a match that is already the root row stays, and a mention with no GitHub link keeps its match by name", () => {
  const a = row("evals", "a", "https://github.com/o/a#readme");
  const site = row("mcps", "site", "https://mcp.so/server/site");
  const { credited, fresh, moved } = creditRows({ existing: [
    mention("A", "https://github.com/O/A", "a"),
    mention("Site", "https://mcp.so/server/site", "site"),
  ] }, [a, site]);
  assert.deepEqual(credited.map((c) => c.row), [a, site]);
  assert.deepEqual([fresh, moved], [[], []]);
});
