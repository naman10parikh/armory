#!/usr/bin/env node
// Agent / conversational-UI crawler. Curated list of the FRONTEND layer an agent is
// presented to a human through — the chat/copilot interface the user actually types into.
// Three tiers:
//   1. Embeddable agent-UI component libraries / SDKs — drop a copilot or chat surface
//      INTO your own product (CopilotKit, assistant-ui, Vercel AI SDK UI).
//   2. Rapid chat-app UI frameworks — stand up a conversational LLM app from code, mostly
//      Python/full-stack (Chainlit, Streamlit, Gradio, Mesop, Reflex).
//   3. Self-hosted ChatGPT-style frontends — ready-to-run, multi-model chat clients with
//      tools/RAG/MCP support (Open WebUI, LibreChat, Lobe Chat, AnythingLLM, Jan, Chatbox,
//      big-AGI, Hugging Face Chat UI, NextChat).
// Fills a real, previously-empty axis. The whole A5–A21 arc built the BACKEND stack —
// retrieval substrate (vector/graph DB, embeddings, rerankers, docparse), serving (inference
// engines), routing (gateways), orchestration (frameworks), durable execution, training,
// data curation, experiment tracking, identity/authz. The one layer never cataloged across
// all 12 categories is the human-facing one: what renders the agent as a conversation and
// takes the user's input. It is the mirror of the voice modality (A15, the speech-facing
// end) on the text/visual-facing end: streaming tokens, tool-call rendering, message state,
// file upload, generative/interactive UI, model switching. The path:
//   backend agent (frameworks A14 + models + retrieval) -> UI frontend (THIS) -> user.
// Verified disjoint across all 12 categories AS `infrastructure`: every tool here appears
// only as `clis-tools` (copilotkit-*, open-webui-open-webui), `mcps` (assistant-ui,
// librechat-*/open-webui MCP connectors, docs servers), or incidentally inside unrelated
// components — never as the UI framework itself in `infrastructure`; identity is type-scoped,
// so there is no clash, the same precedent as A14 (google-adk / autogpt) / A17
// (instructor / lmql) / A18 (distilabel / label-studio) / A19 (temporal / airflow) / A20
// (weights-and-biases) / A21 (keycloak / casbin). Chose `infrastructure` for consistency
// with the voice runtime (A15) and agent-framework (A14) entries already there — an
// installable UI runtime/library is the substrate you build the agent's interface on; the
// infra list had compute sandboxes + inference + retrieval + routing but no presentation layer.
// Slugs are kept distinct where a vendor also appears elsewhere ("Vercel AI SDK" slugs to
// vercel-ai-sdk, disjoint from the infra `vercel` deploy entry; "Open WebUI" slugs to
// open-webui, disjoint from the clis-tools open-webui-open-webui, and type-scoped anyway).
// Deliberately EXCLUDED to keep the set tight and UI-focused: no-code agent/workflow
// BUILDERS that are really orchestration canvases, not chat UIs (Dify, Flowise, Langflow),
// and model-runner UIs that are inference front-ends rather than agent chat clients
// (text-generation-webui, LM Studio). Proprietary-unclear licenses kept `license: unknown`
// rather than guessed. All emitted slugs verified disjoint vs brain/components/infrastructure
// and from each other.
//
// Run:
//   node ingest/crawl-agentui.mjs           # dry-run
//   node ingest/crawl-agentui.mjs --apply   # write to incoming/agentui/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-11-07";
const SOURCE_NAME = "agentui";

// --- Shared helpers (mirrors crawl-authz.mjs) --------------------------------

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
// Each record: { title, repo ("owner/repo"), url, description, license, tier, tags }.
// All entries are real, broadly-adopted agent / chat UI frameworks. Titles slugify
// disjoint from the existing infrastructure list and from each other.

