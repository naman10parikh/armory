#!/usr/bin/env node
// Component data-curation crawler. Curated list of the SYNTHETIC-DATA GENERATION /
// DATASET-CURATION / ANNOTATION tools an agent harness uses to BUILD, CLEAN, and
// LABEL the training/fine-tuning data a model learns from. This is the DATA-PRODUCE
// stage that sits immediately BEFORE the training stage (A16): you cannot fine-tune
// or post-train a model without a dataset, and this is the layer that creates one —
// generating synthetic instruction/preference data, filtering and deduplicating raw
// corpora at scale, and annotating/labelling examples. Three tiers, all previously
// absent as first-class components:
//   1. Synthesis — generate synthetic SFT / preference / instruction datasets from a
//      seed or from scratch using LLMs (Distilabel, DataDreamer, fabricator,
//      promptwright, Bespoke Curator, Augmentoolkit, Synthetic Data Kit).
//   2. Curation — filter, deduplicate, clean, and quality-score raw text corpora at
//      pretraining scale (NeMo Curator, datatrove, Data Prep Kit, Dolma, Lilac,
//      text-dedup, SemHash, Cleanlab).
//   3. Annotation — human or programmatic labelling / weak supervision to turn raw
//      examples into labelled training data (Argilla, Snorkel, Label Studio, Doccano).
// The arc this closes: the catalog already has the TRAIN side (training frameworks,
// A16), the SERVE side (inference engines), the ROUTE side (gateways, A13), the
// ORCHESTRATE side (agent frameworks, A14), the retrieval substrate (A5-A12), the
// voice modality (A15), and the generation-reliability layer (structured output,
// A17) — but nothing that PRODUCES the dataset the training stage consumes. The
// model-lifecycle path is:
//   curate / synthesize / label data (this) -> train / fine-tune (A16) -> serve
//   (inference engine) -> route (gateway, A13) -> orchestrate (framework, A14) -> agent.
// This is distinct from docparse (A12), which turns a raw PDF/HTML/scan into CHUNKS
// for RETRIEVAL (consumed by the embedding/vector/graph layers), whereas THIS turns
// raw or seed data into labelled/synthetic TRAINING DATASETS (consumed by A16) — a
// different output for a different consumer.
// Verified disjoint across all 12 categories AS `infrastructure`: these tools appear
// only as `clis-tools` (argilla-io-distilabel — the Distilabel/Argilla CLI entry) or
// as `mcps` (label-studio MCP servers that wrap the app) — never as the data-curation
// library itself in `infrastructure`; identity is type-scoped, so there is no clash.
// The vendor-shared names that DO exist elsewhere (distilabel, argilla, label-studio)
// follow the same type-scoped precedent as A14 (google-adk / autogpt added to
// `infrastructure` though present under other types) and A17 (instructor / lmql).
// Distilabel (the synthetic-data framework) and Argilla (the annotation platform) are
// two genuinely distinct products from the same org and are listed separately. Chose
// `infrastructure` for consistency with the training (A16) and inference-engine
// entries already there (an installable model-lifecycle library == substrate). All
// emitted slugs verified disjoint vs brain/components/infrastructure and from each
// other.
//
// Run:
//   node ingest/crawl-datacuration.mjs           # dry-run
//   node ingest/crawl-datacuration.mjs --apply   # write to incoming/datacuration/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-11-01";
const SOURCE_NAME = "datacuration";

// --- Shared helpers (mirrors crawl-structured.mjs) ---------------------------

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
// tags }. All entries are real, actively maintained data-curation tools. Titles
// slugify disjoint from the existing infrastructure list and from each other.
// Where a name also appears under another type (clis-tools / mcps) it is
// type-scoped, so there is no clash in `infrastructure`.

