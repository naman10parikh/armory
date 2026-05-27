#!/usr/bin/env node
// Engram observability-tools crawler. Curated list of canonical LLM/agent
// observability, tracing, and monitoring tools. Emits one engram stub per
// tool into incoming/observability-tools/.
//
// Run:
//   node ingest/crawl-observability.mjs           # dry-run
//   node ingest/crawl-observability.mjs --apply   # write to incoming/observability-tools/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-05-27";
const SOURCE_NAME = "observability-tools";

// --- Shared helpers ----------------------------------------------------------

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
// Each record: { title, repo, url, description, license, tags }

const records = [
  {
    title: "OpenTelemetry GenAI",
    repo: "open-telemetry/opentelemetry-collector-contrib",
    url: "https://github.com/open-telemetry/opentelemetry-collector-contrib",
    description: "OpenTelemetry semantic conventions and instrumentation for GenAI/LLM spans, traces, and metrics via the GenAI semconv working group.",
    license: "Apache-2.0",
    tags: ["opentelemetry", "tracing"],
  },
  {
    title: "OpenLLMetry",
    repo: "traceloop/openllmetry",
    url: "https://github.com/traceloop/openllmetry",
    description: "OpenTelemetry-based observability for LLM applications — auto-instruments OpenAI, Anthropic, LangChain, and 20+ providers with zero code changes.",
    license: "Apache-2.0",
    tags: ["opentelemetry", "tracing"],
  },
  {
    title: "Langfuse",
    repo: "langfuse/langfuse",
    url: "https://github.com/langfuse/langfuse",
    description: "Open-source LLM engineering platform with traces, evals, prompt management, and datasets for debugging and improving LLM applications.",
    license: "MIT",
    tags: ["tracing", "evals"],
  },
  {
    title: "Helicone",
    repo: "Helicone/helicone",
    url: "https://github.com/Helicone/helicone",
    description: "Open-source LLM observability platform — proxy-based logging, cost tracking, caching, and rate limiting for OpenAI-compatible APIs.",
    license: "Apache-2.0",
    tags: ["proxy", "logging"],
  },
  {
    title: "Arize Phoenix",
    repo: "Arize-ai/phoenix",
    url: "https://github.com/Arize-ai/phoenix",
    description: "Open-source AI observability and evaluation platform for LLM traces, spans, and performance analysis with a local-first UI.",
    license: "Elastic-2.0",
    tags: ["tracing", "evals"],
  },
  {
    title: "LangSmith",
    repo: "langchain-ai/langsmith-sdk",
    url: "https://github.com/langchain-ai/langsmith-sdk",
    description: "LangChain's platform for tracing, evaluating, and monitoring LLM applications — deep integration with LangChain/LangGraph plus a REST API for any stack.",
    license: "MIT",
    tags: ["tracing", "evals"],
  },
  {
    title: "Weights & Biases Weave",
    repo: "wandb/weave",
    url: "https://github.com/wandb/weave",
    description: "W&B Weave provides lightweight LLM tracing, evaluation, and dataset management with first-class support for OpenAI, Anthropic, and LangChain.",
    license: "Apache-2.0",
    tags: ["tracing", "evals"],
  },
  {
    title: "Datadog LLM Observability",
    repo: "",
    url: "https://docs.datadoghq.com/llm_observability/",
    description: "Datadog's managed LLM Observability product — traces LLM calls, monitors prompt/completion quality, detects anomalies, and integrates with existing APM.",
    license: "commercial",
    tags: ["managed", "apm"],
  },
  {
    title: "Honeycomb",
    repo: "honeycombio/honeycomb-opentelemetry-node",
    url: "https://github.com/honeycombio/honeycomb-opentelemetry-node",
    description: "Honeycomb's OpenTelemetry-native observability platform — high-cardinality event store ideal for tracing LLM pipelines and debugging slow agent traces.",
    license: "Apache-2.0",
    tags: ["opentelemetry", "tracing"],
  },
  {
    title: "Grafana Tempo",
    repo: "grafana/tempo",
    url: "https://github.com/grafana/tempo",
    description: "Grafana Tempo is a cost-efficient distributed tracing backend (OpenTelemetry-native) that pairs with Loki for logs and Prometheus for metrics in LLM stacks.",
    license: "AGPL-3.0",
    tags: ["tracing", "distributed"],
  },
  {
    title: "Sentry LLM Monitoring",
    repo: "getsentry/sentry",
    url: "https://github.com/getsentry/sentry",
    description: "Sentry's error and performance monitoring extended to LLM applications — captures exceptions, latency, and AI token usage with OpenTelemetry integration.",
    license: "FSL-1.0",
    tags: ["errors", "apm"],
  },
  {
    title: "New Relic AI Monitoring",
    repo: "",
    url: "https://docs.newrelic.com/docs/ai-monitoring/intro-to-ai-monitoring/",
    description: "New Relic AI Monitoring instruments LLM calls end-to-end — traces model invocations, measures token costs, and surfaces anomalies via the New Relic platform.",
    license: "commercial",
    tags: ["managed", "apm"],
  },
  {
    title: "Pydantic Logfire",
    repo: "pydantic/logfire",
    url: "https://github.com/pydantic/logfire",
    description: "Logfire by Pydantic — OpenTelemetry-based structured logging and tracing for Python applications with built-in support for FastAPI, SQLAlchemy, and Anthropic.",
    license: "MIT",
    tags: ["opentelemetry", "logging"],
  },
  {
    title: "Lunary",
    repo: "lunary-ai/lunary",
    url: "https://github.com/lunary-ai/lunary",
    description: "Open-source LLM observability and prompt management platform — tracks conversations, errors, costs, and user feedback for production AI applications.",
    license: "Apache-2.0",
    tags: ["logging", "evals"],
  },
  {
    title: "HoneyHive",
    repo: "",
    url: "https://www.honeyhive.ai",
    description: "HoneyHive is an AI evaluation and observability platform for tracing agent pipelines, running evaluations, and debugging regressions in production.",
    license: "commercial",
    tags: ["evals", "tracing"],
  },
  {
    title: "Portkey AI Gateway",
    repo: "Portkey-AI/gateway",
    url: "https://github.com/Portkey-AI/gateway",
    description: "Open-source AI gateway providing a unified API across 100+ LLM providers with built-in observability, request logging, fallbacks, caching, and load balancing.",
    license: "MIT",
    tags: ["gateway", "proxy"],
  },
  {
    title: "OpenInference",
    repo: "Arize-ai/openinference",
    url: "https://github.com/Arize-ai/openinference",
    description: "OpenInference is an open standard and Python/JS instrumentation library for capturing LLM and agent traces in OpenTelemetry format, built by Arize AI.",
    license: "Apache-2.0",
    tags: ["opentelemetry", "tracing"],
  },
  {
    title: "MLflow Tracing",
    repo: "mlflow/mlflow",
    url: "https://github.com/mlflow/mlflow",
    description: "MLflow's LLM tracing module instruments model calls, agent steps, and tool invocations, storing them alongside experiment runs for reproducibility.",
    license: "Apache-2.0",
    tags: ["tracing", "experiment-tracking"],
  },
  {
    title: "Langtrace",
    repo: "Scale3Labs/langtrace",
    url: "https://github.com/Scale3Labs/langtrace",
    description: "Open-source, OpenTelemetry-compliant LLM observability tool by Scale3Labs — traces calls to all major LLM providers and frameworks with a self-hostable UI.",
    license: "AGPL-3.0",
    tags: ["opentelemetry", "tracing"],
  },
  {
    title: "Langwatch",
    repo: "langwatch/langwatch",
    url: "https://github.com/langwatch/langwatch",
    description: "LangWatch provides real-time LLM analytics, guardrails, and evaluation pipelines with a visual studio for monitoring multi-step agent conversations.",
    license: "MIT",
    tags: ["tracing", "guardrails"],
  },
  {
    title: "Literal AI",
    repo: "",
    url: "https://literalai.com",
    description: "Literal AI is an observability and evaluation platform for conversational AI — captures multi-step threads, scores responses, and integrates with Chainlit.",
    license: "commercial",
    tags: ["tracing", "evals"],
  },
  {
    title: "Phospho",
    repo: "phospho-app/phospho",
    url: "https://github.com/phospho-app/phospho",
    description: "Phospho is a text analytics and evaluation platform for LLM apps — logs sessions, runs clustering, detects failures, and surfaces actionable insights.",
    license: "Apache-2.0",
    tags: ["analytics", "evals"],
  },
  {
    title: "OpenLIT",
    repo: "openlit/openlit",
    url: "https://github.com/openlit/openlit",
    description: "OpenLIT is an OpenTelemetry-native LLM observability toolkit with GPU monitoring, cost tracking, and a prompt hub — one-line setup for 20+ providers.",
    license: "Apache-2.0",
    tags: ["opentelemetry", "gpu"],
  },
  {
    title: "Laminar",
    repo: "lmnr-ai/lmnr",
    url: "https://github.com/lmnr-ai/lmnr",
    description: "Laminar is an open-source platform for tracing, evaluating, and labeling LLM and agent pipelines with a TypeScript/Python SDK and a self-hostable backend.",
    license: "Apache-2.0",
    tags: ["tracing", "evals"],
  },
  {
    title: "Baserun",
    repo: "baserun-ai/baserun-py",
    url: "https://github.com/baserun-ai/baserun-py",
    description: "Baserun captures LLM traces via a lightweight decorator-based SDK and provides a dashboard for debugging prompt chains, testing variants, and measuring quality.",
    license: "MIT",
    tags: ["tracing", "testing"],
  },
  {
    title: "Athina AI",
    repo: "athina-ai/athina-evals",
    url: "https://github.com/athina-ai/athina-evals",
    description: "Athina AI provides developer-focused LLM monitoring and eval framework — real-time inference logging, automated evals, and regression detection in CI.",
    license: "MIT",
    tags: ["evals", "logging"],
  },
  {
    title: "Comet Opik",
    repo: "comet-ml/opik",
    url: "https://github.com/comet-ml/opik",
    description: "Opik by Comet is an open-source LLM evaluation and tracing platform — log traces, run automated evals, create datasets, and track prompt improvements over time.",
    license: "Apache-2.0",
    tags: ["evals", "tracing"],
  },
  {
    title: "Maxim AI",
    repo: "",
    url: "https://www.getmaxim.ai",
    description: "Maxim AI is an evaluation and observability platform for AI agents — supports multi-step trace analysis, prompt testing, and production quality monitoring.",
    license: "commercial",
    tags: ["evals", "agents"],
  },
  {
    title: "Fiddler AI",
    repo: "",
    url: "https://www.fiddler.ai",
    description: "Fiddler AI Observability platform monitors LLM applications for hallucinations, toxicity, bias, and drift, with explainability and alerting for production AI.",
    license: "commercial",
    tags: ["managed", "safety"],
  },
];

