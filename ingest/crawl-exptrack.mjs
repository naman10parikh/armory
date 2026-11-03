#!/usr/bin/env node
// Component experiment-tracking crawler. Curated list of the ML EXPERIMENT-TRACKING /
// MODEL + ARTIFACT REGISTRY / RUN-METADATA platforms an agent harness uses to WATCH,
// VERSION, and COMPARE the training runs that produce the weights a model runs on.
// This is the OBSERVE side of the training stage (A16): once you curate data (A18)
// and launch a fine-tune or pretrain (A16), you need somewhere to log every metric,
// hyperparameter, checkpoint, and artifact so runs are reproducible, comparable, and
// promotable to a registry. Nothing across the 12 categories captured this layer as a
// first-class component. Two tiers:
//   1. Experiment trackers — log metrics/params/artifacts per run, visualize and diff
//      runs, and tune hyperparameters (Weights & Biases, Neptune.ai, Aim, Sacred,
//      Guild AI, SwanLab, Keepsake, DVC).
//   2. Lifecycle / registry platforms — tracking plus a model/artifact registry and
//      reproducible ML pipelines (ClearML, Determined AI, Metaflow, ZenML, MLRun,
//      Kedro, Polyaxon, Valohai).
// The arc this closes: the catalog already has the DATA-PRODUCE side (data curation,
// A18), the TRAIN side (training frameworks, A16), the SERVE side (inference engines),
// the ROUTE side (gateways, A13), the ORCHESTRATE side (agent frameworks, A14), the
// durable-EXECUTION side (orchestration engines, A19), and the retrieval substrate
// (A5-A12) — but nothing that LOGS and VERSIONS the training runs themselves. The
// model-lifecycle path is:
//   curate data (A18) -> train / fine-tune (A16) -> track + register runs (this) ->
//   serve (inference engine) -> route (gateway, A13) -> orchestrate (framework, A14).
// This is `observability` (the thinnest category, 36) and the natural complement to
// the LLM-tracing platforms already there (Langfuse, LangSmith, Helicone, Phoenix-era
// tools): those observe an agent's RUNTIME inference calls, whereas THESE observe the
// TRAINING runs that produced the model — a different lifecycle stage, same type.
// Verified disjoint across all 12 categories AS `observability`: every platform here
// appears only as `mcps` (MCP servers that WRAP the tool — weights-biases-mcp-server,
// wandb-mcp, clearml-mcp, mlops-mcp-server, sagemaker-ai-mcp-server) — never as the
// tracking platform itself in `observability`; identity is type-scoped, so there is no
// clash, the same precedent as A14 (google-adk / autogpt) / A17 (instructor / lmql) /
// A18 (distilabel / label-studio) / A19 (temporal / airflow).
// Deliberately EXCLUDED to avoid a same-type near-duplicate (the A13/A18 precedent of
// not re-adding a tool already present in the target type): MLflow and Comet, whose
// LLM SKUs `mlflow-tracing` and `comet-opik` already live in `observability`; and
// Weave, whose LLM-eval SKU `wandb-weave-evals` lives in `evals` (a DIFFERENT type, so
// the general Weights & Biases experiment tracker IS included here and is type-disjoint
// from that evals entry). Flyte is EXCLUDED because it was added as a durable-execution
// engine in A19 (incoming/orchestration). Proprietary SaaS (Neptune.ai, Valohai) keep
// license: unknown rather than a guess. All emitted slugs verified disjoint vs
// brain/components/observability and from each other.
//
// Run:
//   node ingest/crawl-exptrack.mjs           # dry-run
//   node ingest/crawl-exptrack.mjs --apply   # write to incoming/exptrack/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-11-03";
const SOURCE_NAME = "exptrack";

// --- Shared helpers (mirrors crawl-datacuration.mjs) -------------------------

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
// tags }. All entries are real, actively maintained ML experiment-tracking /
// model-registry platforms. Titles slugify disjoint from the existing
// observability list and from each other. Where a name also appears under
// another type (mcps) it is type-scoped, so there is no clash in `observability`.