const records = [
  // --- Tier 1: synthesis (generate synthetic training data with LLMs) --------
  {
    title: "Distilabel",
    repo: "argilla-io/distilabel",
    url: "https://github.com/argilla-io/distilabel",
    description: "A framework for generating synthetic datasets and AI feedback at scale: compose pipelines of LLM steps (self-instruct, evolve, judge, preference) to produce SFT and preference-tuning data with reproducible, verifiable provenance.",
    license: "Apache-2.0",
    tier: "synthesis",
    tags: ["synthetic-data", "ai-feedback", "pipelines", "preference-data"],
  },
  {
    title: "DataDreamer",
    repo: "datadreamer-dev/DataDreamer",
    url: "https://github.com/datadreamer-dev/DataDreamer",
    description: "A library for prompting, synthetic data generation, and reproducible LLM workflows: chain generation and transformation steps into caching, resumable pipelines that produce and augment datasets for training and evaluation.",
    license: "MIT",
    tier: "synthesis",
    tags: ["synthetic-data", "augmentation", "reproducible", "pipelines"],
  },
  {
    title: "fabricator",
    repo: "flairNLP/fabricator",
    url: "https://github.com/flairNLP/fabricator",
    description: "A toolkit that uses LLMs to generate labelled training data for NLP tasks: declare a task and prompt template and it fabricates annotated examples (classification, QA, entity labels) you can train a smaller model on.",
    license: "Apache-2.0",
    tier: "synthesis",
    tags: ["synthetic-data", "labelled-data", "nlp", "teacher-student"],
  },
  {
    title: "promptwright",
    repo: "StacklokLabs/promptwright",
    url: "https://github.com/StacklokLabs/promptwright",
    description: "A library for generating large synthetic instruction datasets from a topic tree using local or hosted LLMs, with configurable prompts and automatic push to the Hugging Face Hub for fine-tuning.",
    license: "Apache-2.0",
    tier: "synthesis",
    tags: ["synthetic-data", "instruction-tuning", "topic-tree", "local-llm"],
  },
  {
    title: "Bespoke Curator",
    repo: "bespokelabs-ai/curator",
    url: "https://github.com/bespokelabs-ai/curator",
    description: "A library for programmatic synthetic-data curation for post-training: define typed generation and filtering steps, run them at scale with batching and caching, and inspect the resulting dataset in a built-in viewer.",
    license: "Apache-2.0",
    tier: "synthesis",
    tags: ["synthetic-data", "post-training", "curation", "typed"],
  },
  {
    title: "Augmentoolkit",
    repo: "e-p-armstrong/augmentoolkit",
    url: "https://github.com/e-p-armstrong/augmentoolkit",
    description: "A pipeline that converts raw unstructured text (books, docs, transcripts) into custom instruction-tuning and domain QA datasets with local models, so you can turn a corpus into a fine-tuning set without manual labelling.",
    license: "MIT",
    tier: "synthesis",
    tags: ["synthetic-data", "instruction-tuning", "domain-adaptation", "local-llm"],
  },
  {
    title: "Synthetic Data Kit",
    repo: "meta-llama/synthetic-data-kit",
    url: "https://github.com/meta-llama/synthetic-data-kit",
    description: "A command-line tool for generating reasoning and fine-tuning datasets by ingesting documents, creating QA pairs or chain-of-thought examples with an LLM, curating them, and exporting to a training-ready format.",
    license: "unknown",
    tier: "synthesis",
    tags: ["synthetic-data", "fine-tuning", "reasoning", "qa-pairs"],
  },

  // --- Tier 2: curation (filter / dedup / clean raw corpora at scale) --------
  {
    title: "NVIDIA NeMo Curator",
    repo: "NVIDIA/NeMo-Curator",
    url: "https://github.com/NVIDIA/NeMo-Curator",
    description: "A GPU-accelerated library for curating large-scale text and multimodal data for LLM pretraining: downloading, language ID, exact and fuzzy deduplication, quality and heuristic filtering, and PII redaction across billions of documents.",
    license: "Apache-2.0",
    tier: "curation",
    tags: ["data-curation", "deduplication", "filtering", "pretraining-scale"],
  },
  {
    title: "datatrove",
    repo: "huggingface/datatrove",
    url: "https://github.com/huggingface/datatrove",
    description: "A library for processing, filtering, and deduplicating very large text datasets with a platform-agnostic pipeline of composable blocks, running the same curation code locally, on Slurm, or in the cloud at pretraining scale.",
    license: "Apache-2.0",
    tier: "curation",
    tags: ["data-curation", "deduplication", "filtering", "pipelines"],
  },
  {
    title: "Data Prep Kit",
    repo: "data-prep-kit/data-prep-kit",
    url: "https://github.com/data-prep-kit/data-prep-kit",
    description: "A toolkit of composable transforms for preparing code and language data for LLM use — dedup, tokenization, quality and content filters, PII handling — that scale from a laptop to Ray or Spark clusters without rewriting the pipeline.",
    license: "Apache-2.0",
    tier: "curation",
    tags: ["data-curation", "transforms", "ray", "scalable"],
  },
  {
    title: "Dolma",
    repo: "allenai/dolma",
    url: "https://github.com/allenai/dolma",
    description: "AllenAI's toolkit and dataset for curating pretraining corpora: a fast, parallel pipeline of taggers and filters (language, quality, toxicity, dedup) used to build the open Dolma dataset, usable to curate your own.",
    license: "Apache-2.0",
    tier: "curation",
    tags: ["data-curation", "taggers", "filtering", "pretraining-scale"],
  },
  {
    title: "Lilac",
    repo: "lilacai/lilac",
    url: "https://github.com/lilacai/lilac",
    description: "A tool for exploring, curating, and cleaning unstructured text datasets for LLMs: cluster and search semantically, detect near-duplicates and PII, apply filters, and export the curated slice for training or fine-tuning.",
    license: "Apache-2.0",
    tier: "curation",
    tags: ["data-curation", "exploration", "clustering", "cleaning"],
  },
  {
    title: "text-dedup",
    repo: "ChenghaoMou/text-dedup",
    url: "https://github.com/ChenghaoMou/text-dedup",
    description: "A collection of text-deduplication methods — MinHash LSH, SimHash, suffix array, exact and semantic dedup — for removing duplicate and near-duplicate documents from a training corpus to improve data quality and reduce memorization.",
    license: "Apache-2.0",
    tier: "curation",
    tags: ["deduplication", "minhash", "data-quality", "corpus"],
  },
  {
    title: "SemHash",
    repo: "MinishLab/semhash",
    url: "https://github.com/MinishLab/semhash",
    description: "A fast library for semantic deduplication and outlier filtering of text datasets using lightweight embeddings and ANN, removing near-duplicate and anomalous examples from a training or fine-tuning set in a few lines.",
    license: "MIT",
    tier: "curation",
    tags: ["deduplication", "semantic", "embeddings", "filtering"],
  },
  {
    title: "Cleanlab",
    repo: "cleanlab/cleanlab",
    url: "https://github.com/cleanlab/cleanlab",
    description: "A data-centric library that automatically finds and fixes label errors, outliers, and low-quality examples in a dataset using confident learning, so you can clean the training data instead of only tuning the model.",
    license: "AGPL-3.0",
    tier: "curation",
    tags: ["data-quality", "label-errors", "confident-learning", "cleaning"],
  },

  // --- Tier 3: annotation (human / programmatic labelling) -------------------
  {
    title: "Argilla",
    repo: "argilla-io/argilla",
    url: "https://github.com/argilla-io/argilla",
    description: "A collaboration platform for building high-quality LLM datasets: human and model-assisted annotation, review, and feedback workflows with a Python SDK and web UI, producing curated SFT and preference data for training and evaluation.",
    license: "Apache-2.0",
    tier: "annotation",
    tags: ["annotation", "human-feedback", "review", "preference-data"],
  },
  {
    title: "Snorkel",
    repo: "snorkel-team/snorkel",
    url: "https://github.com/snorkel-team/snorkel",
    description: "A framework for programmatic data labelling via weak supervision: write labelling functions that encode heuristics, then combine their noisy votes with a label model into probabilistic training labels, replacing most hand annotation.",
    license: "Apache-2.0",
    tier: "annotation",
    tags: ["weak-supervision", "programmatic-labelling", "labelling-functions", "training-labels"],
  },
  {
    title: "Label Studio",
    repo: "HumanSignal/label-studio",
    url: "https://github.com/HumanSignal/label-studio",
    description: "An open-source data-labelling platform for text, images, audio, and more, with configurable labelling interfaces, ML-assisted pre-labelling, and review workflows to produce and export annotated datasets for training.",
    license: "Apache-2.0",
    tier: "annotation",
    tags: ["annotation", "labelling-platform", "multimodal", "pre-labelling"],
  },
  {
    title: "Doccano",
    repo: "doccano/doccano",
    url: "https://github.com/doccano/doccano",
    description: "An open-source text-annotation tool for classification, sequence labelling (NER), and sequence-to-sequence tasks, with a simple web UI and team workflows to build labelled NLP datasets for training.",
    license: "MIT",
    tier: "annotation",
    tags: ["annotation", "text-labelling", "ner", "nlp"],
  },
];

