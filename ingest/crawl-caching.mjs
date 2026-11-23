#!/usr/bin/env node
// Component LLM-caching crawler. Curated list of the CACHE layer of the serving
// stack — the tools that remember a prior computation so the model does not redo
// it: SEMANTIC RESPONSE caches that return a stored completion when a new prompt is
// close enough by embedding similarity, and KV-CACHE / prefix-cache offloading
// stores that keep attention key/value blocks across requests so repeated prefixes
// (system prompts, few-shot prefaces, RAG context, multi-turn history) skip prefill.
//
// This is a genuinely absent, clean, named stack layer — zero prior coverage across
// all 12 categories (verified: no cache entry in `infrastructure`; gptcache/lmcache
// appear nowhere except one unrelated MCP). It sits BETWEEN the gateway layer
// (crawl-gateways, A13 — which ROUTES the call) and the inference layer
// (crawl-inference, A24 — which SERVES the tokens):
//   prompt -> gateway (A13) -> CACHE (this) -> inference engine (A24) -> tokens.
//
// It is DISTINCT from the inference engines of A24: those run the forward pass; a
// cache tool here either returns a stored answer (no model call at all) or feeds the
// engine a warm KV block so it can skip recomputation. Gateways (A13, e.g. LiteLLM)
// bundle a basic cache, and observability platforms (Langfuse/Helicone/Portkey)
// track or proxy-cache calls — none are catalogued here; this list is the dedicated
// caching tool as a first-class component, which was missing.
//
// Emits one component stub per entry into incoming/caching/ with type
// `infrastructure` (the same home as the inference engines and gateways it sits
// beside; an installable cache runtime/library == substrate). `infrastructure` is an
// under-represented category, so this is a high-novelty Performance-Novelty fill.
//
// Run:
//   node ingest/crawl-caching.mjs           # dry-run
//   node ingest/crawl-caching.mjs --apply   # write to incoming/caching/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-11-23";
const SOURCE_NAME = "caching";

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
// All entries are real caching tools dedicated to LLM serving. Two tiers:
//   (1) SEMANTIC RESPONSE cache — store a completion keyed by prompt embedding and
//       return it when a new prompt is similar enough (no model call).
//   (2) KV-CACHE / prefix-cache offloading — persist attention KV blocks across
//       requests so repeated prefixes skip prefill on the serving engine.
// Titles are chosen so slugs stay disjoint from the existing infrastructure list
// (sandboxes, compute, browsers, deploy, 3 inference engines) and from each other.
// Redis appears twice on purpose: RedisVL SemanticCache (self-host library) and
// Redis LangCache (managed service) are two distinct offerings — same two-products-
// one-org precedent as Distilabel/Argilla (A18) and BentoML/OpenLLM (A24).

