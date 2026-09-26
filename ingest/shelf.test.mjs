// The shelf a new contributor-feed row goes on (ingest/shelf.mjs). Zero-dep (node:test), no files touched.
import { test } from "node:test";
import assert from "node:assert/strict";
import { typeOf, freeSlug, titleFor } from "./shelf.mjs";

test("shelf: a tool that works on MCP servers is not filed as one", () => {
  const agentShield = "AI agent security scanner. Detect vulnerabilities in agent configurations, MCP servers, and tool " +
    "permissions. Available as CLI, GitHub Action, ECC plugin, and GitHub App integration.";
  assert.equal(typeOf("AgentShield", "https://github.com/affaan-m/agentshield", agentShield), "clis-tools");
});

test("shelf: an MCP server is still filed as one, by its name, its URL or its first sentence", () => {
  assert.equal(typeOf("Playwright MCP", "https://github.com/microsoft/playwright-mcp", "Browser automation for agents."), "mcps");
  assert.equal(typeOf("GitHub", "https://github.com/github/github-mcp-server", "GitHub's official server."), "mcps");
  assert.equal(typeOf("Context7", "https://github.com/upstash/context7",
    "Context7 MCP Server -- Up-to-date code documentation for LLMs and AI code editors"), "mcps");
  assert.equal(typeOf("Kit", "https://github.com/o/kit", "A Model Context Protocol server for tickets."), "mcps");
});

test("shelf: the other shelves still read the whole description", () => {
  assert.equal(typeOf("Kit", "https://github.com/o/kit", "A fast toolkit. Ships an OpenTelemetry exporter for tracing."), "observability");
  assert.equal(typeOf("Kit", "https://github.com/o/kit", "A fast toolkit. Scores agents on a public leaderboard."), "evals");
  assert.equal(typeOf("Kit", "https://github.com/o/kit", "A fast toolkit."), "clis-tools");
});

test("slug: another repository's row holding the slug gives the new row -2, and existing rows never change", () => {
  const mcp = { name: "microsoft-playwright", type: "mcps", source_url: "https://github.com/microsoft/playwright-mcp" };
  const rows = [mcp];
  const before = JSON.stringify(rows);
  assert.equal(freeSlug("microsoft-playwright", "https://github.com/microsoft/playwright", rows), "microsoft-playwright-2");
  assert.equal(JSON.stringify(rows), before);
  assert.equal(freeSlug("o-free", "https://github.com/o/free", rows), "o-free");
  const two = [mcp, { name: "microsoft-playwright-2", source_url: "https://github.com/someone/else" }];
  assert.equal(freeSlug("microsoft-playwright", "https://github.com/microsoft/playwright", two), "microsoft-playwright-3");
});

test("slug: no second row for a repository that is listed already, or when a holder names no repository", () => {
  const listed = [{ name: "microsoft-playwright", source_url: "https://github.com/microsoft/playwright-mcp" },
    { name: "microsoft-playwright-2", source_url: "https://github.com/Microsoft/Playwright#readme" }];
  assert.equal(freeSlug("microsoft-playwright", "https://github.com/microsoft/playwright", listed), null);
  assert.equal(freeSlug("o-r", "https://github.com/o/r", [{ name: "o-r", source_url: "https://github.com/o/r/blob/main/SKILL.md" }]), null);
  assert.equal(freeSlug("o-r", "https://github.com/o/r", [{ name: "o-r", source_url: "https://mcp.so/server/o-r" }]), null);
});

test("name: a row that took a -2 shows its own slug, and the title reaches the catalog row only when set", async () => {
  const { componentOf, parseFrontmatter } = await import("./catalog.mjs");
  const rows = [{ name: "microsoft-playwright", type: "mcps", source_url: "https://github.com/microsoft/playwright-mcp" }];
  const slug = freeSlug("microsoft-playwright", "https://github.com/microsoft/playwright", rows);
  assert.equal(titleFor("microsoft-playwright", slug), "microsoft-playwright");
  assert.equal(titleFor("o-free", freeSlug("o-free", "https://github.com/o/free", rows)), undefined);
  const md = (extra) => `---\nname: ${slug}\n${extra}type: clis-tools\ndescription: >\n  Web testing.\n---\nbody\n`;
  const withTitle = componentOf(parseFrontmatter(md("title: microsoft-playwright\n")), "clis-tools", `${slug}.md`);
  assert.equal(withTitle.name, "microsoft-playwright-2");
  assert.equal(withTitle.title, "microsoft-playwright");
  assert.ok(!("title" in componentOf(parseFrontmatter(md("")), "clis-tools", `${slug}.md`)));
});
