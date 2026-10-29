#!/usr/bin/env node
// Component model-training crawler. Curated list of the FINE-TUNING / POST-TRAINING /
// distributed-pretraining frameworks an agent harness uses to *produce or customize*
// the model weights an agent runs on — the exact mirror of the model INFERENCE engines
// (vLLM, SGLang, llama.cpp) already sitting in `infrastructure`. Four tiers, all
// previously absent as first-class components:
//   1. Supervised fine-tuning toolkits (Axolotl, Unsloth, LLaMA-Factory, torchtune,
//      LitGPT, XTuner, ms-swift, Ludwig, Oumi, AutoTrain Advanced) — config-driven
//      SFT/LoRA/QLoRA trainers that take a base model + a dataset and emit adapted
//      weights.
//   2. Parameter-efficient tuning library (PEFT) — the LoRA/QLoRA/adapter primitive the
//      toolkits build on.
//   3. Preference / RL post-training (TRL, trlX, OpenRLHF, veRL, NeMo-Aligner,
//      Open-Instruct) — DPO/PPO/GRPO/RLHF trainers that align a model to preferences or
//      a reward.
//   4. Large-scale distributed pretraining engines (DeepSpeed, Megatron-LM, Nanotron,
//      Levanter, GPT-NeoX) — the ZeRO / tensor-pipeline-parallel substrate that trains
//      or continues-pretrains big models across many GPUs.
// The arc this closes: the catalog already has the SERVE side (inference engines),
// the ROUTE side (gateways, A13), the ORCHESTRATE side (agent frameworks, A14), and the
// retrieval substrate (A5-A12) — but nothing that PRODUCES / post-trains the weights the
// agent actually calls. The model lifecycle is: train/fine-tune (THIS) -> serve
// (inference engine) -> route (gateway) -> orchestrate (framework) -> agent.
// Verified disjoint across all 12 categories: fine-tuning shows up only as SKILLS
// (fine-tuning-axolotl, fine-tuning-unsloth, post-training-trl, distributed-training-*)
// and as MCP servers that *mention* a trainer — never the training framework itself as a
// component; identity is type-scoped, so there is no clash in `infrastructure`. Chose
// `infrastructure` for consistency with the inference-engine entries already there (an
// installable training runtime == substrate, the mirror of an inference runtime). All
// emitted slugs verified disjoint vs brain/components/infrastructure and from each other.
//
// Run:
//   node ingest/crawl-training.mjs           # dry-run
//   node ingest/crawl-training.mjs --apply   # write to incoming/training/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-10-29";
const SOURCE_NAME = "training";

// --- Shared helpers (mirrors crawl-voice.mjs) --------------------------------

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
// Each record: { title, repo ("owner/repo" or ""), url, description, license,
// tier, tags }. All entries are real, actively maintained training frameworks.
// Titles slugify disjoint from the existing infrastructure list and from each
// other. Several names also appear under the `skills` type (fine-tuning-* /
// post-training-* / distributed-training-* skills) — identity is type-scoped, so
// there is no clash in `infrastructure`. Where a license is non-standard
// (e.g. Megatron-LM's custom NVIDIA terms) it is left "unknown" rather than guessed.