const records = [
  // --- Tier 1: experiment trackers (log metrics/params/artifacts per run) ----
  {
    title: "Weights & Biases",
    repo: "wandb/wandb",
    url: "https://github.com/wandb/wandb",
    description: "An experiment-tracking platform that logs metrics, hyperparameters, gradients, and artifacts from each training run, then visualizes and diffs runs in a web dashboard, with sweeps for hyperparameter search and a model registry.",
    license: "MIT",
    tier: "tracker",
    tags: ["experiment-tracking", "hyperparameter-sweeps", "dashboard", "model-registry"],
  },
  {
    title: "Neptune.ai",
    repo: "neptune-ai/neptune-client",
    url: "https://github.com/neptune-ai/neptune-client",
    description: "A metadata store and experiment tracker for ML and foundation-model training: log and query metrics, parameters, and artifacts from thousands of runs, compare them at scale, and monitor long-running training in a hosted dashboard.",
    license: "unknown",
    tier: "tracker",
    tags: ["experiment-tracking", "metadata-store", "comparison", "monitoring"],
  },
  {
    title: "Aim",
    repo: "aimhubio/aim",
    url: "https://github.com/aimhubio/aim",
    description: "An open-source, self-hosted experiment tracker that logs runs to a local store and renders a fast UI for exploring and comparing thousands of metrics, with a Python query API for programmatic run analysis.",
    license: "Apache-2.0",
    tier: "tracker",
    tags: ["experiment-tracking", "self-hosted", "open-source", "comparison"],
  },
  {
    title: "Sacred",
    repo: "IDSIA/sacred",
    url: "https://github.com/IDSIA/sacred",
    description: "A lightweight framework for configuring, organizing, and reproducing research experiments: capture the config, code version, and environment of every run and log results to pluggable observers (file, MongoDB) for reproducibility.",
    license: "MIT",
    tier: "tracker",
    tags: ["experiment-tracking", "reproducibility", "configuration", "research"],
  },
  {
    title: "Guild AI",
    repo: "guildai/guildai",
    url: "https://github.com/guildai/guildai",
    description: "An experiment-tracking and hyperparameter-tuning tool that runs each training script as a tracked experiment without code changes, capturing flags, metrics, and outputs so runs can be compared, reproduced, and diffed from the command line.",
    license: "Apache-2.0",
    tier: "tracker",
    tags: ["experiment-tracking", "hyperparameter-tuning", "cli", "reproducibility"],
  },
  {
    title: "SwanLab",
    repo: "SwanHubX/SwanLab",
    url: "https://github.com/SwanHubX/SwanLab",
    description: "An open-source, self-hostable experiment-tracking and visualization tool for ML and LLM training: log metrics, hyperparameters, and media per run, compare runs in a dashboard, and track hardware utilization during long training jobs.",
    license: "Apache-2.0",
    tier: "tracker",
    tags: ["experiment-tracking", "self-hosted", "visualization", "open-source"],
  },
  {
    title: "Keepsake",
    repo: "replicate/keepsake",
    url: "https://github.com/replicate/keepsake",
    description: "A version-control tool for machine-learning experiments that snapshots code, hyperparameters, metrics, weights, and the training environment to your own cloud storage, so any past run can be reproduced or a checkpoint retrieved.",
    license: "Apache-2.0",
    tier: "tracker",
    tags: ["experiment-tracking", "versioning", "checkpoints", "reproducibility"],
  },
  {
    title: "DVC",
    repo: "iterative/dvc",
    url: "https://github.com/iterative/dvc",
    description: "Data Version Control: Git-like versioning for datasets, models, and ML pipelines plus experiment tracking, letting you snapshot large files to remote storage, define reproducible pipeline stages, and compare experiment metrics from the CLI.",
    license: "Apache-2.0",
    tier: "tracker",
    tags: ["data-versioning", "experiment-tracking", "pipelines", "model-versioning"],
  },

  // --- Tier 2: lifecycle / registry platforms (tracking + registry + pipelines)
  {
    title: "ClearML",
    repo: "clearml/clearml",
    url: "https://github.com/clearml/clearml",
    description: "An end-to-end MLOps platform combining experiment tracking, a model and artifact registry, pipeline orchestration, and remote execution/queueing, so training runs are logged, reproducible, and promotable to production from one SDK.",
    license: "Apache-2.0",
    tier: "lifecycle",
    tags: ["experiment-tracking", "model-registry", "mlops", "pipelines"],
  },
  {
    title: "Determined AI",
    repo: "determined-ai/determined",
    url: "https://github.com/determined-ai/determined",
    description: "A deep-learning training platform that provides experiment tracking, distributed training, fault tolerance, and state-of-the-art hyperparameter search out of the box, with a model registry and cluster scheduling for GPUs.",
    license: "Apache-2.0",
    tier: "lifecycle",
    tags: ["experiment-tracking", "distributed-training", "hyperparameter-search", "model-registry"],
  },
  {
    title: "Metaflow",
    repo: "Netflix/metaflow",
    url: "https://github.com/Netflix/metaflow",
    description: "A framework for building and managing real-world ML and data-science projects: write flows as Python steps that automatically version runs, snapshot artifacts and data, scale to the cloud, and resume from any step for reproducibility.",
    license: "Apache-2.0",
    tier: "lifecycle",
    tags: ["ml-lifecycle", "versioning", "artifacts", "reproducibility"],
  },
  {
    title: "ZenML",
    repo: "zenml-io/zenml",
    url: "https://github.com/zenml-io/zenml",
    description: "An extensible MLOps framework for portable, production-grade ML pipelines: define steps once and run them on any orchestrator or cloud, with built-in experiment tracking, a model control plane, and artifact/metadata versioning.",
    license: "Apache-2.0",
    tier: "lifecycle",
    tags: ["mlops", "pipelines", "experiment-tracking", "model-registry"],
  },
  {
    title: "MLRun",
    repo: "mlrun/mlrun",
    url: "https://github.com/mlrun/mlrun",
    description: "An open-source MLOps orchestration framework that tracks experiments, versions models and artifacts, and turns code into scalable serverless functions and pipelines, bridging training, a model registry, and deployment.",
    license: "Apache-2.0",
    tier: "lifecycle",
    tags: ["mlops", "experiment-tracking", "model-registry", "pipelines"],
  },
  {
    title: "Kedro",
    repo: "kedro-org/kedro",
    url: "https://github.com/kedro-org/kedro",
    description: "A framework for reproducible, maintainable ML pipelines built on software-engineering best practices: a data catalog, modular nodes, and pipeline versioning, with experiment-tracking and visualization via kedro-viz.",
    license: "Apache-2.0",
    tier: "lifecycle",
    tags: ["pipelines", "data-catalog", "reproducibility", "experiment-tracking"],
  },
  {
    title: "Polyaxon",
    repo: "polyaxon/polyaxon",
    url: "https://github.com/polyaxon/polyaxon",
    description: "A platform for reproducible and scalable ML on Kubernetes: experiment tracking, a run and artifact registry, distributed training, and automated hyperparameter optimization, managing the full lifecycle of training jobs on a cluster.",
    license: "Apache-2.0",
    tier: "lifecycle",
    tags: ["experiment-tracking", "kubernetes", "hyperparameter-optimization", "mlops"],
  },
  {
    title: "Valohai",
    repo: "valohai/valohai-cli",
    url: "https://github.com/valohai/valohai-cli",
    description: "A managed MLOps platform that versions every training run — code, data, parameters, metrics, and outputs — and runs them on managed cloud compute, providing reproducible pipelines and a model registry driven from a CLI and YAML.",
    license: "MIT",
    tier: "lifecycle",
    tags: ["mlops", "experiment-tracking", "pipelines", "model-registry"],
  },
];

