#!/usr/bin/env node
// Component orchestration crawler. Curated list of the DURABLE-EXECUTION /
// WORKFLOW-ORCHESTRATION / BACKGROUND-JOB engines an agent harness runs its
// long-running, multi-step, must-not-lose-progress work on. This is the
// RELIABILITY substrate under an agent: the layer that makes a step retry on
// failure, survive a process crash and resume mid-workflow, pause for
// human-in-the-loop and wake later, run on a schedule, and execute each step
// exactly once. Three tiers, all previously absent as first-class components:
//   1. Durable execution — crash-proof, resumable, exactly-once code: the
//      workflow's state is persisted so it continues from where it died
//      (Temporal, Restate, DBOS Transact, Resonate).
//   2. Durable background-job / function platforms — queue-backed durable
//      functions and task queues for async/background agent work with retries
//      and concurrency control (Inngest, Trigger.dev, Hatchet, Windmill,
//      Celery, BullMQ, RQ).
//   3. Workflow / DAG orchestrators — schedule and orchestrate multi-step
//      pipelines (data + agentic) as dependency graphs with retries, backfills,
//      and observability (Apache Airflow, Prefect, Dagster, Flyte, Kestra,
//      Conductor OSS, Argo Workflows).
// Why this fills a real gap: the catalog already has the agent ORCHESTRATION
// LIBRARIES (frameworks, A14 — LangGraph/CrewAI/AutoGen, the reasoning/planning
// loop) and the model SERVE/ROUTE/retrieval substrate (A5-A18), but nothing
// that makes a long-running agent workflow DURABLE — survive a crash, retry a
// failed tool call, resume a half-finished plan, pause days for approval. A14
// frameworks decide WHAT the agent does next; these engines guarantee the
// multi-step work actually COMPLETES reliably underneath. This is also distinct
// from the `workflows` CATEGORY, which holds slash-command + composition RECIPES
// (prompt-level), not the execution engine that runs them.
// Verified disjoint across all 12 categories AS `infrastructure`: every one of
// these engines appears ONLY as `mcps` (MCP servers that WRAP the engine, e.g.
// temporal-mcp, hatchet-mcp, dbos-mcp-server, prefect/dagster/airflow MCPs),
// `clis-tools` (inngest-utah), or `skills` (inngest, bullmq-specialist,
// django-celery) — NEVER as the engine itself in `infrastructure`; identity is
// type-scoped, so there is no clash. This follows the same type-scoped precedent
// as A14 (google-adk / autogpt added to `infrastructure` though present under
// other types), A17 (instructor / lmql), and A18 (distilabel / label-studio).
// Chose `infrastructure` for consistency with the inference-engine (vLLM/SGLang/
// llama.cpp), gateway (A13), framework (A14), and training (A16) entries already
// there — an installable execution runtime == substrate; the infra list had
// sandboxes + inference + retrieval + routing but no durable-execution layer.
// All emitted slugs verified disjoint vs brain/components/infrastructure (the 54
// pre-existing entries) and from each other; Windmill has zero prior mention
// anywhere in the catalog.
//
// Run:
//   node ingest/crawl-orchestration.mjs           # dry-run
//   node ingest/crawl-orchestration.mjs --apply   # write to incoming/orchestration/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-11-02";
const SOURCE_NAME = "orchestration";

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
// tags }. All entries are real, actively maintained execution/orchestration
// engines. Titles slugify disjoint from the existing infrastructure list and
// from each other. Where a name also appears under another type (mcps /
// clis-tools / skills) it is type-scoped, so there is no clash in
// `infrastructure`. Licenses that are non-standard or unclear (Restate's BSL
// server, Inngest's mixed core) are kept `unknown` rather than guessed.