const records = [
  // --- Tier 1: embeddable agent-UI component libraries / SDKs -----------------
  {
    title: "CopilotKit",
    repo: "CopilotKit/CopilotKit",
    url: "https://github.com/CopilotKit/CopilotKit",
    description: "A React framework for building in-app AI copilots and agentic UIs: drop-in chat and sidebar components plus hooks that give the agent read/write access to app state and the ability to render generative UI, so an agent lives inside your product instead of a separate window.",
    license: "MIT",
    tier: "embeddable",
    tags: ["react", "copilot", "generative-ui", "in-app-assistant"],
  },
  {
    title: "assistant-ui",
    repo: "assistant-ui/assistant-ui",
    url: "https://github.com/assistant-ui/assistant-ui",
    description: "A TypeScript/React component library for AI chat: composable, accessible primitives for message threads, streaming, tool-call rendering, attachments, and model switching, letting you assemble a production chat interface wired to any backend or runtime.",
    license: "MIT",
    tier: "embeddable",
    tags: ["react", "chat-ui", "streaming", "tool-calls"],
  },
  {
    title: "Vercel AI SDK",
    repo: "vercel/ai",
    url: "https://github.com/vercel/ai",
    description: "A TypeScript toolkit whose UI layer (useChat/useCompletion hooks and streaming helpers) renders model and tool-call output as it arrives across React, Svelte, and Vue, providing the client-side streaming and generative-UI substrate that agent chat frontends are built on.",
    license: "Apache-2.0",
    tier: "embeddable",
    tags: ["typescript", "streaming", "usechat", "generative-ui"],
  },

  // --- Tier 2: rapid chat-app UI frameworks ----------------------------------
  {
    title: "Chainlit",
    repo: "Chainlit/chainlit",
    url: "https://github.com/Chainlit/chainlit",
    description: "A Python framework for building conversational AI apps: wrap your agent logic and get a chat UI with streaming, intermediate reasoning steps, elements (images, files, plots), human feedback, and authentication, so an LLM backend becomes a usable chat app in a few lines.",
    license: "Apache-2.0",
    tier: "chatapp",
    tags: ["python", "chat-ui", "streaming", "llm-app"],
  },
  {
    title: "Streamlit",
    repo: "streamlit/streamlit",
    url: "https://github.com/streamlit/streamlit",
    description: "A Python framework that turns scripts into shareable web apps; its native chat elements (st.chat_message, st.chat_input, write_stream) make it the de-facto way to stand up a streaming conversational interface around an LLM or agent with pure Python.",
    license: "Apache-2.0",
    tier: "chatapp",
    tags: ["python", "web-app", "chat-elements", "prototyping"],
  },
  {
    title: "Gradio",
    repo: "gradio-app/gradio",
    url: "https://github.com/gradio-app/gradio",
    description: "A Python library for building ML/LLM web UIs with a few lines of code; its ChatInterface and Chatbot components provide a streaming conversational front-end (the default chat UI on Hugging Face Spaces) for wrapping an agent or model demo.",
    license: "Apache-2.0",
    tier: "chatapp",
    tags: ["python", "chatinterface", "huggingface-spaces", "prototyping"],
  },
  {
    title: "Mesop",
    repo: "google/mesop",
    url: "https://github.com/google/mesop",
    description: "A Python UI framework from Google for building web apps (including chat/demo UIs) entirely in Python with composable components and hot reload, used to rapidly stand up internal conversational and agent interfaces without front-end code.",
    license: "Apache-2.0",
    tier: "chatapp",
    tags: ["python", "web-ui", "components", "rapid-ui"],
  },
  {
    title: "Reflex",
    repo: "reflex-dev/reflex",
    url: "https://github.com/reflex-dev/reflex",
    description: "A full-stack Python framework for building reactive web apps without JavaScript; its state model and component library let you build custom chat and agent interfaces (with streaming and real-time updates) in pure Python and deploy them as a single app.",
    license: "Apache-2.0",
    tier: "chatapp",
    tags: ["python", "full-stack", "reactive", "web-app"],
  },

  // --- Tier 3: self-hosted ChatGPT-style frontends ---------------------------
  {
    title: "Open WebUI",
    repo: "open-webui/open-webui",
    url: "https://github.com/open-webui/open-webui",
    description: "A self-hosted, extensible chat interface for LLMs supporting Ollama and any OpenAI-compatible API, with RAG over documents, web search, tool/function calling, model management, and multi-user access — a full ChatGPT-style frontend you run yourself.",
    license: "unknown",
    tier: "selfhosted",
    tags: ["self-hosted", "ollama", "rag", "openai-compatible"],
  },
  {
    title: "LibreChat",
    repo: "danny-avila/LibreChat",
    url: "https://github.com/danny-avila/LibreChat",
    description: "An open-source, self-hosted ChatGPT-style frontend that unifies many model providers in one UI, with conversation search, presets, agents, code interpreter, RAG, and MCP tool support, giving teams a single multi-model chat client under their own control.",
    license: "MIT",
    tier: "selfhosted",
    tags: ["self-hosted", "multi-provider", "agents", "mcp"],
  },
  {
    title: "Lobe Chat",
    repo: "lobehub/lobe-chat",
    url: "https://github.com/lobehub/lobe-chat",
    description: "An open-source, modern-design chat framework supporting multiple model providers, a plugin/function-calling system, assistant marketplace, speech, and vision, deployable as a self-hosted multi-model chat UI for agents and LLM apps.",
    license: "unknown",
    tier: "selfhosted",
    tags: ["self-hosted", "plugins", "multi-provider", "function-calling"],
  },
  {
    title: "AnythingLLM",
    repo: "Mintplex-Labs/anything-llm",
    url: "https://github.com/Mintplex-Labs/anything-llm",
    description: "An all-in-one desktop and self-hosted AI application that bundles a chat UI with document workspaces, RAG, agents, and MCP-compatible tool use over any LLM and vector store, so a team can chat with its own knowledge base out of the box.",
    license: "MIT",
    tier: "selfhosted",
    tags: ["self-hosted", "desktop", "rag", "workspaces"],
  },
  {
    title: "Jan",
    repo: "menloresearch/jan",
    url: "https://github.com/menloresearch/jan",
    description: "An open-source, offline-first desktop chat application (an alternative to ChatGPT) that runs local models via its own engine and also connects to remote APIs, giving a private, self-contained chat UI for interacting with LLMs and agents.",
    license: "Apache-2.0",
    tier: "selfhosted",
    tags: ["desktop", "offline-first", "local-models", "privacy"],
  },
  {
    title: "Chatbox",
    repo: "Bin-Huang/chatbox",
    url: "https://github.com/Bin-Huang/chatbox",
    description: "A cross-platform desktop chat client for many model providers and local models, with artifact rendering, file and image input, and prompt management, providing a ready-made front-end for talking to LLMs without building a UI.",
    license: "unknown",
    tier: "selfhosted",
    tags: ["desktop", "cross-platform", "multi-provider", "client"],
  },
  {
    title: "big-AGI",
    repo: "enricoros/big-AGI",
    url: "https://github.com/enricoros/big-AGI",
    description: "An advanced open-source AI chat suite supporting many providers, with personas, multi-model chat, beam/branching, code execution, and generative features, usable as a self-hosted power-user front-end for LLMs and agents.",
    license: "MIT",
    tier: "selfhosted",
    tags: ["self-hosted", "multi-model", "personas", "power-user"],
  },
  {
    title: "Hugging Face Chat UI",
    repo: "huggingface/chat-ui",
    url: "https://github.com/huggingface/chat-ui",
    description: "The open-source SvelteKit chat interface that powers HuggingChat: a self-hostable front-end for open models served via text-generation-inference or any endpoint, with web search, tools, and multi-model support.",
    license: "Apache-2.0",
    tier: "selfhosted",
    tags: ["self-hosted", "sveltekit", "open-models", "huggingface"],
  },
  {
    title: "NextChat",
    repo: "ChatGPTNextWeb/NextChat",
    url: "https://github.com/ChatGPTNextWeb/NextChat",
    description: "A lightweight, cross-platform (web/desktop) ChatGPT-style client for multiple providers with prompt templates, plugins, and one-click self-hosting, giving a fast, deployable chat UI front-end for LLM access.",
    license: "MIT",
    tier: "selfhosted",
    tags: ["self-hosted", "cross-platform", "lightweight", "client"],
  },
];

