#!/usr/bin/env node
// Component agent-framework crawler. Curated list of the agent orchestration /
// multi-agent FRAMEWORKS — the programmatic substrate an agent is actually BUILT on:
// the library/runtime that wires together the very components Armory catalogs
// (MCPs, skills, tools, memory, models) into a running agent with planning loops,
// tool/function calling, state/graph control flow, multi-agent handoffs, and
// streaming. This is the composition layer the whole registry feeds into:
//   MCPs + skills + hooks + memory + models  ->  agent framework (THIS)  ->  agent.
// Previously absent across all 12 categories as a first-class group: every major
// framework (LangGraph, CrewAI, AutoGen, OpenAI Agents SDK, LlamaIndex, DSPy,
// Pydantic AI, Agno, smolagents, …) appeared ONLY incidentally — as MCP servers
// that mention it, docs MCPs, or subagents that reference it — never as the
// framework itself. The infrastructure list holds compute SANDBOXES (E2B, Modal,
// Daytona), model INFERENCE engines (vLLM, SGLang, llama.cpp), and the retrieval
// substrate (vector/graph DB, embeddings, rerankers, docparse, gateways) but not
// the orchestration framework that calls them. Emits one component stub per entry
// into incoming/frameworks/ with type `infrastructure` (an installable agent
// library/runtime == substrate, consistent with the inference-engine entries
// already in infrastructure and with crawl-vectordb/graphdb/embeddings/rerankers/
// docparse/gateways).
//
// Run:
//   node ingest/crawl-frameworks.mjs           # dry-run
//   node ingest/crawl-frameworks.mjs --apply   # write to incoming/frameworks/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-10-26";
const SOURCE_NAME = "frameworks";

// --- Shared helpers (mirrors crawl-gateways.mjs) -----------------------------

function uniqueName(base, seen) {
  let name = base || "untitled";
  if (!seen.has(name)) { seen.add(name); return name; }
  for (let n = 2; ; n++) {
    const cand = `${name}-${n}`;
    if (!seen.has(cand)) { seen.add(cand); return cand; }
  }
}

function resetDir(dir) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function scrub(s) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\/Users\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/home\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/root(\/[^\s]*)?/g, "<path>");
}

// --- Curated records ---------------------------------------------------------
// Each record: { title, repo ("owner/repo" or ""), url, description, license, tags }
// All entries are real, actively maintained agent orchestration / multi-agent
// frameworks. Titles slugify disjoint from the existing infrastructure list and
// from each other. A few names also exist under OTHER types (semantic-kernel,
// google-adk, autogpt as subagents/skills/clis-tools, or incidental mcps) —
// identity is type-scoped, so there is no clash in `infrastructure`.

