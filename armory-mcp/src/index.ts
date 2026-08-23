#!/usr/bin/env node
// Component MCP server — exposes the agent-native brain over stdio so any MCP
// client can search, fetch, and submit harness components (components).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  loadCatalog,
  rankComponents,
  readComponentBody,
  type Component,
} from "./catalog.js";
import { submitMarkdown } from "./submit.js";

export function createServer(): McpServer {
  const server = new McpServer({ name: "armory", version: "0.1.0" });

  server.registerTool(
    "search_components",
    {
      title: "Search components",
      description:
        "Keyword-rank agent-harness components (components) by name, description, and tags. Use to find the right MCP, skill, hook, sub-agent, or rule for a task.",
      inputSchema: z.object({
        query: z.string().min(1).describe("search terms"),
        type: z
          .string()
          .optional()
          .describe("optional: filter to one of the 12 component types"),
        limit: z.number().int().positive().max(50).default(10),
      }),
    },
    async ({ query, type, limit }) => {
      let components = loadCatalog().components;
      if (type) components = components.filter((e) => e.type === type);
      const ranked = rankComponents(components, query).slice(0, limit);
      const results = ranked.map(({ component, score }) => ({
        name: component.name,
        type: component.type,
        description: component.description.trim(),
        source_url: component.source_url,
        score: Number(score.toFixed(3)),
      }));
      return {
        content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_component",
    {
      title: "Get component",
      description:
        "Fetch the full markdown of a single component by exact name (frontmatter + body, including its install/invoke block).",
      inputSchema: z.object({
        name: z.string().min(1).describe("exact component name (kebab-case)"),
      }),
    },
    async ({ name }) => {
      const component = loadCatalog().components.find((e: Component) => e.name === name.trim());
      if (!component) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Component "${name}" not found.` }],
        };
      }
      return { content: [{ type: "text" as const, text: readComponentBody(component) }] };
    }
  );

  server.registerTool(
    "submit_component",
    {
      title: "Submit component",
      description:
        "Validate an component's frontmatter against the contract and drop it into incoming/ for verify + promotion.",
      inputSchema: z.object({
        markdown: z
          .string()
          .min(1)
          .describe("the full component markdown (YAML frontmatter + body)"),
      }),
    },
    async ({ markdown }) => {
      const result = submitMarkdown(markdown);
      if (!result.ok) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Validation failed:\n${result.errors.map((e) => `- ${e}`).join("\n")}`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: `Submitted "${result.name}" → ${result.dest}. It will be promoted after verify.`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "rank_components",
    {
      title: "Rank components",
      description:
        "Rank open-source building blocks by a Universal score (or another axis), sliceable by component type and domain. Use to find the BEST or TRENDING tool in a space — e.g. the top MCP for browser automation, or the leading front-end CLI. Returns ranked JSON with a 0-100 Universal score, GitHub stars, measured test score, and community mentions. The Universal score normalizes each signal within its own kind so a docs page ranks fairly against a 40k-star repo.",
      inputSchema: z.object({
        component: z
          .string()
          .optional()
          .describe("filter to one component type: mcp|cli|skill|plugin|hook|subagent|rules|tool|memory|eval|..."),
        domain: z
          .string()
          .optional()
          .describe("filter to one domain: front-end|back-end|browser|payments|ai-agents|database|auth|search|devops|comms|..."),
        sort: z
          .enum(["universal", "popular", "tested", "practitioner", "stars", "name"])
          .default("universal")
          .describe("ranking axis: universal (default) | popular (stars) | tested | practitioner (mentions) | stars | name"),
        ascending: z.boolean().default(false).describe("ascending instead of descending"),
        limit: z.number().int().positive().max(100).default(20),
      }),
    },
    async ({ component, domain, sort, ascending, limit }) => {
      const { leaderboard } = await import("../../lib/rank.mjs");
      const lb = leaderboard({ component, domain, sort, dir: ascending ? "asc" : "desc", limit });
      return { content: [{ type: "text" as const, text: JSON.stringify(lb, null, 2) }] };
    }
  );

  return server;
}

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdio servers log to stderr only — stdout is the JSON-RPC channel.
  process.stderr.write("armory-mcp: listening on stdio\n");
}

// Only auto-start when invoked directly (so tests can import createServer).
const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === `file://${process.argv[1]}`;
if (invokedDirectly) {
  main().catch((err: unknown) => {
    process.stderr.write(`armory-mcp fatal: ${(err as Error).message}\n`);
    process.exitCode = 1;
  });
}