const records = [
  // --- Tier 1: supervised fine-tuning toolkits ------------------------------
  {
    title: "Axolotl",
    repo: "axolotl-ai-cloud/axolotl",
    url: "https://github.com/axolotl-ai-cloud/axolotl",
    description: "A config-driven fine-tuning framework for LLMs: one YAML selects the base model, dataset format, and method (full, LoRA, QLoRA) with multi-GPU, DeepSpeed/FSDP, flash-attention, and sample packing, emitting adapted weights without custom training code.",
    license: "Apache-2.0",
    tier: "sft",
    tags: ["fine-tuning", "lora", "qlora", "yaml-config"],
  },
  {
    title: "Unsloth",
    repo: "unslothai/unsloth",
    url: "https://github.com/unslothai/unsloth",
    description: "A fine-tuning library that patches attention and training kernels to make LoRA/QLoRA SFT of LLMs roughly 2x faster with large memory savings, letting you tune modern models on a single consumer or free-tier GPU.",
    license: "Apache-2.0",
    tier: "sft",
    tags: ["fine-tuning", "lora", "fast", "low-memory"],
  },
  {
    title: "LLaMA-Factory",
    repo: "hiyouga/LLaMA-Factory",
    url: "https://github.com/hiyouga/LLaMA-Factory",
    description: "A unified fine-tuning platform covering 100+ LLMs and VLMs with SFT, LoRA/QLoRA, DPO, PPO, and KTO through a CLI and a web UI, standardizing dataset formats and training recipes across many model families.",
    license: "Apache-2.0",
    tier: "sft",
    tags: ["fine-tuning", "lora", "web-ui", "multi-model"],
  },
  {
    title: "torchtune",
    repo: "pytorch/torchtune",
    url: "https://github.com/pytorch/torchtune",
    description: "PyTorch's native library for fine-tuning and post-training LLMs: hackable single-file recipes for full, LoRA, QLoRA, and preference tuning with native distributed training, written in plain PyTorch with minimal abstraction.",
    license: "BSD-3-Clause",
    tier: "sft",
    tags: ["fine-tuning", "pytorch", "recipes", "distributed"],
  },
  {
    title: "LitGPT",
    repo: "Lightning-AI/litgpt",
    url: "https://github.com/Lightning-AI/litgpt",
    description: "Lightning AI's from-scratch, dependency-light implementation of 20+ LLMs with recipes to pretrain, fine-tune (full/LoRA), and deploy them at scale — readable single-file models tuned for performance and distributed training.",
    license: "Apache-2.0",
    tier: "sft",
    tags: ["fine-tuning", "pretrain", "from-scratch", "lightning"],
  },
  {
    title: "XTuner",
    repo: "InternLM/xtuner",
    url: "https://github.com/InternLM/xtuner",
    description: "An efficient, flexible toolkit from the InternLM team for fine-tuning LLMs and VLMs: config-driven SFT, LoRA/QLoRA, and sequence-parallel training that scales from a single GPU to large clusters with high throughput.",
    license: "Apache-2.0",
    tier: "sft",
    tags: ["fine-tuning", "lora", "sequence-parallel", "vlm"],
  },
  {
    title: "ms-swift",
    repo: "modelscope/ms-swift",
    url: "https://github.com/modelscope/ms-swift",
    description: "ModelScope's framework for training and deploying 500+ LLMs and MLLMs: SFT, LoRA/QLoRA, DPO/PPO/GRPO, and multimodal fine-tuning through a CLI and Python API, with a broad catalog of supported model families.",
    license: "Apache-2.0",
    tier: "sft",
    tags: ["fine-tuning", "multimodal", "cli", "multi-model"],
  },
  {
    title: "Ludwig",
    repo: "ludwig-ai/ludwig",
    url: "https://github.com/ludwig-ai/ludwig",
    description: "A declarative, low-code framework for building and fine-tuning models from a single YAML config: it compiles a data schema plus a model spec into a training pipeline, with LLM fine-tuning (LoRA/QLoRA) alongside tabular and multimodal tasks.",
    license: "Apache-2.0",
    tier: "sft",
    tags: ["fine-tuning", "declarative", "low-code", "yaml-config"],
  },
  {
    title: "Oumi",
    repo: "oumi-ai/oumi",
    url: "https://github.com/oumi-ai/oumi",
    description: "An end-to-end open platform for the full model lifecycle — data curation, pretraining, SFT, LoRA, and preference tuning (DPO) through to evaluation and deployment — with reproducible configs that run from a laptop to a cluster.",
    license: "Apache-2.0",
    tier: "sft",
    tags: ["fine-tuning", "end-to-end", "reproducible", "lifecycle"],
  },
  {
    title: "AutoTrain Advanced",
    repo: "huggingface/autotrain-advanced",
    url: "https://github.com/huggingface/autotrain-advanced",
    description: "Hugging Face's no-code / low-code tool for automatically fine-tuning models: point it at a dataset and it handles LLM SFT, DPO, and reward modeling (plus vision and tabular tasks) locally or on managed infrastructure through a UI or CLI.",
    license: "Apache-2.0",
    tier: "sft",
    tags: ["fine-tuning", "no-code", "automl", "huggingface"],
  },

  // --- Tier 2: parameter-efficient tuning primitive -------------------------
  {
    title: "PEFT",
    repo: "huggingface/peft",
    url: "https://github.com/huggingface/peft",
    description: "Hugging Face's Parameter-Efficient Fine-Tuning library: the LoRA, QLoRA, adapter, prefix-tuning, and IA3 primitives that most fine-tuning toolkits build on, letting you adapt large models by training a tiny fraction of parameters.",
    license: "Apache-2.0",
    tier: "peft",
    tags: ["lora", "qlora", "adapters", "parameter-efficient"],
  },

  // --- Tier 3: preference / RL post-training --------------------------------
  {
    title: "TRL",
    repo: "huggingface/trl",
    url: "https://github.com/huggingface/trl",
    description: "Hugging Face's Transformer Reinforcement Learning library: the reference trainers for post-training LLMs — SFT, reward modeling, DPO, PPO, and GRPO — integrated with Transformers, PEFT, and Accelerate for single-GPU to multi-node runs.",
    license: "Apache-2.0",
    tier: "rlhf",
    tags: ["rlhf", "dpo", "ppo", "grpo"],
  },
  {
    title: "trlX",
    repo: "CarperAI/trlx",
    url: "https://github.com/CarperAI/trlx",
    description: "CarperAI's distributed framework for reinforcement-learning fine-tuning of large language models with PPO and ILQL, built to scale RLHF training to models with tens of billions of parameters across many GPUs.",
    license: "MIT",
    tier: "rlhf",
    tags: ["rlhf", "ppo", "ilql", "distributed"],
  },
  {
    title: "OpenRLHF",
    repo: "OpenRLHF/OpenRLHF",
    url: "https://github.com/OpenRLHF/OpenRLHF",
    description: "A high-performance, easy-to-use RLHF framework built on Ray, vLLM, DeepSpeed, and ZeRO-3: scalable PPO, GRPO, REINFORCE++, and DPO training that distributes the actor, critic, reward, and reference models across a cluster.",
    license: "Apache-2.0",
    tier: "rlhf",
    tags: ["rlhf", "ppo", "ray", "distributed"],
  },
  {
    title: "veRL",
    repo: "volcengine/verl",
    url: "https://github.com/volcengine/verl",
    description: "Volcano Engine's Reinforcement Learning library for LLMs (HybridFlow): a flexible, production-grade RL post-training engine with PPO, GRPO, and agentic RL, scaling rollout + training across large GPU clusters via Ray and FSDP/Megatron backends.",
    license: "Apache-2.0",
    tier: "rlhf",
    tags: ["rlhf", "grpo", "agentic-rl", "distributed"],
  },
  {
    title: "NeMo-Aligner",
    repo: "NVIDIA/NeMo-Aligner",
    url: "https://github.com/NVIDIA/NeMo-Aligner",
    description: "NVIDIA's scalable model-alignment toolkit built on NeMo and Megatron: SFT, reward modeling, PPO/RLHF, DPO, and SteerLM for aligning very large models, optimized for multi-node tensor/pipeline-parallel training.",
    license: "Apache-2.0",
    tier: "rlhf",
    tags: ["rlhf", "alignment", "megatron", "distributed"],
  },
  {
    title: "Open-Instruct",
    repo: "allenai/open-instruct",
    url: "https://github.com/allenai/open-instruct",
    description: "AI2's research codebase for instruction-tuning and post-training open models: the SFT, DPO, and RLVR/PPO recipes behind the Tulu model series, with reproducible training and evaluation pipelines.",
    license: "Apache-2.0",
    tier: "rlhf",
    tags: ["instruction-tuning", "dpo", "rlvr", "reproducible"],
  },

  // --- Tier 4: large-scale distributed pretraining engines ------------------
  {
    title: "DeepSpeed",
    repo: "deepspeedai/DeepSpeed",
    url: "https://github.com/deepspeedai/DeepSpeed",
    description: "A deep-learning optimization library that makes distributed training efficient and scalable: ZeRO memory partitioning, 3D parallelism, offloading, and mixed precision that let you train or fine-tune models far larger than a single GPU's memory.",
    license: "Apache-2.0",
    tier: "scale",
    tags: ["zero", "distributed", "memory-optimization", "parallelism"],
  },
  {
    title: "Megatron-LM",
    repo: "NVIDIA/Megatron-LM",
    url: "https://github.com/NVIDIA/Megatron-LM",
    description: "NVIDIA's research framework for training transformer models at massive scale: tensor, pipeline, sequence, and context parallelism with GPU-optimized kernels, the substrate many frontier-scale pretraining and continued-pretraining runs are built on.",
    license: "unknown",
    tier: "scale",
    tags: ["pretrain", "tensor-parallel", "pipeline-parallel", "large-scale"],
  },
  {
    title: "Nanotron",
    repo: "huggingface/nanotron",
    url: "https://github.com/huggingface/nanotron",
    description: "Hugging Face's minimalistic library for large-scale LLM pretraining with 3D parallelism: a small, hackable codebase that keeps tensor/pipeline/data parallelism readable while still scaling training across many GPUs.",
    license: "Apache-2.0",
    tier: "scale",
    tags: ["pretrain", "3d-parallelism", "minimal", "distributed"],
  },
  {
    title: "Levanter",
    repo: "stanford-crfm/levanter",
    url: "https://github.com/stanford-crfm/levanter",
    description: "Stanford CRFM's JAX-based framework for training foundation models that are legible, scalable, and bitwise-reproducible: built on Equinox and Haliax named tensors, it scales across TPU and GPU pods with deterministic results.",
    license: "Apache-2.0",
    tier: "scale",
    tags: ["pretrain", "jax", "reproducible", "tpu"],
  },
  {
    title: "GPT-NeoX",
    repo: "EleutherAI/gpt-neox",
    url: "https://github.com/EleutherAI/gpt-neox",
    description: "EleutherAI's library for training large-scale autoregressive language models on GPUs, built on Megatron and DeepSpeed: the battle-tested pretraining stack behind GPT-NeoX-20B and Pythia, with 3D parallelism and many architecture options.",
    license: "Apache-2.0",
    tier: "scale",
    tags: ["pretrain", "megatron", "deepspeed", "distributed"],
  },
];

