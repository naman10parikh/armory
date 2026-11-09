#!/usr/bin/env node
// Component prompt-engineering / prompt-optimization crawler. Curated list of the
// libraries an agent harness uses to AUTHOR, OPTIMIZE, and COMPRESS the prompt
// itself — the INPUT side of the LLM call. This is the mirror of the structured-
// output layer (A17): A17 makes the model's OUTPUT reliable (typed, schema-valid);
// THIS makes the model's INPUT good (optimized, programmatically constructed,
// token-efficient). It is also distinct from the agent FRAMEWORKS (A14, which
// orchestrate the control-flow loop) — these tools improve the single prompt string
// that each step of that loop sends. Two tiers, all previously absent as first-class
// components:
//   1. Automatic prompt optimization — search/evolve/calibrate a prompt against a
//      metric so the engineer stops hand-tuning (TextGrad, AdalFlow, SAMMO,
//      PromptWizard, Promptim, AutoPrompt, EvoPrompt, Zenbase, Microsoft Trace, GEPA).
//   2. Programmatic prompt construction / templating / compression — libraries that
//      treat a prompt as code (typed templates, priority-based truncation, a prompt
//      DSL) or shrink it to save tokens (Priompt, Prompt Poet, Banks, APPL, Prompt
//      Declaration Language, LLMLingua, Prompt Optimizer).
// The arc this closes: the catalog already has the SERVE side (inference engines),
// the ROUTE side (gateways, A13), the ORCHESTRATE side (frameworks, A14), the OUTPUT-
// reliability side (structured output, A17), the retrieval substrate (A5-A12), voice
// (A15), training (A16), data curation (A18), durable execution (A19), and the UI
// layer (A22) — but nothing that improves the prompt the agent actually sends. The
// call path is:
//   intent -> PROMPT ENGINEERING/OPTIMIZATION (this) -> prompt -> model -> output.
// Verified disjoint across all 12 categories AS `infrastructure`: these tools appear
// only as `skills` (dspy), `clis-tools` (stanfordnlp-dspy, zou-group-textgrad,
// gepa-ai-gepa), `evals` (agenta), or unrelated `mcps` (basalt, ape) — never as the
// prompt-optimization library itself in `infrastructure`; identity is type-scoped, so
// there is no clash. The vendor-shared names that DO exist elsewhere (textgrad, gepa)
// follow the same type-scoped precedent as A14 (google-adk / autogpt) and A17
// (instructor / lmql). DSPy, Mirascope, and Ell are DELIBERATELY EXCLUDED to avoid a
// same-type (`infrastructure`) near-dup with the staged A14 frameworks (DSPy) and A17
// structured-output (Mirascope, Ell) sets. Chose `infrastructure` for consistency
// with the framework (A14) and structured-output (A17) entries already there (an
// installable prompt-reliability library == substrate). All emitted slugs verified
// disjoint vs brain/components/infrastructure and from each other.
//
// Run:
//   node ingest/crawl-promptopt.mjs           # dry-run
//   node ingest/crawl-promptopt.mjs --apply    # write to incoming/promptopt/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-11-09";
const SOURCE_NAME = "promptopt";

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
// tags }. All entries are real, actively maintained prompt-engineering /
// prompt-optimization libraries. Titles slugify disjoint from the existing
// infrastructure list and from each other. Where a name also appears under
// another type (skills / clis-tools / evals / mcps) it is type-scoped, so there
// is no clash in `infrastructure`.

