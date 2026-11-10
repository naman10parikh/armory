#!/usr/bin/env node
// Component LLM inference-serving / model-serving crawler. Curated list of the
// engines and runtimes that take model weights and SERVE them as a callable
// endpoint — the layer the whole A5-A23 stack ultimately calls to reach a model.
// The retrieval/orchestration arc built everything AROUND this layer (gateways
// route to it A13, frameworks orchestrate calls through it A14, prompt-opt tunes
// the input A23, structured output validates the result A17) but the catalog
// itself had only THREE inference engines in `infrastructure` — vLLM
// (vllm-project-vllm), SGLang (sgl-project-sglang), and llama.cpp
// (ggml-org-llama-cpp) — a tiny fraction of the real serving landscape. This fills
// the rest of it. Two tiers, all previously absent as first-class components:
//   1. serve   — raw high-throughput / low-latency inference engines focused on
//      batching, quantization, KV-cache and kernel speed (TGI, TensorRT-LLM,
//      LMDeploy, Aphrodite, KTransformers, mistral.rs, ExLlamaV2, PowerInfer,
//      CTranslate2, MLC-LLM).
//   2. platform — model-serving platforms / local runners that wrap an engine,
//      manage multiple models, and expose an OpenAI-compatible endpoint (Ollama,
//      LocalAI, llamafile, RamaLama, Xinference, OpenLLM, BentoML, Triton
//      Inference Server, Ray Serve, NVIDIA NIM).
// The call path this layer sits at:
//   prompt -> gateway (A13) -> INFERENCE ENGINE / SERVER (this) -> tokens -> agent.
// vLLM, SGLang, and llama.cpp are DELIBERATELY EXCLUDED to avoid a same-type
// (`infrastructure`) duplicate — they already live there; this crawler adds only
// the engines that were missing. Verified disjoint across all 12 categories AS
// `infrastructure`: these engines appear only as `skills` (inference-serving-vllm,
// inference-serving-tensorrt-llm), `clis-tools` (ollama-ollama), or `mcps` (MCP
// servers that WRAP one — nvidia-nim-mcp-server, triton mentions) — never as the
// serving engine itself in `infrastructure`; identity is type-scoped, so there is
// no clash, same precedent as A14 (google-adk / autogpt), A17 (instructor / lmql),
// A22 (open-webui / vercel-ai-sdk), A23 (textgrad / gepa). Chose `infrastructure`
// for an exact mirror of the vLLM / SGLang / llama.cpp entries already there (an
// installable serving runtime == substrate). Proprietary / non-standard licenses
// kept `license: unknown` rather than guessed (NVIDIA NIM; RamaLama). All emitted
// slugs verified disjoint vs brain/components/infrastructure and from each other.
//
// Run:
//   node ingest/crawl-inference.mjs           # dry-run
//   node ingest/crawl-inference.mjs --apply    # write to incoming/inference/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-11-10";
const SOURCE_NAME = "inference";

// --- Shared helpers (mirrors crawl-promptopt.mjs) ----------------------------

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
// Each record: { title, repo ("owner/repo"), url, description, license, tier,
// tags }. All entries are real, actively maintained LLM inference-serving engines
// or model-serving platforms. Titles slugify disjoint from the existing
// infrastructure list and from each other. Where a name also appears under
// another type (skills / clis-tools / mcps) it is type-scoped, so there is no
// clash in `infrastructure`. vLLM, SGLang, and llama.cpp are excluded (already in
// infrastructure).