const records = [
  // --- Tier 1: durable execution (crash-proof, resumable, exactly-once) ------
  {
    title: "Temporal",
    repo: "temporalio/temporal",
    url: "https://github.com/temporalio/temporal",
    description: "A durable-execution platform that runs workflows as ordinary code whose full state is persisted, so a workflow survives process crashes and resumes exactly where it stopped, with automatic retries, timers, and signals for long-running agent tasks.",
    license: "MIT",
    tier: "durable-execution",
    tags: ["durable-execution", "workflows", "retries", "exactly-once"],
  },
  {
    title: "Restate",
    repo: "restatedev/restate",
    url: "https://github.com/restatedev/restate",
    description: "A lightweight durable-execution engine for resilient applications and agents: write handlers as plain functions and Restate persists each step, journaling progress so calls are idempotent, retries resume mid-execution, and long-lived workflows survive failures.",
    license: "unknown",
    tier: "durable-execution",
    tags: ["durable-execution", "agents", "idempotency", "journaling"],
  },
  {
    title: "DBOS Transact",
    repo: "dbos-inc/dbos-transact-py",
    url: "https://github.com/dbos-inc/dbos-transact-py",
    description: "A durable-execution library that persists workflow and step state in Postgres so multi-step code is crash-resilient and resumable with exactly-once steps, run as a lightweight library in your own process instead of a separate orchestration server.",
    license: "MIT",
    tier: "durable-execution",
    tags: ["durable-execution", "postgres", "library", "exactly-once"],
  },
  {
    title: "Resonate",
    repo: "resonatehq/resonate",
    url: "https://github.com/resonatehq/resonate",
    description: "A durable-execution platform built on durable promises: write async code whose promises survive crashes so a function can await a result for seconds or days and resume transparently, giving long-running and human-in-the-loop agent workflows crash-resilience.",
    license: "Apache-2.0",
    tier: "durable-execution",
    tags: ["durable-execution", "durable-promises", "async", "human-in-the-loop"],
  },

  // --- Tier 2: durable background-job / function platforms -------------------
  {
    title: "Inngest",
    repo: "inngest/inngest",
    url: "https://github.com/inngest/inngest",
    description: "A durable-functions platform for background and event-driven work: define steps that each retry independently and persist state, with flow control, concurrency limits, scheduling, and fan-out, used to run reliable multi-step AI and agent workflows.",
    license: "unknown",
    tier: "jobs",
    tags: ["durable-functions", "background-jobs", "event-driven", "retries"],
  },
  {
    title: "Trigger.dev",
    repo: "triggerdotdev/trigger.dev",
    url: "https://github.com/triggerdotdev/trigger.dev",
    description: "An open-source background-jobs platform for long-running tasks: write durable tasks in TypeScript with automatic retries, checkpointing, concurrency control, and scheduling, designed for AI and agent workloads that run far longer than a normal request.",
    license: "Apache-2.0",
    tier: "jobs",
    tags: ["background-jobs", "durable-tasks", "typescript", "scheduling"],
  },
  {
    title: "Hatchet",
    repo: "hatchet-dev/hatchet",
    url: "https://github.com/hatchet-dev/hatchet",
    description: "A distributed task queue and durable-execution engine on Postgres: run background tasks and multi-step workflows (DAGs) with retries, concurrency and rate limits, scheduling, and real-time progress, built for reliable high-volume agent and AI task execution.",
    license: "MIT",
    tier: "jobs",
    tags: ["task-queue", "durable-execution", "dag", "postgres"],
  },
  {
    title: "Windmill",
    repo: "windmill-labs/windmill",
    url: "https://github.com/windmill-labs/windmill",
    description: "An open-source developer platform that turns scripts into scheduled jobs, workflows, and UIs: compose steps into flows with retries, concurrency, branching, and approval steps, run them on a self-hostable worker fleet as a background-job and automation engine.",
    license: "AGPL-3.0",
    tier: "jobs",
    tags: ["workflow-engine", "background-jobs", "automation", "self-hostable"],
  },
  {
    title: "Celery",
    repo: "celery/celery",
    url: "https://github.com/celery/celery",
    description: "The classic Python distributed task queue for asynchronous and scheduled background jobs: offload long or parallel work to worker pools over a broker (Redis/RabbitMQ) with retries, rate limits, and chaining, widely used to run agent tool calls off the request path.",
    license: "BSD-3-Clause",
    tier: "jobs",
    tags: ["task-queue", "python", "background-jobs", "distributed"],
  },
  {
    title: "BullMQ",
    repo: "taskforcesh/bullmq",
    url: "https://github.com/taskforcesh/bullmq",
    description: "A fast, robust Redis-backed job and message queue for Node.js: enqueue background jobs with retries, rate limiting, delayed and repeatable jobs, priorities, and flows (parent/child dependencies), used to run agent background work reliably in TypeScript services.",
    license: "MIT",
    tier: "jobs",
    tags: ["job-queue", "redis", "nodejs", "background-jobs"],
  },
  {
    title: "RQ",
    repo: "rq/rq",
    url: "https://github.com/rq/rq",
    description: "A simple Redis-backed Python library for queueing background jobs and processing them with workers: minimal setup, retries, scheduling, and job dependencies, a lightweight way to run agent tasks asynchronously without a heavyweight task-queue stack.",
    license: "BSD-3-Clause",
    tier: "jobs",
    tags: ["job-queue", "redis", "python", "background-jobs"],
  },

  // --- Tier 3: workflow / DAG orchestrators ---------------------------------
  {
    title: "Apache Airflow",
    repo: "apache/airflow",
    url: "https://github.com/apache/airflow",
    description: "The widely used platform to author, schedule, and monitor workflows as Python-defined DAGs: dependency-aware execution with retries, backfills, a rich operator ecosystem, and a monitoring UI, used to orchestrate data and increasingly agentic multi-step pipelines.",
    license: "Apache-2.0",
    tier: "orchestrator",
    tags: ["workflow-orchestration", "dag", "scheduling", "python"],
  },
  {
    title: "Prefect",
    repo: "PrefectHQ/prefect",
    url: "https://github.com/PrefectHQ/prefect",
    description: "A Python workflow-orchestration framework: turn functions into flows and tasks with automatic retries, caching, scheduling, concurrency, and observability, with dynamic runtime-defined DAGs well suited to orchestrating data and agent pipelines.",
    license: "Apache-2.0",
    tier: "orchestrator",
    tags: ["workflow-orchestration", "python", "scheduling", "retries"],
  },
  {
    title: "Dagster",
    repo: "dagster-io/dagster",
    url: "https://github.com/dagster-io/dagster",
    description: "An orchestration platform built around data assets: define assets and ops with typed dependencies, schedules, sensors, retries, and a full UI, giving multi-step data and ML/agent pipelines strong observability and testability.",
    license: "Apache-2.0",
    tier: "orchestrator",
    tags: ["workflow-orchestration", "data-assets", "scheduling", "observability"],
  },
  {
    title: "Flyte",
    repo: "flyteorg/flyte",
    url: "https://github.com/flyteorg/flyte",
    description: "A Kubernetes-native workflow-orchestration engine for data and ML: author strongly typed, versioned, reproducible pipelines in Python that scale on Kubernetes with caching, retries, and resource control, used to orchestrate training and multi-step AI workflows.",
    license: "Apache-2.0",
    tier: "orchestrator",
    tags: ["workflow-orchestration", "kubernetes", "ml-pipelines", "reproducible"],
  },
  {
    title: "Kestra",
    repo: "kestra-io/kestra",
    url: "https://github.com/kestra-io/kestra",
    description: "An event-driven, declarative orchestration platform: define workflows in YAML with hundreds of plugins, scheduling, retries, and a UI, orchestrating data, automation, and agent tasks from code or low-code without being tied to one language.",
    license: "Apache-2.0",
    tier: "orchestrator",
    tags: ["workflow-orchestration", "declarative", "event-driven", "yaml"],
  },
  {
    title: "Conductor OSS",
    repo: "conductor-oss/conductor",
    url: "https://github.com/conductor-oss/conductor",
    description: "A microservice and workflow-orchestration engine (originally from Netflix): define workflows as JSON that coordinate tasks across services and workers with retries, versioning, and a UI, used to orchestrate durable, distributed multi-step and agent workflows.",
    license: "Apache-2.0",
    tier: "orchestrator",
    tags: ["workflow-orchestration", "microservices", "distributed", "durable"],
  },
  {
    title: "Argo Workflows",
    repo: "argoproj/argo-workflows",
    url: "https://github.com/argoproj/argo-workflows",
    description: "A Kubernetes-native workflow engine where each step runs as a container: define DAG or step pipelines as Kubernetes CRDs with retries, artifacts, and parameters, used to orchestrate containerized data, ML, and agent jobs at scale on a cluster.",
    license: "Apache-2.0",
    tier: "orchestrator",
    tags: ["workflow-orchestration", "kubernetes", "containers", "dag"],
  },
];

