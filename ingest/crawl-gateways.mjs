#!/usr/bin/env node
// Component LLM-gateway / router / proxy crawler. Curated list of the control plane
// that sits BETWEEN the agent and the model providers: a single OpenAI-compatible
// endpoint that routes a request across many providers/models with fallback, load
// balancing, semantic caching, rate-limiting, budget enforcement, and cost/quality/
// latency-based model selection. This is the last hop of the retrieval arc — after
// the context is assembled it is the layer the agent actually calls to REACH a model:
//   parse + chunk -> embed -> store (vector / graph) -> rerank -> gateway (THIS) -> model.
// Previously absent across all 12 categories as a first-class group: the infrastructure
// list is compute SANDBOXES (E2B, Modal, Fly) + model INFERENCE engines (vLLM, SGLang,
// llama.cpp) but not the provider-routing gateway; observability carries Portkey/Helicone
// for the OBSERVE angle (a different type), and only one gateway (OmniRoute) ever landed
// in infrastructure — the major gateways (LiteLLM, OpenRouter, Cloudflare/Kong AI Gateway,
// aisuite, RouteLLM, TensorZero, …) were all missing. Emits one component stub per entry
// into incoming/gateways/ with type `infrastructure` (a deployable routing service or
// library == infrastructure, consistent with crawl-vectordb/graphdb/embeddings/rerankers/
// docparse).
//
// Run:
//   node ingest/crawl-gateways.mjs           # dry-run
//   node ingest/crawl-gateways.mjs --apply   # write to incoming/gateways/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-10-25";
const SOURCE_NAME = "gateways";

// --- Shared helpers (mirrors crawl-docparse.mjs) -----------------------------

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
// All entries are real, actively maintained LLM gateways, routers, or proxies — the
// provider-access control plane. Titles slugify disjoint from the existing
// infrastructure list (the only pre-existing gateway there is OmniRoute, deliberately
// excluded) and from each other.

