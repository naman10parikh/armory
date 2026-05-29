#!/usr/bin/env node
// Component evals adapter. Curated list of canonical LLM/agent evaluation
// frameworks. No network calls — records are embedded in the source.
//
// Run:
//   node ingest/crawl-evals.mjs           # dry-run (prints stubs, no writes)
//   node ingest/crawl-evals.mjs --apply   # write to incoming/evals-tools/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-05-27";

// --- Helpers (mirrors crawl-smithery.mjs) ------------------------------------

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

function oneLine(s) { return String(s || "").replace(/\s+/g, " ").trim(); }

function scrub(s) {
  return oneLine(s)
    .replace(/\/Users\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/home\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/root(\/[^\s]*)?/g, "<path>");
}

// --- Curated records ---------------------------------------------------------
// Fields: title, repo ("owner/repo"), url, license, description, tags (extra)

const records = [
  {
    title: "promptfoo",
    repo: "promptfoo/promptfoo",
    url: "https://github.com/promptfoo/promptfoo",
    license: "MIT",
    description: "CLI and library for testing, comparing, and red-teaming LLM prompts and agents with assertions and CI integration.",
    tags: ["red-teaming", "ci", "cli"],
  },
  {
    title: "openai/evals",
    repo: "openai/evals",
    url: "https://github.com/openai/evals",
    license: "MIT",
    description: "OpenAI's official framework for evaluating LLMs and LLM-powered systems, with a registry of community eval sets.",
    tags: ["registry", "benchmark"],
  },
  {
    title: "lm-evaluation-harness",
    repo: "EleutherAI/lm-evaluation-harness",
    url: "https://github.com/EleutherAI/lm-evaluation-harness",
    license: "MIT",
    description: "EleutherAI's unified framework for evaluating language models on hundreds of academic benchmarks.",
    tags: ["academic", "benchmark", "harness"],
  },
  {
    title: "deepeval",
    repo: "confident-ai/deepeval",
    url: "https://github.com/confident-ai/deepeval",
    license: "Apache-2.0",
    description: "Open-source LLM evaluation framework with 14+ metrics (hallucination, faithfulness, answer relevancy) and CI support.",
    tags: ["metrics", "rag", "ci"],
  },
  {
    title: "ragas",
    repo: "explodinggradients/ragas",
    url: "https://github.com/explodinggradients/ragas",
    license: "Apache-2.0",
    description: "Reference-free evaluation of retrieval-augmented generation pipelines; measures faithfulness, answer relevance, and context precision.",
    tags: ["rag", "metrics"],
  },
  {
    title: "trulens",
    repo: "truera/trulens",
    url: "https://github.com/truera/trulens",
    license: "MIT",
    description: "Evaluation and tracking for LLM and RAG applications with a feedback-function API and experiment dashboard.",
    tags: ["rag", "tracking", "dashboard"],
  },
  {
    title: "inspect-ai",
    repo: "UKGovernmentBEIS/inspect_ai",
    url: "https://github.com/UKGovernmentBEIS/inspect_ai",
    license: "MIT",
    description: "UK AISI's framework for safety evaluations of large language models, with task-based scaffolding and solver pipelines.",
    tags: ["safety", "aisi", "government"],
  },
  {
    title: "braintrust",
    repo: "braintrustdata/braintrust-sdk",
    url: "https://github.com/braintrustdata/braintrust-sdk",
    license: "Apache-2.0",
    description: "Developer platform for logging, evaluating, and comparing LLM experiments with dataset versioning and scoring functions.",
    tags: ["experiment-tracking", "sdk"],
  },
  {
    title: "opik",
    repo: "comet-ml/opik",
    url: "https://github.com/comet-ml/opik",
    license: "Apache-2.0",
    description: "Open-source LLM evaluation and observability platform from Comet ML for tracing, scoring, and dataset management.",
    tags: ["observability", "tracing", "dataset"],
  },
  {
    title: "langsmith-evals",
    repo: "langchain-ai/langsmith-sdk",
    url: "https://github.com/langchain-ai/langsmith-sdk",
    license: "MIT",
    description: "LangSmith SDK evaluation layer: run datasets, custom evaluators, and regression tests for LangChain and custom LLM pipelines.",
    tags: ["langchain", "dataset", "regression"],
  },
  {
    title: "phoenix",
    repo: "Arize-AI/phoenix",
    url: "https://github.com/Arize-AI/phoenix",
    license: "Elastic-2.0",
    description: "Arize Phoenix: open-source LLM observability with built-in evals, span tracing, and dataset curation for RAG and agents.",
    tags: ["observability", "rag", "agents"],
  },
  {
    title: "patronus-ai",
    repo: "patronus-ai/patronus",
    url: "https://github.com/patronus-ai/patronus",
    license: "Apache-2.0",
    description: "Automated LLM evaluation and hallucination detection platform with a Python SDK and judge-model scoring.",
    tags: ["hallucination", "judge", "sdk"],
  },
  {
    title: "helm",
    repo: "stanford-crfm/helm",
    url: "https://github.com/stanford-crfm/helm",
    license: "Apache-2.0",
    description: "Stanford CRFM Holistic Evaluation of Language Models: standardized benchmark suite covering accuracy, calibration, robustness, and fairness.",
    tags: ["benchmark", "academic", "stanford"],
  },
  {
    title: "big-bench",
    repo: "google/BIG-bench",
    url: "https://github.com/google/BIG-bench",
    license: "Apache-2.0",
    description: "Google's Beyond the Imitation Game benchmark: 200+ diverse tasks designed to probe capabilities beyond standard NLP benchmarks.",
    tags: ["benchmark", "google", "academic"],
  },
  {
    title: "lighteval",
    repo: "huggingface/lighteval",
    url: "https://github.com/huggingface/lighteval",
    license: "MIT",
    description: "Hugging Face lightweight evaluation library for LLMs across academic benchmarks, with fast local and remote inference support.",
    tags: ["huggingface", "benchmark", "lightweight"],
  },
  {
    title: "evalplus",
    repo: "evalplus/evalplus",
    url: "https://github.com/evalplus/evalplus",
    license: "Apache-2.0",
    description: "Rigorous code generation evaluation framework built on top of HumanEval and MBPP with 80x more test cases.",
    tags: ["code-generation", "humaneval", "benchmark"],
  },
  {
    title: "mlflow-evaluate",
    repo: "mlflow/mlflow",
    url: "https://github.com/mlflow/mlflow",
    license: "Apache-2.0",
    description: "MLflow's built-in LLM evaluation module for scoring text generation, question answering, and retrieval tasks with custom metrics.",
    tags: ["mlflow", "metrics", "experiment-tracking"],
  },
  {
    title: "galileo-evaluate",
    repo: "rungalileo/galileo-python",
    url: "https://github.com/rungalileo/galileo-python",
    license: "Apache-2.0",
    description: "Galileo evaluation and observability SDK for detecting hallucinations, data errors, and model weaknesses in LLM pipelines.",
    tags: ["hallucination", "observability", "sdk"],
  },
  {
    title: "honeyhive",
    repo: "honeyhiveai/honeyhive",
    url: "https://github.com/honeyhiveai/honeyhive",
    license: "Apache-2.0",
    description: "LLM evaluation and experimentation platform with session tracing, dataset management, and metric-based run comparison.",
    tags: ["experiment-tracking", "tracing", "dataset"],
  },
  {
    title: "langfuse-evals",
    repo: "langfuse/langfuse",
    url: "https://github.com/langfuse/langfuse",
    license: "MIT",
    description: "Open-source LLM engineering platform with built-in evals, prompt management, and production tracing for iterative improvement.",
    tags: ["observability", "tracing", "prompt-management"],
  },
  {
    title: "giskard",
    repo: "Giskard-AI/giskard",
    url: "https://github.com/Giskard-AI/giskard",
    license: "Apache-2.0",
    description: "Open-source LLM testing framework for detecting vulnerabilities (prompt injection, hallucinations, bias) via automated scan.",
    tags: ["safety", "vulnerability", "scan"],
  },
  {
    title: "agenta",
    repo: "agenta-ai/agenta",
    url: "https://github.com/agenta-ai/agenta",
    license: "MIT",
    description: "Open-source LLM developer platform with prompt playground, evaluation pipelines, and A/B testing for iterating on LLM apps.",
    tags: ["playground", "ab-testing", "ci"],
  },
  {
    title: "humanloop-evals",
    repo: "humanloop/humanloop-python",
    url: "https://github.com/humanloop/humanloop-python",
    license: "MIT",
    description: "Humanloop Python SDK with integrated evals, dataset versioning, and human + LLM judge scoring for production pipelines.",
    tags: ["human-eval", "dataset", "sdk"],
  },
  {
    title: "langtrace",
    repo: "Scale3-Labs/langtrace",
    url: "https://github.com/Scale3-Labs/langtrace",
    license: "AGPL-3.0",
    description: "Open-source observability tool for LLMs with OpenTelemetry-based tracing, automated evals, and annotation workflows.",
    tags: ["observability", "opentelemetry", "tracing"],
  },
  {
    title: "wandb-weave-evals",
    repo: "wandb/weave",
    url: "https://github.com/wandb/weave",
    license: "Apache-2.0",
    description: "Weights & Biases Weave evaluation framework for tracking LLM experiments, scoring model outputs, and comparing runs.",
    tags: ["wandb", "experiment-tracking", "scoring"],
  },
  {
    title: "openai-simple-evals",
    repo: "openai/simple-evals",
    url: "https://github.com/openai/simple-evals",
    license: "MIT",
    description: "OpenAI's lightweight benchmark suite (MMLU, HumanEval, MATH, GPQA, MGSM) for fast model capability comparisons.",
    tags: ["benchmark", "mmlu", "simple"],
  },
  {
    title: "metr-task-standard",
    repo: "METR/task-standard",
    url: "https://github.com/METR/task-standard",
    license: "MIT",
    description: "METR's Task Standard: a specification and scaffold for creating agentic tasks used in autonomous agent capability evaluations.",
    tags: ["agents", "task-standard", "safety"],
  },
  {
    title: "swe-bench",
    repo: "princeton-nlp/SWE-bench",
    url: "https://github.com/princeton-nlp/SWE-bench",
    license: "MIT",
    description: "SWE-bench: benchmark for evaluating LLMs on real-world GitHub issue resolution across 12 popular Python repositories.",
    tags: ["code", "benchmark", "agents"],
  },
  {
    title: "gaia-benchmark",
    repo: "gaia-benchmark/GAIA",
    url: "https://github.com/gaia-benchmark/GAIA",
    license: "MIT",
    description: "GAIA: benchmark of 466 real-world questions requiring multi-step reasoning, web browsing, and tool use for general AI assistants.",
    tags: ["benchmark", "agents", "tool-use"],
  },
  {
    title: "tau-bench",
    repo: "sierra-research/tau-bench",
    url: "https://github.com/sierra-research/tau-bench",
    license: "Apache-2.0",
    description: "Tau-bench: agent benchmark for tool-agent-user interactions in retail and airline domains with policy-grounded evaluation.",
    tags: ["agents", "tool-use", "benchmark"],
  },
  {
    title: "agentbench",
    repo: "THUDM/AgentBench",
    url: "https://github.com/THUDM/AgentBench",
    license: "Apache-2.0",
    description: "AgentBench: multi-environment benchmark for evaluating LLM agents across OS, DB, web browsing, and game-like tasks.",
    tags: ["agents", "benchmark", "multi-environment"],
  },
  {
    title: "webarena",
    repo: "web-arena-x/webarena",
    url: "https://github.com/web-arena-x/webarena",
    license: "Apache-2.0",
    description: "WebArena: realistic web-based environment for evaluating autonomous agents on long-horizon browser interaction tasks.",
    tags: ["agents", "browser", "benchmark"],
  },
  {
    title: "vellum-evals",
    repo: "vellum-ai/vellum-client-python",
    url: "https://github.com/vellum-ai/vellum-client-python",
    license: "MIT",
    description: "Vellum evaluation SDK for running LLM test suites with custom metrics, dataset pinning, and CI workflow integration.",
    tags: ["sdk", "ci", "dataset"],
  },
  {
    title: "continuous-eval",
    repo: "relari-ai/continuous-eval",
    url: "https://github.com/relari-ai/continuous-eval",
    license: "Apache-2.0",
    description: "Relari's modular evaluation library for LLM pipelines with deterministic + LLM-based metrics for RAG and agent workflows.",
    tags: ["rag", "agents", "metrics"],
  },
  {
    title: "evals-cookbooks",
    repo: "openai/evals",
    url: "https://cookbook.openai.com/examples/evaluation/how_to_eval_abstractive_summarization",
    license: "MIT",
    description: "OpenAI Cookbook eval recipes: task-specific templates for summarization, QA, and classification evaluation using the Evals framework.",
    tags: ["cookbook", "templates", "openai"],
  },
];