// --- Adapter ------------------------------------------------------------------

function observabilityAdapter() {
  const seen = new Set();

  return {
    name: SOURCE_NAME,
    type: "observability",

    async fetch() {
      return records;
    },

    toEngram(item) {
      const base = slugify(item.title);
      const uname = uniqueName(base, seen);
      const desc = scrub(item.description).slice(0, 300);

      const ghMatch = (item.repo || "").match(/^([^/]+\/[^/]+)$/);
      const sourceRepo = ghMatch ? ghMatch[1] : "";
      const sourceUrl = item.url || (sourceRepo ? `https://github.com/${sourceRepo}` : "");

      return {
        frontmatter: {
          name: uname,
          type: "observability",
          description: desc,
          source_repo: sourceRepo,
          source_url: sourceUrl,
          license: item.license || "unknown",
          cli_compat: ["claude", "cursor", "codex", "opencode", "gemini"],
          maturity: "beta",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: ["observability", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nUse ${item.title} when you need LLM/agent observability, tracing, or monitoring in your pipeline.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nDiscovered via the observability-tools curated list. Pending verify -> promote.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-smithery.mjs) --------------------------------

async function runCollection(adapter, { dryRun = true, outDir = INCOMING, log = console.log } = {}) {
  const items = await adapter.fetch();
  const dir = join(outDir, adapter.name);
  if (!dryRun) resetDir(dir);
  const written = [];
  for (const item of items) {
    const { frontmatter, body } = adapter.toEngram(item);
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
    const adapter = observabilityAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[observability] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[observability] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[observability] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