const records = [
  {
    title: "LiteLLM",
    repo: "BerriAI/litellm",
    url: "https://github.com/BerriAI/litellm",
    description: "The de facto open-source LLM gateway: call 100+ providers (OpenAI, Anthropic, Bedrock, Vertex, Azure, local) through one OpenAI-compatible SDK and proxy server, with retries, fallbacks, load balancing, budgets, and spend tracking.",
    license: "MIT",
    tags: ["proxy", "openai-compatible", "fallback", "load-balancing"],
  },
  {
    title: "OpenRouter",
    repo: "",
    url: "https://openrouter.ai/docs",
    description: "A hosted unified API to 300+ models across dozens of providers behind one OpenAI-compatible endpoint, with automatic routing, provider fallback, price/latency selection, and a single bill — the drop-in gateway for multi-model apps.",
    license: "proprietary",
    tags: ["hosted", "openai-compatible", "routing", "multi-provider"],
  },
  {
    title: "Cloudflare AI Gateway",
    repo: "",
    url: "https://developers.cloudflare.com/ai-gateway/",
    description: "An edge AI gateway that proxies requests to any LLM provider, adding caching, rate limiting, retries, fallbacks, cost analytics, and request logging with a one-line base-URL change — observability and control without running infrastructure.",
    license: "proprietary",
    tags: ["hosted", "edge", "caching", "rate-limiting"],
  },
  {
    title: "Kong AI Gateway",
    repo: "Kong/kong",
    url: "https://docs.konghq.com/gateway/latest/ai-gateway/",
    description: "Kong's suite of AI plugins turns the mature API gateway into a multi-LLM proxy with provider routing, semantic caching, prompt guarding, rate limiting, and request/response transformation for production AI traffic.",
    license: "Apache-2.0",
    tags: ["gateway", "plugins", "semantic-cache", "routing"],
  },
  {
    title: "aisuite",
    repo: "andrewyng/aisuite",
    url: "https://github.com/andrewyng/aisuite",
    description: "A thin unified Python interface that lets you call OpenAI, Anthropic, Mistral, Google, AWS, and more by just changing a provider:model string — the simplest way to swap or compare models behind one OpenAI-style API.",
    license: "MIT",
    tags: ["library", "unified-api", "multi-provider", "python"],
  },
  {
    title: "RouteLLM",
    repo: "lm-sys/RouteLLM",
    url: "https://github.com/lm-sys/RouteLLM",
    description: "An LMSYS framework for serving and evaluating LLM routers that dynamically send each query to a strong or a cheap model based on predicted difficulty, cutting cost while preserving quality behind an OpenAI-compatible server.",
    license: "Apache-2.0",
    tags: ["router", "cost-optimization", "openai-compatible", "evaluation"],
  },
  {
    title: "Not Diamond",
    repo: "Not-Diamond/notdiamond-python",
    url: "https://github.com/Not-Diamond/notdiamond-python",
    description: "An AI model router that automatically picks the best-performing model for each prompt, learning per-query which provider wins on quality, cost, and latency so you route intelligently instead of hard-coding one model.",
    license: "unknown",
    tags: ["router", "model-selection", "cost-optimization", "quality"],
  },
  {
    title: "LangDB AI Gateway",
    repo: "langdb/ai-gateway",
    url: "https://github.com/langdb/ai-gateway",
    description: "An enterprise, open-source AI gateway written in Rust that exposes 250+ models through one OpenAI-compatible endpoint with routing, guardrails, cost controls, caching, and tracing — a high-performance control plane for LLM traffic.",
    license: "Apache-2.0",
    tags: ["gateway", "rust", "openai-compatible", "guardrails"],
  },
  {
    title: "Bifrost",
    repo: "maximhq/bifrost",
    url: "https://github.com/maximhq/bifrost",
    description: "A fast, open-source LLM gateway in Go from Maxim that fronts 1000+ models behind an OpenAI-compatible API with automatic fallbacks, load balancing, semantic caching, and low overhead — built for high-throughput production routing.",
    license: "Apache-2.0",
    tags: ["gateway", "go", "openai-compatible", "fallback"],
  },
  {
    title: "GPTRouter",
    repo: "Writesonic/GPTRouter",
    url: "https://github.com/Writesonic/GPTRouter",
    description: "An open-source router that smoothly orchestrates multiple LLMs and image models with streaming, automatic retries, and failover across providers, so a single call survives provider outages and rate limits in production.",
    license: "MIT",
    tags: ["router", "streaming", "failover", "multi-provider"],
  },
  {
    title: "OptiLLM",
    repo: "codelion/optillm",
    url: "https://github.com/codelion/optillm",
    description: "An OpenAI-compatible optimizing proxy that transparently applies inference-time techniques (chain-of-thought routing, best-of-n, mixture-of-agents, re-reading) to boost accuracy on reasoning and coding queries before they hit the model.",
    license: "Apache-2.0",
    tags: ["proxy", "openai-compatible", "inference-time", "reasoning"],
  },
  {
    title: "Arch Gateway",
    repo: "katanemo/archgw",
    url: "https://github.com/katanemo/archgw",
    description: "An AI-native proxy for agents built on Envoy that handles the low-level work of prompts — model routing, fast function/tool calling, guardrails, and observability — so application code stays focused on business logic.",
    license: "Apache-2.0",
    tags: ["gateway", "envoy", "agents", "function-calling"],
  },
  {
    title: "Envoy AI Gateway",
    repo: "envoyproxy/ai-gateway",
    url: "https://github.com/envoyproxy/ai-gateway",
    description: "An open-source control plane that extends Envoy Gateway to manage GenAI traffic — unified upstream auth, provider routing and fallback, token-based rate limiting, and usage metrics for self-hosted and API-based LLMs on Kubernetes.",
    license: "Apache-2.0",
    tags: ["gateway", "envoy", "kubernetes", "rate-limiting"],
  },
  {
    title: "TensorZero",
    repo: "tensorzero/tensorzero",
    url: "https://github.com/tensorzero/tensorzero",
    description: "An open-source gateway for industrial LLM applications in Rust that unifies provider access with built-in observability, experimentation (A/B and prompt variants), and a feedback loop that optimizes prompts and model choice over time.",
    license: "Apache-2.0",
    tags: ["gateway", "rust", "experimentation", "optimization"],
  },
  {
    title: "any-llm",
    repo: "mozilla-ai/any-llm",
    url: "https://github.com/mozilla-ai/any-llm",
    description: "A lightweight Mozilla AI library offering a single, consistent interface to many LLM providers by calling their official SDKs under the hood, so switching providers is a one-line change with no extra proxy to operate.",
    license: "Apache-2.0",
    tags: ["library", "unified-api", "multi-provider", "python"],
  },
  {
    title: "Semantic Router",
    repo: "aurelio-labs/semantic-router",
    url: "https://github.com/aurelio-labs/semantic-router",
    description: "A superfast decision layer that routes requests by the semantic meaning of the input using embeddings rather than slow LLM calls — pick the right model, tool, or prompt path deterministically at the front of a gateway.",
    license: "MIT",
    tags: ["router", "semantic", "embeddings", "decision-layer"],
  },
  {
    title: "LLM Gateway",
    repo: "theopenco/llmgateway",
    url: "https://github.com/theopenco/llmgateway",
    description: "An open-source, OpenAI-compatible gateway and dashboard that routes requests across providers with a unified API, usage analytics, cost tracking, and key management — self-host the control plane or use the hosted edition.",
    license: "unknown",
    tags: ["gateway", "openai-compatible", "dashboard", "analytics"],
  },
  {
    title: "Vercel AI Gateway",
    repo: "",
    url: "https://vercel.com/docs/ai-gateway",
    description: "A hosted gateway for the Vercel AI SDK that gives one endpoint across hundreds of models with automatic provider failover, load balancing, spend limits, and usage analytics — unified model access without managing provider keys.",
    license: "proprietary",
    tags: ["hosted", "failover", "ai-sdk", "analytics"],
  },
];

// --- Adapter ------------------------------------------------------------------

function gatewaysAdapter() {
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
          tags: ["gateway", "llm-router", "proxy", "routing", "multi-provider", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} at the model-access stage — once an agent has assembled its context, this is the control plane it calls to reach a model: one endpoint that routes across providers with fallback, caching, rate limiting, budgets, and cost/quality/latency-aware model selection, so application code is decoupled from any single provider.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's LLM-gateway / router / proxy list — the provider-access control plane that sits between the agent and the model, the last hop after parse/chunk, embed, store, and rerank. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-docparse.mjs) -------------------------------

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
    const adapter = gatewaysAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[gateways] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[gateways] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[gateways] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