// Human-readable description of each tier for the stub body.
const TIER_BLURB = {
  synthesis: "a synthetic-data generator — it uses LLMs to create instruction, preference, or reasoning examples (from a seed, a topic tree, or raw text) so you have a dataset to fine-tune or post-train on",
  curation: "a corpus-curation tool — it filters, deduplicates, cleans, and quality-scores raw text at scale so the data you train on is high-quality and free of duplicates and junk",
  annotation: "a data-annotation tool — human or programmatic labelling / weak supervision that turns raw examples into labelled training data (SFT, preference, or classification)",
};

// --- Adapter ------------------------------------------------------------------

function dataCurationAdapter() {
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
      const tierBlurb = TIER_BLURB[item.tier] || "a data-curation infrastructure component";

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
          tags: ["data-curation", "synthetic-data", "training-data", "substrate", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when you need to BUILD or CLEAN the dataset a model learns from: it is ${tierBlurb}. It sits at the data-produce stage of the model lifecycle — curate / synthesize / label data (this) -> train / fine-tune (A16) -> serve -> route -> orchestrate -> agent.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's data-curation infrastructure list — the synthetic-data generation / dataset-curation / annotation substrate that produces the training data the training frameworks consume. Distinct from document-parsing (which produces retrieval chunks), this produces labelled/synthetic training datasets. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-structured.mjs) -----------------------------

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
    const adapter = dataCurationAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[datacuration] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[datacuration] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[datacuration] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
