#!/usr/bin/env node
// Component structured-output crawler. Curated list of the STRUCTURED-OUTPUT /
// CONSTRAINED-GENERATION libraries an agent harness uses to make an LLM emit
// reliable typed, validated data (a JSON object, a Pydantic model, a
// grammar-constrained string) instead of free text. This is the reliability layer
// that sits BETWEEN the raw model and the agent framework: a framework (LangGraph,
// CrewAI, ...) orchestrates the loop, but the loop only works if each model call
// returns parseable, schema-valid output — that is what THIS layer guarantees.
// Two tiers, all previously absent as first-class components:
//   1. Constrained decoding engines (Outlines, Guidance, LMQL, XGrammar,
//      lm-format-enforcer, Jsonformer, Formatron, SynCode) — they mask the token
//      logits during generation so the model can ONLY produce tokens that satisfy a
//      JSON schema / regex / context-free grammar; the output is correct by
//      construction, no retry needed.
//   2. Schema-first / typed-output libraries (Instructor, Mirascope, Marvin, BAML,
//      Magentic, TypeChat, Ell, json-repair) — you declare a type/schema (often a
//      Pydantic model or a TS type) and the library handles the prompting, parsing,
//      validation, and re-ask/repair so the call returns a typed object.
// The arc this closes: the catalog already has the SERVE side (inference engines),
// the ROUTE side (gateways, A13), the ORCHESTRATE side (agent frameworks, A14), the
// retrieval substrate (A5-A12), the voice modality (A15), and the training side
// (A16) — but nothing that turns a model's free-text completion into the reliable
// typed value the agent code consumes. The call path is:
//   prompt -> model (inference engine) -> STRUCTURED OUTPUT (this) -> typed value -> agent.
// Verified disjoint across all 12 categories AS `infrastructure`: these libraries
// appear only as `skills` (outlines, guidance, instructor), `clis-tools`
// (567-labs-instructor, eth-sri-lmql), or unrelated `mcps` (sales "guidance", the
// "amazing marvin" task app) — never as the structured-output library itself in
// `infrastructure`; identity is type-scoped, so there is no clash. The two
// vendor-shared names that DO exist elsewhere as the library (instructor, lmql)
// follow the same type-scoped precedent as A14 (google-adk / autogpt added to
// `infrastructure` though present under other types). Chose `infrastructure` for
// consistency with the inference-engine and agent-framework (A14) entries already
// there (an installable generation-reliability library == substrate). The existing
// `infrastructure/sgl-project-sglang.md` is the SGLang inference ENGINE, a different
// concern, and is deliberately NOT duplicated here. All emitted slugs verified
// disjoint vs brain/components/infrastructure and from each other.
//
// Run:
//   node ingest/crawl-structured.mjs           # dry-run
//   node ingest/crawl-structured.mjs --apply   # write to incoming/structured/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-10-31";
const SOURCE_NAME = "structured";

// --- Shared helpers (mirrors crawl-training.mjs) -----------------------------

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
// tags }. All entries are real, actively maintained structured-output libraries.
// Titles slugify disjoint from the existing infrastructure list and from each
// other. Where a name also appears under another type (skills / clis-tools) it is
// type-scoped, so there is no clash in `infrastructure`.

