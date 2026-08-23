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

// Enriched shape returned by the shared engine's computeRows (a normalized component + domain, a 0-100
// Universal score, and the primary popularity signal). Used by the `search_catalog` tool below.
interface EngineRow {
  name: string; component: string; domain: string; url: string | null; desc: string;
  scores: { universal: number | null };
  primary: { key: string; value: number | null; pct: number; label: string } | null;
}

const tokenize = (text: string): string[] =>
  text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);

// Simple, deterministic keyword score: a term in the name outweighs a tag, which outweighs the body.
// No LLM, no network — the SAME scorer as the CLI `search` command and GET /api/search.
function keywordScore(component: Component, qTerms: string[]): number {
  const name = new Set(tokenize(component.name));
  const tags = new Set(tokenize((component.tags || []).join(" ")));
  const desc = new Set(tokenize(component.description || ""));
  let s = 0;
  for (const term of qTerms) {
    if (name.has(term)) s += 3;
    if (tags.has(term)) s += 2;
    if (desc.has(term)) s += 1;
  }
  return s;
}

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

  server.registerTool(
    "search_catalog",
    {
      title: "Search catalog",
      description:
        "Keyword-search the catalog by name + description + tags and return ranked JSON, each hit enriched with its normalized component type, domain, 0-100 Universal score, and primary signal. Optional component and domain filters. Use to find the building blocks that match a task phrase — e.g. 'browser automation' MCPs, or 'oauth' skills. Deterministic keyword relevance, no LLM. Complements rank_components: search finds by words, rank orders a whole slice by score.",
      inputSchema: z.object({
        query: z.string().min(1).describe("search terms"),
        component: z
          .string()
          .optional()
          .describe("filter to one component type: mcp|cli|skill|plugin|hook|subagent|rules|tool|memory|eval|..."),
        domain: z
          .string()
          .optional()
          .describe("filter to one domain: front-end|back-end|browser|payments|ai-agents|database|auth|search|devops|comms|..."),
        limit: z.number().int().positive().max(100).default(20),
      }),
    },
    async ({ query, component, domain, limit }) => {
      const components = loadCatalog().components;
      // The engine's .d.mts predates computeRows (it declares leaderboard/rows/facets); intersect the
      // real module type with the missing export to stay type-safe without touching the engine or types.
      const { computeRows } = (await import("../../lib/rank.mjs")) as typeof import("../../lib/rank.mjs") & {
        computeRows: (c: unknown[]) => EngineRow[];
      };
      const rows = computeRows(components); // same order as components (a .map)
      const qTerms = [...new Set(tokenize(query))];
      const scored = components
        .map((c, i) => ({ row: rows[i], score: keywordScore(c, qTerms) }))
        .filter(
          ({ row, score }) =>
            score > 0 && (!component || row.component === component) && (!domain || row.domain === domain),
        )
        .sort(
          (a, b) =>
            b.score - a.score ||
            (b.row.scores.universal ?? -1) - (a.row.scores.universal ?? -1) ||
            a.row.name.localeCompare(b.row.name),
        );
      const items = scored.slice(0, limit).map(({ row }) => ({
        name: row.name, component: row.component, domain: row.domain, url: row.url,
        universal: row.scores.universal, primary: row.primary, desc: row.desc,
      }));
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ items, total: scored.length }, null, 2) }],
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