const records = [
  {
    title: "LangGraph",
    repo: "langchain-ai/langgraph",
    url: "https://github.com/langchain-ai/langgraph",
    description: "A low-level orchestration framework for building stateful, multi-actor agents as graphs: durable execution, cycles, branching, human-in-the-loop checkpoints, and persistence — the control-flow layer underneath many production LangChain agents.",
    license: "MIT",
    tags: ["graph", "stateful", "human-in-the-loop", "python"],
  },
  {
    title: "CrewAI",
    repo: "crewAIInc/crewAI",
    url: "https://github.com/crewAIInc/crewAI",
    description: "A standalone Python framework for orchestrating role-playing autonomous agents into a collaborating crew — each agent gets a role, goal, and tools, and tasks are executed sequentially or in parallel toward a shared objective.",
    license: "MIT",
    tags: ["multi-agent", "roles", "tasks", "python"],
  },
  {
    title: "AutoGen",
    repo: "microsoft/autogen",
    url: "https://github.com/microsoft/autogen",
    description: "Microsoft's framework for multi-agent conversation: compose agents (assistants, user proxies, tool executors) that message each other to solve tasks, with an event-driven runtime, group chats, and code-execution loops.",
    license: "MIT",
    tags: ["multi-agent", "conversation", "microsoft", "python"],
  },
  {
    title: "OpenAI Agents SDK",
    repo: "openai/openai-agents-python",
    url: "https://github.com/openai/openai-agents-python",
    description: "OpenAI's lightweight SDK for building agentic apps with a small set of primitives — agents, tools, handoffs between agents, and guardrails — plus built-in tracing, usable with any OpenAI-compatible model provider.",
    license: "MIT",
    tags: ["agents", "handoffs", "tracing", "openai"],
  },
  {
    title: "LlamaIndex",
    repo: "run-llama/llama_index",
    url: "https://github.com/run-llama/llama_index",
    description: "A data framework for LLM applications and agents: ingest and index private data, build RAG query engines and tool-using agents, and compose event-driven multi-step Workflows over your knowledge sources.",
    license: "MIT",
    tags: ["rag", "data-framework", "workflows", "python"],
  },
  {
    title: "Haystack",
    repo: "deepset-ai/haystack",
    url: "https://github.com/deepset-ai/haystack",
    description: "deepset's open-source framework for building production LLM pipelines and agents from composable components — retrievers, rankers, generators, and tools wired into branching pipelines for RAG, Q&A, and agentic search.",
    license: "Apache-2.0",
    tags: ["pipelines", "rag", "components", "python"],
  },
  {
    title: "Pydantic AI",
    repo: "pydantic/pydantic-ai",
    url: "https://github.com/pydantic/pydantic-ai",
    description: "An agent framework from the Pydantic team that brings type-safe, structured outputs and dependency injection to LLM apps — define tools and validated result schemas, with model-agnostic providers and built-in observability.",
    license: "MIT",
    tags: ["type-safe", "structured-output", "tools", "python"],
  },
  {
    title: "Agno",
    repo: "agno-agi/agno",
    url: "https://github.com/agno-agi/agno",
    description: "A full-stack, high-performance framework for building multi-agent systems with memory, knowledge, and reasoning — model-agnostic, with first-class tools, built-in vector/knowledge stores, and a runtime for serving agents as APIs.",
    license: "MPL-2.0",
    tags: ["multi-agent", "memory", "knowledge", "python"],
  },
  {
    title: "DSPy",
    repo: "stanfordnlp/dspy",
    url: "https://github.com/stanfordnlp/dspy",
    description: "Stanford's framework for programming — not prompting — language models: express pipelines as typed modules and optimizers that automatically compile and tune the prompts/weights against a metric, replacing brittle prompt strings with code.",
    license: "MIT",
    tags: ["prompt-optimization", "modules", "declarative", "python"],
  },
  {
    title: "Semantic Kernel",
    repo: "microsoft/semantic-kernel",
    url: "https://github.com/microsoft/semantic-kernel",
    description: "Microsoft's enterprise SDK for integrating LLMs into apps across C#, Python, and Java — plugins (skills), planners, memory connectors, and an agent framework that make model calls a first-class, composable part of application code.",
    license: "MIT",
    tags: ["plugins", "planners", "enterprise", "dotnet"],
  },
  {
    title: "smolagents",
    repo: "huggingface/smolagents",
    url: "https://github.com/huggingface/smolagents",
    description: "A minimal Hugging Face library for agents that think in code: the agent writes and executes Python actions rather than JSON tool calls, with sandboxed execution, Hub-shared tools, and support for any LLM in a few hundred lines.",
    license: "Apache-2.0",
    tags: ["code-agents", "minimal", "huggingface", "python"],
  },
  {
    title: "Mastra",
    repo: "mastra-ai/mastra",
    url: "https://github.com/mastra-ai/mastra",
    description: "A TypeScript agent framework from the Gatsby team covering the full stack: agents with tools and memory, deterministic graph-based workflows, RAG, evals, and local dev tooling — build and deploy JS/TS agents end to end.",
    license: "Apache-2.0",
    tags: ["typescript", "workflows", "memory", "rag"],
  },
  {
    title: "LangChain",
    repo: "langchain-ai/langchain",
    url: "https://github.com/langchain-ai/langchain",
    description: "The widely used framework for building LLM applications: standardized interfaces to models, tools, retrievers, and vector stores, plus chains and agents that compose them — the ecosystem many other agent stacks build on.",
    license: "MIT",
    tags: ["chains", "tools", "retrievers", "ecosystem"],
  },
  {
    title: "Atomic Agents",
    repo: "BrainBlend-AI/atomic-agents",
    url: "https://github.com/BrainBlend-AI/atomic-agents",
    description: "A lightweight, modular framework built on Instructor and Pydantic for composing agents from small, swappable, schema-validated building blocks — favoring explicit, atomic, testable pipelines over heavy abstractions.",
    license: "MIT",
    tags: ["modular", "schema-validated", "instructor", "python"],
  },
  {
    title: "Agency Swarm",
    repo: "VRSEN/agency-swarm",
    url: "https://github.com/VRSEN/agency-swarm",
    description: "An agent orchestration framework built on the OpenAI Assistants/Agents API for assembling collaborating agencies of specialized agents with defined roles, custom tools, and controllable communication flows between them.",
    license: "MIT",
    tags: ["multi-agent", "roles", "orchestration", "python"],
  },
  {
    title: "MetaGPT",
    repo: "geekan/MetaGPT",
    url: "https://github.com/geekan/MetaGPT",
    description: "A multi-agent framework that assigns software-company roles (product manager, architect, engineer, QA) to agents and runs them through standardized operating procedures to turn a one-line requirement into a full project.",
    license: "MIT",
    tags: ["multi-agent", "sop", "software-company", "python"],
  },
  {
    title: "CAMEL",
    repo: "camel-ai/camel",
    url: "https://github.com/camel-ai/camel",
    description: "A research-driven framework for studying the behaviors and scaling of multi-agent systems: role-playing agents that cooperate through structured dialogue, with tools, memory, and large-scale agent-society simulation.",
    license: "Apache-2.0",
    tags: ["multi-agent", "role-playing", "research", "python"],
  },
  {
    title: "Griptape",
    repo: "griptape-ai/griptape",
    url: "https://github.com/griptape-ai/griptape",
    description: "A modular Python framework for building agents, pipelines, and workflows with structured, predictable control flow — off-prompt tool use, memory, and rules that keep LLM behavior constrained for enterprise applications.",
    license: "Apache-2.0",
    tags: ["pipelines", "off-prompt", "structured", "python"],
  },
  {
    title: "Strands Agents",
    repo: "strands-agents/sdk-python",
    url: "https://github.com/strands-agents/sdk-python",
    description: "An AWS-originated, model-driven SDK that builds agents in a few lines by letting the model drive the plan-act loop: declare a prompt, tools (including MCP), and a model, and the agent reasons and calls tools until done.",
    license: "Apache-2.0",
    tags: ["model-driven", "mcp", "aws", "python"],
  },
  {
    title: "Google ADK",
    repo: "google/adk-python",
    url: "https://github.com/google/adk-python",
    description: "Google's open-source Agent Development Kit for building, evaluating, and deploying agents: code-first definitions, rich tools and MCP support, multi-agent composition, built-in eval, and tight integration with Gemini and Vertex AI.",
    license: "Apache-2.0",
    tags: ["google", "mcp", "evaluation", "multi-agent"],
  },
  {
    title: "AutoGPT",
    repo: "Significant-Gravitas/AutoGPT",
    url: "https://github.com/Significant-Gravitas/AutoGPT",
    description: "A platform for creating, deploying, and running continuous AI agents that autonomously chain goals into actions — a low-code agent builder and server that pioneered the autonomous-agent loop and now ships a visual block workflow.",
    license: "MIT",
    tags: ["autonomous", "low-code", "platform", "workflow"],
  },
  {
    title: "Llama Stack",
    repo: "meta-llama/llama-stack",
    url: "https://github.com/meta-llama/llama-stack",
    description: "Meta's standardized API stack for building agentic apps: unified interfaces for inference, safety, memory, tool calling, and agents across providers, with pluggable implementations so the same agent code runs local or in the cloud.",
    license: "MIT",
    tags: ["standard-api", "agents", "meta", "pluggable"],
  },
];