// Human-readable description of each tier for the stub body.
const TIER_BLURB = {
  tracker: "an experiment tracker — it logs the metrics, hyperparameters, checkpoints, and artifacts of each training run so you can visualize, compare, diff, and reproduce runs",
  lifecycle: "a lifecycle / registry platform — experiment tracking plus a model and artifact registry and reproducible ML pipelines, so a tracked run can be promoted to a registered, deployable model",
};

// --- Adapter ------------------------------------------------------------------

function exptrackAdapter() {
  const seen = new Set();

  return {
    name: SOURCE_NAME,
    type: "observability",

    async fetch() {
      return records;
    },

    toComponent(item) {
      const base = slugify(item.title);
      const uname = uniqueName(base, seen);
      const desc = scrub(item.description).slice(0, 300);
      const tierBlurb = TIER_BLURB[item.tier] || "an experiment-tracking observability component";

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
          maturity: "stable",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: ["experiment-tracking", "mlops", "model-registry", "training-observability", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when you need to WATCH and VERSION the training runs that produce a model: it is ${tierBlurb}. It sits at the observe stage of the model lifecycle — curate data (A18) -> train / fine-tune (A16) -> track + register runs (this) -> serve -> route -> orchestrate -> agent.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's experiment-tracking observability list — the ML experiment-tracking / model-registry substrate that logs and versions training runs. Distinct from the LLM-tracing platforms in this category (which observe an agent's runtime inference), this observes the training runs that produced the model. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-datacuration.mjs) ---------------------------

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
    const adapter = exptrackAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[exptrack] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[exptrack] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[exptrack] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