const records = [
  // --- Tier 1: automatic prompt optimization --------------------------------
  {
    title: "TextGrad",
    repo: "zou-group/textgrad",
    url: "https://github.com/zou-group/textgrad",
    description: "A framework that backpropagates textual feedback through a compound LLM system: an evaluator LLM produces natural-language gradients that update prompts (and other text variables) toward a metric, automating the hand-tuning of prompts.",
    license: "MIT",
    tier: "optimize",
    tags: ["prompt-optimization", "textual-gradients", "automatic", "feedback"],
  },
  {
    title: "AdalFlow",
    repo: "SylphAI-Inc/AdalFlow",
    url: "https://github.com/SylphAI-Inc/AdalFlow",
    description: "A PyTorch-inspired library to build and auto-optimize LLM task pipelines: you define a task graph with tunable prompts and the trainer optimizes them against your examples and metric, turning prompt tuning into a training loop.",
    license: "MIT",
    tier: "optimize",
    tags: ["prompt-optimization", "pipeline", "auto-optimize", "trainer"],
  },
  {
    title: "SAMMO",
    repo: "microsoft/sammo",
    url: "https://github.com/microsoft/sammo",
    description: "Microsoft's structure-aware multi-objective metaprompt optimization library: it represents a prompt as a mutable program and searches over edits to minimize cost while maximizing a metric, optimizing long metaprompts and pipelines.",
    license: "MIT",
    tier: "optimize",
    tags: ["prompt-optimization", "metaprompt", "search", "multi-objective"],
  },
  {
    title: "PromptWizard",
    repo: "microsoft/PromptWizard",
    url: "https://github.com/microsoft/PromptWizard",
    description: "Microsoft's feedback-driven, self-evolving framework that jointly optimizes a prompt's instructions and in-context examples: it critiques and refines candidates over iterations against a task metric to produce a strong task-specific prompt.",
    license: "MIT",
    tier: "optimize",
    tags: ["prompt-optimization", "self-evolving", "few-shot", "instructions"],
  },
  {
    title: "Promptim",
    repo: "hinthornw/promptim",
    url: "https://github.com/hinthornw/promptim",
    description: "An experimental library for systematic prompt optimization: given a task, a dataset, and an evaluator, it runs optimization experiments that iterate on a starter prompt and report the improved version with its scores.",
    license: "MIT",
    tier: "optimize",
    tags: ["prompt-optimization", "experiments", "evaluator", "dataset"],
  },
  {
    title: "AutoPrompt",
    repo: "Eladlev/AutoPrompt",
    url: "https://github.com/Eladlev/AutoPrompt",
    description: "A prompt-optimization framework that uses intent-based prompt calibration: it generates challenging edge-case samples, scores the prompt against them, and iteratively rewrites the prompt to close the gap between stated intent and behavior.",
    license: "Apache-2.0",
    tier: "optimize",
    tags: ["prompt-optimization", "calibration", "edge-cases", "iterative"],
  },
  {
    title: "EvoPrompt",
    repo: "beeevita/EvoPrompt",
    url: "https://github.com/beeevita/EvoPrompt",
    description: "A framework that connects LLMs with evolutionary algorithms to optimize discrete prompts: it treats prompts as a population, applies mutation and crossover via the LLM, and selects by fitness on a dev set to evolve better prompts.",
    license: "Apache-2.0",
    tier: "optimize",
    tags: ["prompt-optimization", "evolutionary", "discrete", "population"],
  },
  {
    title: "Zenbase",
    repo: "zenbase-ai/lib",
    url: "https://github.com/zenbase-ai/lib",
    description: "A library for automatic prompt and example optimization in production: derived from DSPy research, it continuously selects and tunes prompts and few-shot demonstrations against live signals so the optimization runs in your running app.",
    license: "MIT",
    tier: "optimize",
    tags: ["prompt-optimization", "production", "few-shot", "continuous"],
  },
  {
    title: "Microsoft Trace (OptoPrime)",
    repo: "microsoft/Trace",
    url: "https://github.com/microsoft/Trace",
    description: "A framework for end-to-end optimization of AI systems that generalizes back-propagation to arbitrary computation graphs: its OptoPrime optimizer updates prompts, code, and other parameters from execution traces and feedback.",
    license: "MIT",
    tier: "optimize",
    tags: ["prompt-optimization", "trace", "graph", "optoprime"],
  },
  {
    title: "GEPA",
    repo: "gepa-ai/gepa",
    url: "https://github.com/gepa-ai/gepa",
    description: "A framework for optimizing text components — prompts, code, instructions — by reflective evolution: it mutates candidates using LLM reflection on execution traces and keeps a Pareto frontier, often beating reinforcement-learning baselines.",
    license: "MIT",
    tier: "optimize",
    tags: ["prompt-optimization", "reflective", "pareto", "evolution"],
  },

  // --- Tier 2: programmatic prompt construction / templating / compression ---
  {
    title: "Priompt",
    repo: "anysphere/priompt",
    url: "https://github.com/anysphere/priompt",
    description: "A JSX-based prompt-design library from the makers of Cursor: you compose a prompt from components with explicit priorities, and the renderer includes the highest-priority pieces that fit the token budget, so prompts truncate gracefully.",
    license: "MIT",
    tier: "construct",
    tags: ["prompt-templating", "jsx", "priority", "token-budget"],
  },
  {
    title: "Prompt Poet",
    repo: "character-ai/prompt-poet",
    url: "https://github.com/character-ai/prompt-poet",
    description: "Character.AI's library for templating and managing production prompts: it uses YAML plus Jinja to build structured, truncatable prompt sequences from data, separating prompt authoring from application code at scale.",
    license: "MIT",
    tier: "construct",
    tags: ["prompt-templating", "yaml", "jinja", "production"],
  },
  {
    title: "Banks",
    repo: "masci/banks",
    url: "https://github.com/masci/banks",
    description: "A prompt programming language built on Jinja that adds LLM-aware primitives — tool calls, chat roles, caching, and lazy rendering — so a prompt becomes a reusable, parameterized template that can call functions while it renders.",
    license: "MIT",
    tier: "construct",
    tags: ["prompt-templating", "jinja", "dsl", "tools"],
  },
  {
    title: "APPL",
    repo: "appl-team/appl",
    url: "https://github.com/appl-team/appl",
    description: "A Prompt Programming Language that embeds natural-language prompts into Python: the body of a decorated function becomes the prompt, with Python control flow, composition, and async parallel calls, unifying code and prompts in one program.",
    license: "MIT",
    tier: "construct",
    tags: ["prompt-programming", "python", "composition", "async"],
  },
  {
    title: "Prompt Declaration Language",
    repo: "IBM/prompt-declaration-language",
    url: "https://github.com/IBM/prompt-declaration-language",
    description: "IBM's declarative YAML-based language for composing prompts and LLM programs: you describe model calls, data, control flow, and tool use as a document, and the interpreter runs it, keeping prompt programs portable and auditable.",
    license: "Apache-2.0",
    tier: "construct",
    tags: ["prompt-dsl", "declarative", "yaml", "composition"],
  },
  {
    title: "LLMLingua",
    repo: "microsoft/LLMLingua",
    url: "https://github.com/microsoft/LLMLingua",
    description: "Microsoft's prompt-compression toolkit: a small language model identifies and drops low-information tokens so a long prompt shrinks up to roughly 20x with minimal performance loss, cutting cost and latency for long-context and RAG prompts.",
    license: "MIT",
    tier: "construct",
    tags: ["prompt-compression", "token-reduction", "cost", "long-context"],
  },
  {
    title: "Prompt Optimizer",
    repo: "linshenkx/prompt-optimizer",
    url: "https://github.com/linshenkx/prompt-optimizer",
    description: "A self-hostable prompt-optimization tool (web app, browser extension, and SDK) that iteratively rewrites a draft prompt for clarity and effectiveness, with side-by-side comparison and multi-model support, for hands-on prompt improvement.",
    license: "MIT",
    tier: "construct",
    tags: ["prompt-improvement", "self-hosted", "web", "comparison"],
  },
];