// --- Adapter ------------------------------------------------------------------

function frameworksAdapter() {
  const seen = new Set();

  return {
    name: SOURCE_NAME,
    type: "infrastructure",

    async fetch() {
      return records;
    },

    toComponent(item) {
      const base = slugify(item.title);
      const uname = uniqueName(base, seen);
      const desc = scrub(item.description).slice(0, 300);

      const ghMatch = (item.repo || "").match(/^([^/]+\/[^/]+)$/);
      const sourceRepo = ghMatch ? ghMatch[1] : "";
      const sourceUrl = item.url || (sourceRepo ? `https://github.com/${sourceRepo}` : "");

      return {
        frontmatter: {
          name: uname,
          type: "infrastructure",
          description: desc,
          source_repo: sourceRepo,
          source_url: sourceUrl,
          license: item.license || "unknown",
          cli_compat: ["claude", "cursor", "codex", "opencode", "gemini"],
          maturity: "stable",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: ["agent-framework", "orchestration", "multi-agent", "substrate", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} at the build stage — this is the orchestration substrate an agent is written on: the library/runtime that wires models, tools (including MCP), skills, memory, and control flow into a running agent with planning loops, tool/function calling, and multi-agent handoffs. Pick it when you are building the agent itself rather than a single component it uses.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's agent-framework list — the composition layer every other category feeds into (MCPs + skills + hooks + memory + models -> framework -> agent). Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-gateways.mjs) -------------------------------

async function runCollection(adapter, { dryRun = true, outDir = INCOMING, log = console.log } = {}) {
  const items = await adapter.fetch();
  const dir = join(outDir, adapter.name);
  if (!dryRun) resetDir(dir);
  const written = [];
  for (const item of items) {
    const { frontmatter, body } = adapter.toComponent(item);
    const file = join(dir, `${frontmatter.name}.md`);
    const md = toMarkdown({ frontmatter, body });
    // Self-validate every stub against the catalog parser before writing.
    const fm = parseFrontmatter(md);
    if (fm.name !== frontmatter.name) {
      throw new Error(`name roundtrip mismatch for ${file}: ${fm.name} != ${frontmatter.name}`);
    }
    if (!dryRun) writeFileSync(file, md);
    written.push({ file, frontmatter, md });
  }
  log(`${dryRun ? "[dry-run] " : ""}${adapter.name}: ${written.length} stub(s) -> incoming/${adapter.name}/`);
  return written;
}

// --- CLI ---------------------------------------------------------------------

async function main(argv) {
  const args = argv.slice(2);
  const dryRun = !args.includes("--apply");
  try {
    const adapter = frameworksAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[frameworks] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[frameworks] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[frameworks] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