// Human-readable description of each tier for the stub body.
const TIER_BLURB = {
  sft: "a supervised fine-tuning toolkit — it takes a base model plus a dataset and emits adapted weights (full / LoRA / QLoRA) from a config, no custom training loop required",
  peft: "the parameter-efficient-tuning primitive — the LoRA/QLoRA/adapter layer the fine-tuning toolkits build on, so you adapt a big model by training a tiny slice of it",
  rlhf: "a preference / reinforcement-learning post-training trainer — it aligns a model to human preferences or a reward with DPO, PPO, or GRPO after the supervised stage",
  scale: "a large-scale distributed training engine — the ZeRO / tensor-pipeline-parallel substrate that pretrains or continues-pretraining big models across many GPUs",
};

// --- Adapter ------------------------------------------------------------------

function trainingAdapter() {
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
      const tierBlurb = TIER_BLURB[item.tier] || "a model-training infrastructure component";

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
          tags: ["model-training", "fine-tuning", "post-training", "substrate", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when you need to produce or customize the model weights an agent runs on: it is ${tierBlurb}. Pick it at the point in the model lifecycle it covers — train / fine-tune (this stage) -> serve (inference engine) -> route (gateway) -> orchestrate (framework) -> agent.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's model-training infrastructure list — the fine-tuning / post-training / distributed-pretraining substrate that produces the weights, the mirror of the inference engines that serve them. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-voice.mjs) ----------------------------------

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
    const adapter = trainingAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[training] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[training] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[training] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