// Human-readable description of each tier for the stub body.
const TIER_BLURB = {
  optimize: "an automatic prompt-optimization framework — it searches, evolves, or calibrates the prompt against a metric so you stop hand-tuning and let a loop produce a stronger task-specific prompt",
  construct: "a programmatic prompt-construction / templating / compression library — it treats the prompt as code (typed templates, priority-based truncation, a prompt DSL) or shrinks it to save tokens, so prompt authoring is reusable and maintainable",
};

// --- Adapter ------------------------------------------------------------------

function promptoptAdapter() {
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
      const tierBlurb = TIER_BLURB[item.tier] || "a prompt-engineering infrastructure component";

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
          tags: ["prompt-engineering", "prompt-optimization", "reliability", "substrate", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when you need to improve the prompt an agent sends rather than parse what it returns: it is ${tierBlurb}. It sits before the model in the call path — intent -> prompt engineering/optimization (this) -> prompt -> model -> output — and is the input-side mirror of the structured-output layer.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's prompt-engineering / prompt-optimization infrastructure list — the input-side substrate that authors, optimizes, and compresses the prompt itself, distinct from the agent frameworks that orchestrate the loop and the structured-output libraries that validate the result. Verified ${VERIFIED_AT}.`,
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
    const adapter = promptoptAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[promptopt] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[promptopt] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[promptopt] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