const records = [
  // --- Tier 1: constrained decoding engines (token-level enforcement) --------
  {
    title: "Outlines",
    repo: "dottxt-ai/outlines",
    url: "https://github.com/dottxt-ai/outlines",
    description: "A structured-generation library that constrains a local LLM's token sampling to a JSON schema, regex, or context-free grammar, so the model can only emit output that is valid by construction — JSON, a Pydantic model, or a chosen format, no retries.",
    license: "Apache-2.0",
    tier: "constrained",
    tags: ["constrained-decoding", "json-schema", "regex", "pydantic"],
  },
  {
    title: "Guidance",
    repo: "guidance-ai/guidance",
    url: "https://github.com/guidance-ai/guidance",
    description: "A guidance language that interleaves generation, prompting, and logic in one program and constrains the model to regex or context-free grammars, giving token-level control over the output shape while cutting tokens and latency.",
    license: "MIT",
    tier: "constrained",
    tags: ["constrained-decoding", "grammar", "prompt-programming", "control-flow"],
  },
  {
    title: "LMQL",
    repo: "eth-sri/lmql",
    url: "https://github.com/eth-sri/lmql",
    description: "A query language for language models that embeds constraints and control flow into a Python-superset syntax: WHERE clauses enforce output shape (type, length, regex, stops) at decode time across many backends, turning prompting into a typed query.",
    license: "Apache-2.0",
    tier: "constrained",
    tags: ["query-language", "constrained-decoding", "constraints", "python"],
  },
  {
    title: "XGrammar",
    repo: "mlc-ai/xgrammar",
    url: "https://github.com/mlc-ai/xgrammar",
    description: "A fast, portable engine for structured generation that compiles a context-free grammar or JSON schema into a token-mask automaton, enforcing the grammar during decoding with near-zero overhead; used as the grammar backend in several inference servers.",
    license: "Apache-2.0",
    tier: "constrained",
    tags: ["constrained-decoding", "grammar", "json-schema", "fast"],
  },
  {
    title: "lm-format-enforcer",
    repo: "noamgat/lm-format-enforcer",
    url: "https://github.com/noamgat/lm-format-enforcer",
    description: "A library that enforces an output format (JSON schema or regex) by filtering the token logits at each step while still allowing the model to control whitespace and field order, integrating with Transformers, vLLM, llama.cpp, and others.",
    license: "MIT",
    tier: "constrained",
    tags: ["constrained-decoding", "json-schema", "regex", "logits"],
  },
  {
    title: "Jsonformer",
    repo: "1rgs/jsonformer",
    url: "https://github.com/1rgs/jsonformer",
    description: "A minimal wrapper that generates only the content tokens of a JSON object while filling the fixed structural tokens itself from a supplied JSON schema, guaranteeing syntactically valid, schema-conforming JSON from a local model.",
    license: "MIT",
    tier: "constrained",
    tags: ["constrained-decoding", "json-schema", "minimal", "local"],
  },
  {
    title: "Formatron",
    repo: "Dan-wanna-M/formatron",
    url: "https://github.com/Dan-wanna-M/formatron",
    description: "A high-performance constrained-decoding library that formats LLM output against regex, JSON schema, context-free grammars, or templates with low per-token overhead, plugging into Transformers, vLLM, and other backends.",
    license: "MIT",
    tier: "constrained",
    tags: ["constrained-decoding", "grammar", "json-schema", "fast"],
  },
  {
    title: "SynCode",
    repo: "uiuc-focal-lab/syncode",
    url: "https://github.com/uiuc-focal-lab/syncode",
    description: "A framework for grammar-guided generation that uses an incremental parser plus a precomputed DFA mask store to constrain decoding to any context-free grammar — JSON, SQL, Python, or a custom language — while keeping the model fluent.",
    license: "MIT",
    tier: "constrained",
    tags: ["constrained-decoding", "grammar", "parser", "code"],
  },

  // --- Tier 2: schema-first / typed-output libraries ------------------------
  {
    title: "Instructor",
    repo: "567-labs/instructor",
    url: "https://github.com/567-labs/instructor",
    description: "A library that wraps an LLM client so you request a Pydantic model as the response type: it injects the schema, parses the completion into a validated object, and automatically re-asks on validation errors, across OpenAI, Anthropic, and other providers.",
    license: "MIT",
    tier: "typed",
    tags: ["typed-output", "pydantic", "validation", "re-ask"],
  },
  {
    title: "Mirascope",
    repo: "Mirascope/mirascope",
    url: "https://github.com/Mirascope/mirascope",
    description: "A lightweight toolkit for building LLM applications with typed prompts and response models: decorate a Python function with an output type and it handles the call, parsing, and validation into that type across many providers, with provider-agnostic calls.",
    license: "MIT",
    tier: "typed",
    tags: ["typed-output", "pydantic", "prompt-functions", "provider-agnostic"],
  },
  {
    title: "Marvin",
    repo: "PrefectHQ/marvin",
    url: "https://github.com/PrefectHQ/marvin",
    description: "An AI engineering toolkit that turns LLM calls into typed Python functions and classifiers: cast, extract, and generate structured data to a declared type or Pydantic model so an LLM becomes a reliable building block in ordinary code.",
    license: "Apache-2.0",
    tier: "typed",
    tags: ["typed-output", "pydantic", "extraction", "classification"],
  },
  {
    title: "BAML",
    repo: "BoundaryML/baml",
    url: "https://github.com/BoundaryML/baml",
    description: "A domain-specific language for defining LLM functions and their input/output schemas, with a resilient parser (SAP) that coerces imperfect model output into the declared type; it generates typed clients for Python, TypeScript, and more.",
    license: "Apache-2.0",
    tier: "typed",
    tags: ["typed-output", "dsl", "schema", "codegen"],
  },
  {
    title: "Magentic",
    repo: "jackmpcollins/magentic",
    url: "https://github.com/jackmpcollins/magentic",
    description: "A library that exposes an LLM as a typed Python function: annotate a function with a return type and the @prompt decorator and calls return that type — including Pydantic models, streamed structured output, and function/tool calling.",
    license: "MIT",
    tier: "typed",
    tags: ["typed-output", "pydantic", "decorators", "streaming"],
  },
  {
    title: "TypeChat",
    repo: "microsoft/TypeChat",
    url: "https://github.com/microsoft/TypeChat",
    description: "Microsoft's library for building natural-language interfaces using types: it sends a TypeScript type as the schema, validates the model's JSON response against it with the TypeScript compiler, and repairs on failure, replacing prompt engineering with schema engineering.",
    license: "MIT",
    tier: "typed",
    tags: ["typed-output", "typescript", "schema-validation", "repair"],
  },
  {
    title: "Ell",
    repo: "MadcowD/ell",
    url: "https://github.com/MadcowD/ell",
    description: "A language-model programming library that treats prompts as versioned Python functions returning structured values: it supports Pydantic output types, automatic prompt versioning, and visualization, making a prompt a first-class, typed software component.",
    license: "MIT",
    tier: "typed",
    tags: ["typed-output", "prompt-functions", "versioning", "pydantic"],
  },
  {
    title: "json-repair",
    repo: "mangiucugna/json_repair",
    url: "https://github.com/mangiucugna/json_repair",
    description: "A dependency-free library that repairs broken or truncated JSON emitted by an LLM — fixing missing quotes, trailing commas, and unterminated structures — so a free-text completion can still be parsed into a valid object as a last-resort reliability layer.",
    license: "MIT",
    tier: "typed",
    tags: ["json-repair", "parsing", "reliability", "post-processing"],
  },
];

// Human-readable description of each tier for the stub body.
const TIER_BLURB = {
  constrained: "a constrained-decoding engine — it masks the token logits during generation against a JSON schema, regex, or grammar, so the model can only emit output that is valid by construction (no parse failures, no retries)",
  typed: "a schema-first / typed-output library — you declare the type or schema you want and it handles the prompting, parsing, validation, and re-ask/repair so the call returns a reliable typed object",
};

// --- Adapter ------------------------------------------------------------------

function structuredAdapter() {
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
      const tierBlurb = TIER_BLURB[item.tier] || "a structured-output infrastructure component";

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
          tags: ["structured-output", "constrained-generation", "reliability", "substrate", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when you need an LLM to return reliable typed/validated data instead of free text: it is ${tierBlurb}. It sits between the model and your agent code in the call path — prompt -> model (inference engine) -> structured output (this) -> typed value -> agent.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's structured-output infrastructure list — the constrained-generation / typed-output substrate that makes a model's completion parseable and schema-valid, the reliability layer the agent frameworks depend on. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-training.mjs) -------------------------------

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
    const adapter = structuredAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[structured] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[structured] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[structured] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
