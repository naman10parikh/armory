// The shelf a new contributor-feed row goes on (ingest/shelf.mjs). Zero-dep (node:test), no files touched.
import { test } from "node:test";
import assert from "node:assert/strict";
import { typeOf } from "./shelf.mjs";

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
