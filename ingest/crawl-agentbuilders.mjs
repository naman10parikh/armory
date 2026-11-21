#!/usr/bin/env node
// Component agent-BUILDER crawler. Curated list of the VISUAL / NO-CODE / LOW-CODE
// authoring surfaces: the drag-and-drop canvases and app-dev platforms where you
// BUILD an agent or an LLM workflow without (or with minimal) code — nodes wired on
// a graph, a chat flow designer, a prompt-chain IDE, a knowledge-base + workflow
// studio. This is the authoring layer a non-engineer (or an engineer prototyping
// fast) actually sits in to assemble the agent.
//
// It is DISTINCT from the three adjacent groups already catalogued:
//   * agent-orchestration FRAMEWORKS (crawl-frameworks, `infrastructure`) are CODE
//     libraries you program against — LangGraph, CrewAI, AutoGen, LlamaIndex. These
//     builders are the opposite affordance: a visual canvas, not an import.
//   * agent/conversational UI FRONTENDS (crawl-agentui, `infrastructure`) render a
//     finished agent as a chat surface for the END USER — CopilotKit, Open WebUI,
//     LibreChat. These builders are the DESIGN-TIME surface the DEVELOPER uses to
//     create the agent, not the runtime UI the user talks to. (Chainlit/Streamlit/
//     Gradio are deliberately left in agentui — they are chat-app UI frameworks.)
//   * durable-execution engines (crawl-orchestration, `infrastructure`) GUARANTEE a
//     long-running workflow completes — Temporal, Airflow, Prefect, Inngest. These
//     builders let you DRAW the workflow; they are not the execution substrate.
//
// crawl-agentui (A22) EXPLICITLY DEFERRED this group ("no-code agent/workflow
// BUILDERS — Dify/Flowise/Langflow — orchestration canvases, deliberately
// EXCLUDED") to keep that crawl focused on UI frontends. This crawler fills that
// documented gap. Every entry was previously absent from `infrastructure`: the
// canvases appear in the catalog ONLY as MCP SERVERS that wrap them (ai-fe-dify,
// flowise-mcp, langflow-mcp-server, activepieces, …) — never as the builder
// platform itself. Identity is type-scoped, so those `mcps` entries do not clash
// with these `infrastructure` entries (same precedent as A14 google-adk/autogpt,
// A17 instructor/lmql, A21 keycloak, A22 open-webui, A24 ollama, A25 infisical).
//
// Emits one component stub per entry into incoming/agentbuilders/ with type
// `infrastructure` — consistent with the framework (A14) and voice/UI (A15/A22)
// substrate entries already there (an installable authoring runtime == the
// substrate you build the agent WITH).
//
// Run:
//   node ingest/crawl-agentbuilders.mjs           # dry-run
//   node ingest/crawl-agentbuilders.mjs --apply   # write to incoming/agentbuilders/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-11-21";
const SOURCE_NAME = "agentbuilders";

// --- Shared helpers (mirrors crawl-secrets.mjs) ------------------------------

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
// All entries are real, actively maintained visual/no-code agent & LLM-workflow
// builders. Open-source canvases carry their actual licence; non-standard "open"
// licences (Dify, n8n, FastGPT) and proprietary SaaS are left honest rather than
// guessed, per the Armory rule. Titles are chosen so slugs stay disjoint from the
// existing `infrastructure` list and from every other staged incoming/ crawl.