const records = [
  // --- Semantic response caching -------------------------------------------
  {
    title: "GPTCache",
    repo: "zilliztech/GPTCache",
    url: "https://github.com/zilliztech/GPTCache",
    description: "The reference semantic cache for LLM apps: embeds each prompt, looks it up in a vector store, and returns a stored completion on a similarity hit so repeated or near-duplicate questions skip the model call, cutting latency and API spend. Pluggable embedders, vector backends, and eviction.",
    license: "MIT",
    tags: ["semantic-cache", "response-cache", "similarity", "self-host"],
  },
  {
    title: "CodeFuse-ModelCache",
    repo: "codefuse-ai/CodeFuse-ModelCache",
    url: "https://github.com/codefuse-ai/CodeFuse-ModelCache",
    description: "Ant Group's semantic cache for large-model serving: a GPTCache-style pipeline hardened for production with multi-backend embedding and vector storage, data isolation, and failover, returning a cached answer when an incoming request is semantically close to a prior one.",
    license: "Apache-2.0",
    tags: ["semantic-cache", "response-cache", "production", "self-host"],
  },
  {
    title: "vCache",
    repo: "vcache-project/vCache",
    url: "https://github.com/vcache-project/vCache",
    description: "A reliable semantic prompt cache from UC Berkeley that learns a per-embedding similarity threshold with a statistical error bound, so hits respect a target maximum error rate instead of a single hand-tuned cutoff — safer semantic caching that avoids returning a wrong stored answer.",
    license: "Apache-2.0",
    tags: ["semantic-cache", "response-cache", "error-bounded", "research"],
  },
  {
    title: "Upstash Semantic Cache",
    repo: "upstash/semantic-cache",
    url: "https://github.com/upstash/semantic-cache",
    description: "A lightweight TypeScript semantic cache built on Upstash Vector: set and get completions keyed by meaning with a configurable similarity threshold, giving serverless and edge LLM apps a drop-in response cache without running your own vector store.",
    license: "MIT",
    tags: ["semantic-cache", "response-cache", "typescript", "serverless"],
  },
  {
    title: "RedisVL Semantic Cache",
    repo: "redis/redis-vl-python",
    url: "https://github.com/redis/redis-vl-python",
    description: "The SemanticCache in the Redis Vector Library: stores prompt/response pairs with their embeddings in Redis and serves a cached answer on a vector-similarity hit above a distance threshold, with TTLs and metadata filtering, for self-hosted LLM response caching on Redis.",
    license: "MIT",
    tags: ["semantic-cache", "response-cache", "redis", "self-host"],
  },
  {
    title: "Redis LangCache",
    repo: "",
    url: "https://redis.io/langcache/",
    description: "Redis's fully managed semantic caching service for LLM and agent apps: a hosted API that embeds, stores, and retrieves prompt/response pairs by meaning so repeated queries return instantly without a model call, with configurable similarity and automatic eviction — no vector infrastructure to run.",
    license: "proprietary",
    tags: ["semantic-cache", "response-cache", "managed", "redis"],
  },
  {
    title: "Momento Cache",
    repo: "",
    url: "https://www.gomomento.com/",
    description: "A serverless cache (from ex-AWS ElastiCache engineers) used as the response/semantic cache layer for LLM apps: a pay-per-use API with SDKs that stores and serves model completions so repeated prompts skip the call, with no cluster to size, patch, or scale.",
    license: "proprietary",
    tags: ["response-cache", "serverless", "managed", "sdk"],
  },
  // --- KV-cache / prefix-cache offloading -----------------------------------
  {
    title: "LMCache",
    repo: "LMCache/LMCache",
    url: "https://github.com/LMCache/LMCache",
    description: "A KV-cache layer for LLM serving engines that stores and reuses the attention key/value blocks of any repeated text — not just a shared prefix — across GPU, CPU, and disk, so recurring system prompts, few-shot prefaces, and RAG context skip prefill. Integrates with vLLM to speed up long-context and multi-turn workloads.",
    license: "Apache-2.0",
    tags: ["kv-cache", "prefix-cache", "offload", "self-host"],
  },
  {
    title: "Mooncake",
    repo: "kvcache-ai/Mooncake",
    url: "https://github.com/kvcache-ai/Mooncake",
    description: "The KVCache-centric disaggregated serving store behind Moonshot AI's Kimi: a distributed KV-cache pool over CPU/DRAM/SSD/RDMA that decouples prefill from decode and shares cached KV blocks across nodes, raising throughput for long-context, high-concurrency inference.",
    license: "Apache-2.0",
    tags: ["kv-cache", "disaggregated", "distributed-store", "self-host"],
  },
  {
    title: "AIBrix",
    repo: "vllm-project/aibrix",
    url: "https://github.com/vllm-project/aibrix",
    description: "A cloud-native control plane for running vLLM at scale whose headline feature is a distributed KV-cache pool: offloaded, cross-engine KV reuse plus KV-cache-aware routing, LoRA management, and autoscaling, so cached prefixes are shared across a fleet of inference replicas.",
    license: "Apache-2.0",
    tags: ["kv-cache", "cache-aware-routing", "kubernetes", "self-host"],
  },
  {
    title: "NVIDIA Dynamo",
    repo: "ai-dynamo/dynamo",
    url: "https://github.com/ai-dynamo/dynamo",
    description: "NVIDIA's datacenter inference framework built around a KV-cache block manager (KVBM) and KV-cache-aware smart routing: it routes each request to the worker already holding the matching cached blocks and offloads KV across memory tiers, maximizing cache reuse in disaggregated prefill/decode serving.",
    license: "Apache-2.0",
    tags: ["kv-cache", "cache-aware-routing", "disaggregated", "self-host"],
  },
  {
    title: "llm-d",
    repo: "llm-d/llm-d",
    url: "https://github.com/llm-d/llm-d",
    description: "A Kubernetes-native distributed inference stack (Red Hat, Google, IBM) whose scheduler does KV-cache-aware routing — sending a request to the replica whose cache already holds its prefix — on top of LMCache-backed offloading and disaggregated serving, so prefix reuse scales across the cluster.",
    license: "Apache-2.0",
    tags: ["kv-cache", "cache-aware-routing", "kubernetes", "self-host"],
  },
];

// --- Adapter ------------------------------------------------------------------

function cachingAdapter() {
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
          maturity: "experimental",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: ["caching", "llm-cache", "infrastructure", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} as the cache layer of an LLM/agent serving stack — the stage that remembers a prior computation so the model does not redo it. A semantic cache returns a stored completion when a new prompt is close enough to an old one (no model call at all); a KV-cache store keeps attention key/value blocks so repeated system prompts, few-shot prefaces, RAG context, and multi-turn history skip prefill. Either way it cuts latency, GPU work, and token/API spend on repeated or long-context traffic.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's LLM-caching list — the dedicated cache layer that sits between the gateway (which routes the call) and the inference engine (which serves the tokens), distinct from both. Verified ${VERIFIED_AT}.`,
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
    const adapter = cachingAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[caching] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[caching] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[caching] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