// --- Adapter -----------------------------------------------------------------

function evalsAdapter() {
  const adapterName = "evals-tools";
  const type = "evals";
  const seen = new Set();

  return {
    name: adapterName,
    type,

    async fetch() { return records; },

    toComponent(raw) {
      const base = slugify(raw.title);
      const uname = uniqueName(base, seen);
      const desc = scrub(raw.description).slice(0, 300);
      const extraTags = Array.isArray(raw.tags) ? raw.tags : [];

      return {
        frontmatter: {
          name: uname,
          type,
          description: desc,
          source_repo: raw.repo ?? "",
          source_url: raw.url ?? "",
          license: raw.license ?? "unknown",
          cli_compat: ["claude", "cursor", "codex", "opencode", "gemini"],
          maturity: "beta",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: ["evals", ...extraTags],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\n${desc}\n\n` +
          `## How to install / invoke\nSee the source repo README: https://github.com/${raw.repo ?? ""}\n\n` +
          `## Notes\nCurated evals entry. Verified ${VERIFIED_AT}. Pending verify -> promote.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-smithery.mjs) ------------------------------

async function runCollection(adapter, { dryRun = true, outDir = INCOMING, log = console.log } = {}) {
  const items = await adapter.fetch();
  const dir = join(outDir, adapter.name);
  if (!dryRun) resetDir(dir);
  const written = [];
  for (const item of items) {
    const { frontmatter, body } = adapter.toComponent(item);
    const file = join(dir, `${frontmatter.name}.md`);
    const md = toMarkdown({ frontmatter, body });
    // Self-validate every stub via parseFrontmatter (mirrors crawl-smithery.mjs).
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
    const adapter = evalsAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[evals] No stubs produced.");
      process.exit(1);
    }
    // Print 3 sample slugs.
    const samples = written.slice(0, 3).map((w) => w.frontmatter.name).join(", ");
    console.log(`[evals] sample slugs: ${samples}`);
  } catch (err) {
    console.error(`[evals] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
