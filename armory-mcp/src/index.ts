#!/usr/bin/env node
// Engram MCP server — exposes the agent-native brain over stdio so any MCP
// client can search, fetch, and submit harness components (engrams).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  loadCatalog,
  rankEngrams,
  readEngramBody,
  type Engram,
} from "./catalog.js";
import { submitMarkdown } from "./submit.js";

export function createServer(): McpServer {
  const server = new McpServer({ name: "engram", version: "0.1.0" });

  server.registerTool(
    "search_engrams",
    {
      title: "Search engrams",
      description:
        "Keyword-rank agent-harness components (engrams) by name, description, and tags. Use to find the right MCP, skill, hook, sub-agent, or rule for a task.",
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
      let engrams = loadCatalog().engrams;
      if (type) engrams = engrams.filter((e) => e.type === type);
      const ranked = rankEngrams(engrams, query).slice(0, limit);
      const results = ranked.map(({ engram, score }) => ({
        name: engram.name,
        type: engram.type,
        description: engram.description.trim(),
        source_url: engram.source_url,
        score: Number(score.toFixed(3)),
      }));
      return {
        content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  server.registerTool(
    "get_engram",
    {
      title: "Get engram",
      description:
        "Fetch the full markdown of a single engram by exact name (frontmatter + body, including its install/invoke block).",
      inputSchema: z.object({
        name: z.string().min(1).describe("exact engram name (kebab-case)"),
      }),
    },
    async ({ name }) => {
      const engram = loadCatalog().engrams.find((e: Engram) => e.name === name.trim());
      if (!engram) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Engram "${name}" not found.` }],
        };
      }
      return { content: [{ type: "text" as const, text: readEngramBody(engram) }] };
    }
  );

  server.registerTool(
    "submit_engram",
    {
      title: "Submit engram",
      description:
        "Validate an engram's frontmatter against the contract and drop it into incoming/ for verify + promotion.",
      inputSchema: z.object({
        markdown: z
          .string()
          .min(1)
          .describe("the full engram markdown (YAML frontmatter + body)"),
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

  return server;
}

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdio servers log to stderr only — stdout is the JSON-RPC channel.
  process.stderr.write("engram-mcp: listening on stdio\n");
}

// Only auto-start when invoked directly (so tests can import createServer).
const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === `file://${process.argv[1]}`;
if (invokedDirectly) {
  main().catch((err: unknown) => {
    process.stderr.write(`engram-mcp fatal: ${(err as Error).message}\n`);
    process.exitCode = 1;
  });
}
