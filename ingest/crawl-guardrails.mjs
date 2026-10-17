#!/usr/bin/env node
// Component guardrails crawler. Curated list of runtime guardrail / AI-security
// frameworks — input/output validators, prompt-injection defenses, safety
// classifiers, and LLM red-teaming / vulnerability scanners. These are distinct
// from the offline-benchmark-heavy evals list: they validate, filter, and
// red-team model I/O (often at runtime). Emits one component stub per tool into
// incoming/guardrails/ with type `evals` (runtime validation == applied eval).
//
// Run:
//   node ingest/crawl-guardrails.mjs           # dry-run
//   node ingest/crawl-guardrails.mjs --apply   # write to incoming/guardrails/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-10-17";
const SOURCE_NAME = "guardrails";

// --- Shared helpers (mirrors crawl-observability.mjs) ------------------------

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
// Each record: { title, repo ("owner/repo"), url, description, license, tags }
// All entries are real, actively maintained AI-security / guardrail projects.

const records = [
  {
    title: "NeMo Guardrails",
    repo: "NVIDIA/NeMo-Guardrails",
    url: "https://github.com/NVIDIA/NeMo-Guardrails",
    description: "NVIDIA toolkit for adding programmable rails (topical, safety, jailbreak, and fact-checking) to LLM apps using a Colang dialect for conversation flows.",
    license: "Apache-2.0",
    tags: ["runtime", "rails", "jailbreak", "nvidia"],
  },
  {
    title: "Guardrails AI",
    repo: "guardrails-ai/guardrails",
    url: "https://github.com/guardrails-ai/guardrails",
    description: "Python framework for adding input/output validators to LLM calls via a hub of composable validators, structured-output enforcement, and automatic reasking.",
    license: "Apache-2.0",
    tags: ["runtime", "validators", "structured-output"],
  },
  {
    title: "LLM Guard",
    repo: "protectai/llm-guard",
    url: "https://github.com/protectai/llm-guard",
    description: "Protect AI's security toolkit that sanitizes prompts and responses with scanners for prompt injection, PII, toxicity, secrets, and banned topics.",
    license: "MIT",
    tags: ["runtime", "prompt-injection", "pii", "protectai"],
  },
  {
    title: "Rebuff",
    repo: "protectai/rebuff",
    url: "https://github.com/protectai/rebuff",
    description: "Self-hardening prompt-injection detector using heuristics, a dedicated LLM classifier, a vector store of known attacks, and canary-token leak detection.",
    license: "Apache-2.0",
    tags: ["prompt-injection", "canary", "protectai"],
  },
  {
    title: "ModelScan",
    repo: "protectai/modelscan",
    url: "https://github.com/protectai/modelscan",
    description: "Scans machine-learning model files (pickle, Keras, PyTorch, TensorFlow) for unsafe code and serialization attacks before they are loaded into an agent.",
    license: "Apache-2.0",
    tags: ["supply-chain", "model-scanning", "protectai"],
  },
  {
    title: "Purple Llama",
    repo: "meta-llama/PurpleLlama",
    url: "https://github.com/meta-llama/PurpleLlama",
    description: "Meta's trust-and-safety suite bundling Llama Guard and Prompt Guard input/output classifiers plus the CyberSecEval benchmarks for securing LLM systems.",
    license: "custom",
    tags: ["safety-classifier", "llama-guard", "prompt-guard", "meta"],
  },
  {
    title: "Vigil LLM",
    repo: "deadbits/vigil-llm",
    url: "https://github.com/deadbits/vigil-llm",
    description: "Detection framework that assesses prompts and responses for injections, jailbreaks, and other risks using YARA rules, embeddings, and transformer scanners.",
    license: "Apache-2.0",
    tags: ["prompt-injection", "yara", "scanner"],
  },
  {
    title: "Invariant",
    repo: "invariantlabs-ai/invariant",
    url: "https://github.com/invariantlabs-ai/invariant",
    description: "Invariant Labs analyzer and guardrailing stack for agents: define declarative safety policies over tool calls and traces, then enforce them at runtime.",
    license: "Apache-2.0",
    tags: ["agents", "policy", "tool-calls"],
  },
  {
    title: "Granite Guardian",
    repo: "ibm-granite/granite-guardian",
    url: "https://github.com/ibm-granite/granite-guardian",
    description: "IBM's open guardrail models that detect harms in prompts and responses across jailbreaks, bias, violence, and RAG groundedness/answer-relevance risks.",
    license: "Apache-2.0",
    tags: ["safety-classifier", "rag", "ibm"],
  },
  {
    title: "garak",
    repo: "NVIDIA/garak",
    url: "https://github.com/NVIDIA/garak",
    description: "LLM vulnerability scanner that probes models for hallucination, data leakage, prompt injection, toxicity, and jailbreaks across dozens of attack plugins.",
    license: "Apache-2.0",
    tags: ["red-teaming", "scanner", "nvidia"],
  },
  {
    title: "PyRIT",
    repo: "Azure/PyRIT",
    url: "https://github.com/Azure/PyRIT",
    description: "Microsoft's Python Risk Identification Toolkit for automating red-team operations against generative-AI systems with orchestrators, converters, and scorers.",
    license: "MIT",
    tags: ["red-teaming", "microsoft", "orchestration"],
  },
  {
    title: "DeepTeam",
    repo: "confident-ai/deepteam",
    url: "https://github.com/confident-ai/deepteam",
    description: "Open-source LLM red-teaming framework from the DeepEval authors that generates adversarial attacks and scores 40+ vulnerabilities like bias and leakage.",
    license: "Apache-2.0",
    tags: ["red-teaming", "adversarial", "deepeval"],
  },
  {
    title: "Presidio",
    repo: "microsoft/presidio",
    url: "https://github.com/microsoft/presidio",
    description: "Microsoft's PII detection and anonymization SDK for text and images; a common building block for redacting sensitive data in LLM prompts and outputs.",
    license: "MIT",
    tags: ["pii", "anonymization", "microsoft"],
  },
  {
    title: "Detoxify",
    repo: "unitaryai/detoxify",
    url: "https://github.com/unitaryai/detoxify",
    description: "Pretrained transformer classifiers that score text for toxicity, obscenity, threats, insults, and identity attacks — a lightweight output-safety filter.",
    license: "Apache-2.0",
    tags: ["toxicity", "classifier", "output-filter"],
  },
  {
    title: "WildGuard",
    repo: "allenai/wildguard",
    url: "https://github.com/allenai/wildguard",
    description: "Allen AI's open moderation model and toolkit for classifying prompt harmfulness, response harmfulness, and model refusal in a single lightweight pass.",
    license: "Apache-2.0",
    tags: ["moderation", "safety-classifier", "allenai"],
  },
  {
    title: "AgentDojo",
    repo: "ethz-spylab/agentdojo",
    url: "https://github.com/ethz-spylab/agentdojo",
    description: "ETH Zurich dynamic benchmark and environment for evaluating how robust tool-calling agents are against prompt-injection attacks embedded in task data.",
    license: "MIT",
    tags: ["agents", "prompt-injection", "benchmark"],
  },
  {
    title: "ShieldLM",
    repo: "thu-coai/ShieldLM",
    url: "https://github.com/thu-coai/ShieldLM",
    description: "Tsinghua CoAI bilingual safety detector that flags unsafe LLM responses with customizable rules and natural-language explanations for each judgment.",
    license: "Apache-2.0",
    tags: ["safety-classifier", "bilingual", "explainable"],
  },
  {
    title: "Lakera ChainGuard",
    repo: "lakeraai/chainguard",
    url: "https://github.com/lakeraai/chainguard",
    description: "Lakera's open integration that guards LangChain agents and chains against prompt injection and policy violations via the Lakera Guard detection API.",
    license: "MIT",
    tags: ["prompt-injection", "langchain", "lakera"],
  },
  {
    title: "LangKit",
    repo: "whylabs/langkit",
    url: "https://github.com/whylabs/langkit",
    description: "WhyLabs open-source toolkit that extracts LLM safety and quality signals — prompt-injection scores, toxicity, sentiment, relevance — for monitoring and guards.",
    license: "Apache-2.0",
    tags: ["metrics", "monitoring", "whylabs"],
  },
  {
    title: "promptmap",
    repo: "utkusen/promptmap",
    url: "https://github.com/utkusen/promptmap",
    description: "Automated prompt-injection testing tool that fires a library of attack rules at a target system prompt and reports which injections succeed.",
    license: "MIT",
    tags: ["prompt-injection", "testing", "red-teaming"],
  },
  {
    title: "Agentic Security",
    repo: "msoedov/agentic_security",
    url: "https://github.com/msoedov/agentic_security",
    description: "Open-source LLM vulnerability scanner that fuzzes endpoints with jailbreak and injection payloads, multi-step attacks, and stress tests for guardrail gaps.",
    license: "Apache-2.0",
    tags: ["scanner", "fuzzing", "red-teaming"],
  },
  {
    title: "spikee",
    repo: "WithSecureLabs/spikee",
    url: "https://github.com/WithSecureLabs/spikee",
    description: "WithSecure's Simple Prompt Injection Kit for Evaluation and Exploitation — a toolkit for generating injection datasets and testing LLM guardrails end to end.",
    license: "Apache-2.0",
    tags: ["prompt-injection", "dataset", "withsecure"],
  },
];

// --- Adapter ------------------------------------------------------------------

function guardrailsAdapter() {
  const seen = new Set();

  return {
    name: SOURCE_NAME,
    type: "evals",

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
          type: "evals",
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
          tags: ["guardrails", "safety", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when you need to validate, filter, or red-team LLM/agent inputs and outputs — prompt-injection defense, PII/toxicity filtering, or safety classification.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's guardrails / AI-security list. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-observability.mjs) --------------------------

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
    const adapter = guardrailsAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[guardrails] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[guardrails] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[guardrails] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