// Human-readable description of each tier for the stub body.
const TIER_BLURB = {
  embeddable: "an embeddable agent-UI component library / SDK — you drop a chat or copilot surface INTO your own product and wire it to the agent backend, so the assistant lives inside the app with access to its state and generative UI",
  chatapp: "a rapid chat-app UI framework — you wrap your agent logic in code and get a full conversational web app (streaming, message state, file input) without building a front-end from scratch",
  selfhosted: "a self-hosted, ready-to-run ChatGPT-style chat frontend — a complete multi-model chat client with tools, RAG, and often MCP support that you deploy and point at your models",
};

// --- Adapter -----------------------------------------------------------------

function agentuiAdapter() {
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
      const tierBlurb = TIER_BLURB[item.tier] || "an agent / conversational UI component";

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
          tags: ["infrastructure", "agent-ui", "chat-ui", "frontend", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when you need the human-facing surface of an agent: it is ${tierBlurb}. It sits at the presentation layer of an agent system — the backend agent (orchestration framework + model + retrieval) produces tokens and tool calls, and this UI renders them to the user and takes their input back: backend agent -> UI frontend (this) -> user.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's infrastructure list — the agent / conversational UI layer that presents an agent as a chat or copilot. Distinct from the orchestration frameworks (which decide what the agent does) and the voice runtimes (the speech-facing end), this is the text/visual front-end the user interacts with. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-authz.mjs) ---------------------------------

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
    const adapter = agentuiAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[agentui] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[agentui] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[agentui] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