const records = [
  {
    title: "Dify",
    repo: "langgenius/dify",
    url: "https://github.com/langgenius/dify",
    description: "An open LLM app-development platform with a visual workflow canvas, prompt orchestration, a RAG pipeline, agent nodes, tool/plugin wiring, and observability — build and ship chatbots, agents, and AI workflows from the browser and expose them as APIs.",
    license: "unknown",
    tags: ["no-code", "workflow-canvas", "llm-app", "rag", "self-host"],
  },
  {
    title: "Flowise",
    repo: "FlowiseAI/Flowise",
    url: "https://github.com/FlowiseAI/Flowise",
    description: "A drag-and-drop builder for LLM flows and agents: wire chains, retrievers, tools, and memory into an executable graph on a visual canvas, then serve it as an API or embedded chat widget — the canonical open-source low-code LLM flow IDE.",
    license: "Apache-2.0",
    tags: ["low-code", "drag-and-drop", "llm-flow", "agents", "self-host"],
  },
  {
    title: "Langflow",
    repo: "langflow-ai/langflow",
    url: "https://github.com/langflow-ai/langflow",
    description: "A visual framework for building multi-agent and RAG applications by dragging and connecting components on a flow graph, with a built-in playground to test runs and one-click deploy to an API — language- and model-agnostic.",
    license: "MIT",
    tags: ["visual-builder", "flow-graph", "rag", "multi-agent", "self-host"],
  },
  {
    title: "n8n",
    repo: "n8n-io/n8n",
    url: "https://github.com/n8n-io/n8n",
    description: "A fair-code workflow-automation platform with a node-based visual editor and 400+ integrations, now with first-class AI/LangChain nodes so you can build agentic workflows that call models, tools, and APIs on a canvas, self-hosted or cloud.",
    license: "unknown",
    tags: ["workflow-automation", "node-editor", "ai-nodes", "integrations", "self-host"],
  },
  {
    title: "Activepieces",
    repo: "activepieces/activepieces",
    url: "https://github.com/activepieces/activepieces",
    description: "An open-source automation and AI-workflow builder with a no-code visual flow editor, hundreds of typed pieces, and an MCP toolbelt so agents and automations can call integrated apps — a self-hostable Zapier alternative built for AI.",
    license: "MIT",
    tags: ["no-code", "automation", "flow-editor", "mcp", "self-host"],
  },
  {
    title: "Rivet",
    repo: "Ironclad/rivet",
    url: "https://github.com/Ironclad/rivet",
    description: "Ironclad's open-source visual AI programming environment: design, debug, and run complex prompt-chains and agent graphs node-by-node in a desktop IDE, then embed the resulting graphs in your app via its TypeScript runtime library.",
    license: "MIT",
    tags: ["visual-ide", "prompt-graph", "agents", "debugging", "self-host"],
  },
  {
    title: "Botpress",
    repo: "botpress/botpress",
    url: "https://github.com/botpress/botpress",
    description: "An open platform for building conversational AI agents and chatbots with a visual flow studio, an LLM-native knowledge base, built-in channels (web, WhatsApp, Slack), and tool integrations — design the bot's logic on a canvas and deploy.",
    license: "MIT",
    tags: ["no-code", "chatbot-builder", "conversational-ai", "flow-studio", "self-host"],
  },
  {
    title: "Sim Studio",
    repo: "simstudioai/sim",
    url: "https://github.com/simstudioai/sim",
    description: "An open-source, figma-like canvas for building and deploying AI agent workflows: drag blocks for models, tools, memory, and control flow onto an infinite canvas, test in a live playground, and run them as APIs, webhooks, or schedules.",
    license: "Apache-2.0",
    tags: ["visual-canvas", "agent-workflow", "low-code", "playground", "self-host"],
  },
  {
    title: "Dust",
    repo: "dust-tt/dust",
    url: "https://github.com/dust-tt/dust",
    description: "A platform for building and deploying custom AI assistants and agents over a company's data: a visual app/agent builder, connections to internal sources, tool actions, and shared workspaces so teams assemble agents without shipping code.",
    license: "MIT",
    tags: ["agent-builder", "assistants", "enterprise-data", "low-code", "self-host"],
  },
  {
    title: "FastGPT",
    repo: "labring/FastGPT",
    url: "https://github.com/labring/FastGPT",
    description: "A knowledge-base platform built on LLMs with out-of-the-box data processing, model invocation, and — crucially — a visual Flow editor for orchestrating complex question-answering and agent workflows without writing code.",
    license: "unknown",
    tags: ["knowledge-base", "flow-editor", "rag", "no-code", "self-host"],
  },
  {
    title: "Bisheng",
    repo: "dataelement/bisheng",
    url: "https://github.com/dataelement/bisheng",
    description: "An open LLM-application devops platform for enterprises: a visual workflow and agent builder, document-parsing and RAG pipelines, role-based governance, and deployment, letting business and technical users co-build AI apps on one canvas.",
    license: "Apache-2.0",
    tags: ["enterprise", "visual-builder", "workflow", "rag", "self-host"],
  },
  {
    title: "PySpur",
    repo: "PySpur-Dev/pyspur",
    url: "https://github.com/PySpur-Dev/pyspur",
    description: "An open-source visual playground for agentic workflows: drag model, tool, and logic nodes onto a graph, run and evaluate them inline, and export the flow — a Python-native, batteries-included node-based agent builder.",
    license: "Apache-2.0",
    tags: ["visual-builder", "agentic-workflow", "node-graph", "python", "self-host"],
  },
  {
    title: "Open Agent Platform",
    repo: "langchain-ai/open-agent-platform",
    url: "https://github.com/langchain-ai/open-agent-platform",
    description: "LangChain's no-code web UI for building, configuring, and sharing agents — connect tools and MCP servers, attach RAG, wire multi-agent supervision, and manage access, all without code — the authoring front end over its agent runtime.",
    license: "MIT",
    tags: ["no-code", "agent-builder", "mcp", "multi-agent", "self-host"],
  },
  {
    title: "Voiceflow",
    repo: "",
    url: "https://www.voiceflow.com/",
    description: "A collaborative visual platform for designing, prototyping, and shipping conversational and voice AI agents: a drag-and-drop flow designer, knowledge-base ingestion, and channel deployment used by teams to build customer-facing assistants.",
    license: "proprietary",
    tags: ["no-code", "conversational-ai", "voice", "flow-designer", "saas"],
  },
  {
    title: "Relevance AI",
    repo: "",
    url: "https://relevanceai.com/",
    description: "A no-code platform for building AI agents and multi-agent teams: compose tools, prompts, data, and approval steps on a visual builder to automate back-office work, with a managed runtime so non-engineers ship production agents.",
    license: "proprietary",
    tags: ["no-code", "agent-builder", "multi-agent", "automation", "saas"],
  },
  {
    title: "Stack AI",
    repo: "",
    url: "https://www.stack-ai.com/",
    description: "A drag-and-drop builder for enterprise LLM apps and agents: connect models, vector stores, tools, and your data on a visual canvas, then deploy as an API, chatbot, or form — a low-code studio aimed at business workflows and automations.",
    license: "proprietary",
    tags: ["low-code", "drag-and-drop", "enterprise", "llm-app", "saas"],
  },
  {
    title: "Gumloop",
    repo: "",
    url: "https://www.gumloop.com/",
    description: "A no-code canvas for automating work with AI: chain model calls, scrapers, and app integrations into shareable 'flows' on a visual board, so teams build agentic automations and data pipelines without writing code.",
    license: "proprietary",
    tags: ["no-code", "automation", "visual-canvas", "ai-workflow", "saas"],
  },
  {
    title: "Lindy",
    repo: "",
    url: "https://www.lindy.ai/",
    description: "A no-code platform for building AI assistants ('Lindies') that trigger on events and run multi-step workflows across email, calendar, CRM, and hundreds of apps — a visual builder plus managed runtime for autonomous business agents.",
    license: "proprietary",
    tags: ["no-code", "ai-assistant", "automation", "integrations", "saas"],
  },
];

// --- Adapter ------------------------------------------------------------------

function agentBuildersAdapter() {
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
          tags: ["agent-builder", "no-code", "low-code", "visual-workflow", "infrastructure", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when you want to BUILD an agent or an LLM workflow on a visual canvas instead of in code — wiring model, tool, retrieval, memory, and control-flow nodes together, testing in a playground, and deploying, without hand-writing the orchestration. It is the design-time authoring surface: distinct from a code framework (which you import), a chat-UI frontend (which the end user talks to), and a durable-execution engine (which guarantees the run completes).\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's visual/no-code agent-builder list — the authoring layer deliberately deferred by the agent-UI crawl. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-secrets.mjs) -------------------------------

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
    const adapter = agentBuildersAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[agentbuilders] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[agentbuilders] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[agentbuilders] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