// Human-readable description of each tier for the stub body.
const TIER_BLURB = {
  "durable-execution": "a durable-execution engine — it persists workflow/step state so your multi-step code survives a crash, retries failed steps, and resumes exactly where it stopped (even days later for human-in-the-loop)",
  jobs: "a durable background-job / task-queue platform — it runs async/background work off the request path with retries, concurrency control, and scheduling so long agent tasks complete reliably",
  orchestrator: "a workflow / DAG orchestrator — it schedules and coordinates multi-step pipelines as dependency graphs with retries, backfills, and monitoring, for data and agentic workflows",
};

// --- Adapter ------------------------------------------------------------------

function orchestrationAdapter() {
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
      const tierBlurb = TIER_BLURB[item.tier] || "a durable-execution / orchestration infrastructure component";

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
          tags: ["orchestration", "durable-execution", "workflows", "substrate", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when an agent has to run long-running, multi-step work that must NOT lose progress: it is ${tierBlurb}. It sits at the reliability layer beneath the agent — the framework (A14) decides what to do next, and this engine guarantees the work actually completes (retries, crash-recovery, scheduling, exactly-once).\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's orchestration / durable-execution infrastructure list — the execution substrate that makes long-running agent workflows reliable. Distinct from the agent-orchestration FRAMEWORKS (A14, the reasoning/planning libraries) and from the \`workflows\` category (slash-command + composition recipes). Verified ${VERIFIED_AT}.`,
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
    const adapter = orchestrationAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[orchestration] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[orchestration] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[orchestration] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