const records = [
  // --- Tier 1: raw inference / serving engines ------------------------------
  {
    title: "Text Generation Inference",
    repo: "huggingface/text-generation-inference",
    url: "https://github.com/huggingface/text-generation-inference",
    description: "Hugging Face's production-grade LLM serving toolkit (TGI): a Rust/Python server with continuous batching, tensor parallelism, quantization, and token streaming behind an OpenAI-compatible HTTP endpoint, used to deploy open models at scale.",
    license: "Apache-2.0",
    tier: "serve",
    tags: ["serving-engine", "continuous-batching", "tensor-parallel", "streaming"],
  },
  {
    title: "TensorRT-LLM",
    repo: "NVIDIA/TensorRT-LLM",
    url: "https://github.com/NVIDIA/TensorRT-LLM",
    description: "NVIDIA's library for compiling and serving LLMs on NVIDIA GPUs: it builds optimized TensorRT engines with in-flight batching, paged KV-cache, and FP8/INT4 quantization to reach the lowest latency and highest throughput on NVIDIA hardware.",
    license: "Apache-2.0",
    tier: "serve",
    tags: ["serving-engine", "nvidia-gpu", "tensorrt", "quantization"],
  },
  {
    title: "LMDeploy",
    repo: "InternLM/lmdeploy",
    url: "https://github.com/InternLM/lmdeploy",
    description: "A toolkit for compressing, deploying, and serving LLMs from the InternLM team: its TurboMind engine adds persistent batching, blocked KV-cache, and weight-only quantization, exposing an OpenAI-compatible server for high-throughput inference.",
    license: "Apache-2.0",
    tier: "serve",
    tags: ["serving-engine", "turbomind", "quantization", "high-throughput"],
  },
  {
    title: "Aphrodite Engine",
    repo: "aphrodite-engine/aphrodite-engine",
    url: "https://github.com/aphrodite-engine/aphrodite-engine",
    description: "A large-scale LLM inference engine (the backend behind PygmalionAI) built on paged attention and continuous batching: it supports a wide range of quantization formats and samplers and serves many concurrent users from a single endpoint.",
    license: "AGPL-3.0",
    tier: "serve",
    tags: ["serving-engine", "paged-attention", "quantization", "samplers"],
  },
  {
    title: "KTransformers",
    repo: "kvcache-ai/ktransformers",
    url: "https://github.com/kvcache-ai/ktransformers",
    description: "A flexible framework for optimized transformer inference that offloads experts and layers across GPU and CPU: it makes running very large mixture-of-experts models (such as DeepSeek) feasible on limited GPU memory via kernel and placement tricks.",
    license: "Apache-2.0",
    tier: "serve",
    tags: ["serving-engine", "cpu-gpu-offload", "moe", "local"],
  },
  {
    title: "mistral.rs",
    repo: "EricLBuehler/mistral.rs",
    url: "https://github.com/EricLBuehler/mistral.rs",
    description: "A fast, cross-platform LLM inference engine written in Rust: it runs text, vision, and speech models with quantization, device mapping across CPU/GPU, and an OpenAI-compatible server plus Python and Rust APIs for embedding inference in apps.",
    license: "MIT",
    tier: "serve",
    tags: ["serving-engine", "rust", "quantization", "multimodal"],
  },
  {
    title: "ExLlamaV2",
    repo: "turboderp-org/exllamav2",
    url: "https://github.com/turboderp-org/exllamav2",
    description: "A fast inference library for running local LLMs on consumer GPUs: its EXL2 quantization format and optimized CUDA kernels maximize tokens-per-second and fit larger models into limited VRAM, widely used by local-model serving front-ends.",
    license: "MIT",
    tier: "serve",
    tags: ["serving-engine", "consumer-gpu", "exl2", "quantization"],
  },
  {
    title: "PowerInfer",
    repo: "SJTU-IPADS/PowerInfer",
    url: "https://github.com/SJTU-IPADS/PowerInfer",
    description: "A high-speed LLM inference engine for consumer GPUs that exploits activation locality: it keeps hot neurons on the GPU and cold neurons on the CPU, delivering large speedups for local single-GPU serving versus naive CPU/GPU offloading.",
    license: "MIT",
    tier: "serve",
    tags: ["serving-engine", "activation-locality", "cpu-gpu-hybrid", "local"],
  },
  {
    title: "CTranslate2",
    repo: "OpenNMT/CTranslate2",
    url: "https://github.com/OpenNMT/CTranslate2",
    description: "A C++/Python library for fast inference of transformer models: it applies weight quantization, layer fusion, and batch reordering for efficient CPU and GPU execution, and is the engine powering faster-whisper and many production translation stacks.",
    license: "MIT",
    tier: "serve",
    tags: ["serving-engine", "cpp", "quantization", "cpu-gpu"],
  },
  {
    title: "MLC-LLM",
    repo: "mlc-ai/mlc-llm",
    url: "https://github.com/mlc-ai/mlc-llm",
    description: "A machine-learning compiler and deployment engine that compiles LLMs to run natively on any hardware backend — browser (WebGPU), iOS, Android, and desktop GPUs — via Apache TVM, bringing universal on-device LLM inference with a unified runtime.",
    license: "Apache-2.0",
    tier: "serve",
    tags: ["serving-engine", "compiler", "on-device", "webgpu"],
  },

  // --- Tier 2: model-serving platforms / local runners ----------------------
  {
    title: "Ollama",
    repo: "ollama/ollama",
    url: "https://github.com/ollama/ollama",
    description: "A tool to run open LLMs locally with one command: it packages models with a Modelfile, manages downloads and GPU/CPU placement over a llama.cpp backend, and exposes a local REST and OpenAI-compatible API, making it the default local-model runner.",
    license: "MIT",
    tier: "platform",
    tags: ["model-runner", "local", "openai-compatible", "gguf"],
  },
  {
    title: "LocalAI",
    repo: "mudler/LocalAI",
    url: "https://github.com/mudler/LocalAI",
    description: "A self-hosted, OpenAI-compatible inference server that is a drop-in replacement for the OpenAI API: it runs LLMs, embeddings, image, and audio models across multiple backends on consumer hardware with no GPU required and no data leaving the host.",
    license: "MIT",
    tier: "platform",
    tags: ["model-server", "openai-compatible", "self-hosted", "multimodal"],
  },
  {
    title: "llamafile",
    repo: "Mozilla-Ocho/llamafile",
    url: "https://github.com/Mozilla-Ocho/llamafile",
    description: "A Mozilla project that packages an LLM and its runtime into a single executable file that runs on macOS, Linux, and Windows with no install: built on llama.cpp and Cosmopolitan Libc, it makes distributing and running a local model a one-file affair.",
    license: "Apache-2.0",
    tier: "platform",
    tags: ["model-runner", "single-file", "cross-platform", "local"],
  },
  {
    title: "RamaLama",
    repo: "containers/ramalama",
    url: "https://github.com/containers/ramalama",
    description: "A tool that makes serving AI models boring by running them in OCI containers: it pulls a model, picks a container runtime (Podman/Docker) with the right GPU support, and serves an OpenAI-compatible endpoint, treating models like container images.",
    license: "unknown",
    tier: "platform",
    tags: ["model-server", "containers", "oci", "openai-compatible"],
  },
  {
    title: "Xinference",
    repo: "xorbitsai/inference",
    url: "https://github.com/xorbitsai/inference",
    description: "Xorbits Inference: a framework for serving LLMs, embedding models, rerankers, and multimodal models with one command, offering a built-in model registry, distributed workers, and OpenAI-compatible APIs to manage many models behind one endpoint.",
    license: "Apache-2.0",
    tier: "platform",
    tags: ["model-server", "multi-model", "distributed", "openai-compatible"],
  },
  {
    title: "OpenLLM",
    repo: "bentoml/OpenLLM",
    url: "https://github.com/bentoml/OpenLLM",
    description: "A tool from the BentoML team to run any open LLM as an OpenAI-compatible API with one command: it manages model backends (vLLM, etc.), serves a chat UI, and packages the deployment as a Bento for shipping self-hosted inference to production.",
    license: "Apache-2.0",
    tier: "platform",
    tags: ["model-server", "openai-compatible", "self-hosted", "bentoml"],
  },
  {
    title: "BentoML",
    repo: "bentoml/BentoML",
    url: "https://github.com/bentoml/BentoML",
    description: "A Python framework for building and serving AI model inference APIs: it packages models and business logic into a Bento, adds adaptive batching, multi-model composition, and autoscaling, and deploys the same artifact to containers or the cloud.",
    license: "Apache-2.0",
    tier: "platform",
    tags: ["model-serving-framework", "python", "adaptive-batching", "packaging"],
  },
  {
    title: "Triton Inference Server",
    repo: "triton-inference-server/server",
    url: "https://github.com/triton-inference-server/server",
    description: "NVIDIA's open inference-serving platform for any framework (TensorRT, PyTorch, ONNX, vLLM, Python): it provides dynamic batching, concurrent model execution, model ensembles, and HTTP/gRPC endpoints with metrics, used to serve mixed model fleets.",
    license: "BSD-3-Clause",
    tier: "platform",
    tags: ["inference-server", "multi-framework", "dynamic-batching", "grpc"],
  },
  {
    title: "Ray Serve",
    repo: "ray-project/ray",
    url: "https://github.com/ray-project/ray",
    description: "The scalable model-serving library within Ray: it composes multiple models and business logic into deployment graphs, autoscales replicas across a cluster, and (via ray.serve.llm) serves LLMs with an OpenAI-compatible API on top of engines like vLLM.",
    license: "Apache-2.0",
    tier: "platform",
    tags: ["model-serving", "distributed", "autoscaling", "deployment-graphs"],
  },
  {
    title: "NVIDIA NIM",
    repo: "",
    url: "https://developer.nvidia.com/nim",
    description: "NVIDIA Inference Microservices: prebuilt, GPU-optimized containers that serve popular foundation models behind standard OpenAI-compatible APIs, bundling an optimized engine (TensorRT-LLM/vLLM) and runtime so a model deploys as a single microservice.",
    license: "unknown",
    tier: "platform",
    tags: ["inference-microservice", "containers", "nvidia-gpu", "openai-compatible"],
  },
];

// Human-readable description of each tier for the stub body.
const TIER_BLURB = {
  serve: "a raw inference / serving engine — it takes model weights and generates tokens as fast as the hardware allows, applying batching, KV-cache, quantization, and optimized kernels to maximize throughput and minimize latency",
  platform: "a model-serving platform / local runner — it wraps an inference engine, manages one or more models, and exposes a (usually OpenAI-compatible) endpoint so you can pull a model and serve it with a single command",
};

// --- Adapter ------------------------------------------------------------------

function inferenceAdapter() {
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
      const tierBlurb = TIER_BLURB[item.tier] || "an LLM inference-serving infrastructure component";

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
          tags: ["inference", "model-serving", "substrate", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when you need to run a model's weights behind a callable endpoint rather than call a hosted API: it is ${tierBlurb}. It sits at the model end of the call path — prompt -> gateway -> inference engine/server (this) -> tokens -> agent — the layer the gateways route to and the frameworks ultimately invoke.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's LLM inference-serving / model-serving infrastructure list — the engines and runtimes that serve model weights as tokens, complementing the vLLM / SGLang / llama.cpp entries already in the catalog. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-promptopt.mjs) ------------------------------

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
    const adapter = inferenceAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[inference] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[inference] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[inference] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
