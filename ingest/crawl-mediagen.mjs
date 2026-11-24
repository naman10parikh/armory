#!/usr/bin/env node
// Component generative-media crawler. Curated list of the TEXT-TO-IMAGE and
// TEXT-TO-VIDEO generation stack — the infrastructure an agent reaches for when it
// must PRODUCE a picture or a clip rather than text: the local inference engines /
// node-graph workflow apps / diffusion libraries you run the models on, the open
// image-and-video model families (the weights), and the media-specialised hosted
// inference services.
//
// This opens a brand-new MODALITY axis. Every prior static crawl (A5-A27) built the
// text / retrieval / serving stack (vector + graph DB, embeddings, rerankers,
// docparse, gateways, frameworks, inference engines, training, caching, …), and the
// one modality crawl so far — crawl-voice (A15) — covered the SPEECH end. Nothing
// across all 12 categories covers the VISUAL end: the diffusion engines and image /
// video model families that turn a prompt into a frame. It is the exact visual
// parallel of A15:   agent / LLM  ->  media-generation engine (this)  ->  image/video.
//
// It is DISTINCT from the A24 LLM inference engines (those run an autoregressive
// forward pass for tokens; these run a diffusion / flow sampler for pixels), from the
// infra deploy/host entries already catalogued (Replicate is a GENERAL model host and
// is deliberately NOT re-added; fal.ai is the media-SPECIALISED host and IS included),
// and from the voice modality (A15, the speech-facing end). Verified absent in
// `infrastructure`: ComfyUI / Diffusers / InvokeAI / Fooocus / CogVideoX etc. appear
// in the catalog ONLY as `mcps` servers that WRAP one (comfyui-mcp, invokeai-mcp-
// server) or as `skills` (flux-schnell) — never as the generation engine/library
// itself in `infrastructure`; identity is type-scoped, so those cross-type
// appearances do not clash (same precedent as A14/A17-A27).
//
// Emits one component stub per entry into incoming/mediagen/ with type
// `infrastructure` (the same home as the inference engines and voice runtimes it sits
// beside; an installable generation engine/library == substrate). `infrastructure` is
// an under-represented category (thin), so this is a high-novelty Performance-Novelty
// fill on a previously-empty modality.
//
// Run:
//   node ingest/crawl-mediagen.mjs           # dry-run
//   node ingest/crawl-mediagen.mjs --apply   # write to incoming/mediagen/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-11-24";
const SOURCE_NAME = "mediagen";

// --- Shared helpers (mirrors crawl-caching.mjs) ------------------------------

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
// Each record: { title, repo ("owner/repo" or ""), url, description, license, tags }
// All entries are real generative-media infrastructure. Three tiers:
//   (1) ENGINES / LIBRARIES / WORKFLOW UIs — the local substrate you run the models on.
//   (2) MODEL FAMILIES — the open image/video weights the engines sample from.
//   (3) MEDIA-SPECIALISED HOSTS — managed inference tuned for gen-media.
// Licences stated only where confidently known; non-standard / RAIL / mixed-weight
// licences are kept `unknown` rather than guessed (per repo hard rules). Titles are
// chosen so slugs stay disjoint from the existing infrastructure list (sandboxes,
// browsers, deploy, inference engines, voice) and from each other.

const records = [
  // --- (1) Engines / libraries / workflow UIs -------------------------------
  {
    title: "ComfyUI",
    repo: "comfyanonymous/ComfyUI",
    url: "https://github.com/comfyanonymous/ComfyUI",
    description: "The most powerful node-graph engine for diffusion generation: build an image or video pipeline as a visual graph of loaders, samplers, conditioning, and post-processing nodes, run Stable Diffusion / SDXL / FLUX / video models locally, and save the exact graph as a reusable, shareable workflow. The de-facto backend many gen-media agents and tools drive.",
    license: "GPL-3.0",
    tags: ["image-generation", "video-generation", "node-graph", "diffusion", "self-host"],
  },
  {
    title: "Diffusers",
    repo: "huggingface/diffusers",
    url: "https://github.com/huggingface/diffusers",
    description: "Hugging Face's canonical diffusion library: load and run state-of-the-art text-to-image, image-to-image, inpainting, and text-to-video pipelines with a few lines of Python, swap schedulers and components, and train or fine-tune your own. The standard programmatic entry point for calling diffusion models from agent code.",
    license: "Apache-2.0",
    tags: ["image-generation", "video-generation", "diffusion", "library", "python"],
  },
  {
    title: "Stable Diffusion WebUI",
    repo: "AUTOMATIC1111/stable-diffusion-webui",
    url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
    description: "The reference browser UI for Stable Diffusion: txt2img, img2img, inpainting, upscaling, ControlNet and a vast extension ecosystem over a self-hosted API, making it a common local image-generation backend an agent or script can call over HTTP.",
    license: "AGPL-3.0",
    tags: ["image-generation", "web-ui", "diffusion", "self-host", "api"],
  },
  {
    title: "InvokeAI",
    repo: "invoke-ai/InvokeAI",
    url: "https://github.com/invoke-ai/InvokeAI",
    description: "A professional, self-hostable creative platform for Stable Diffusion / SDXL / FLUX: a unified canvas, node workflow editor, model manager, and REST API for txt2img, img2img, inpainting, and control models — a production-grade local image-generation server with a clean API surface.",
    license: "Apache-2.0",
    tags: ["image-generation", "web-ui", "node-graph", "diffusion", "self-host"],
  },
  {
    title: "Fooocus",
    repo: "lllyasviel/Fooocus",
    url: "https://github.com/lllyasviel/Fooocus",
    description: "A streamlined, offline image generator built on SDXL that hides the knobs: type a prompt and it handles sampling, refiners, and quality presets automatically. The simplest local text-to-image engine to stand up when an agent just needs a good picture without pipeline tuning.",
    license: "GPL-3.0",
    tags: ["image-generation", "sdxl", "diffusion", "self-host", "simple"],
  },
  {
    title: "SD.Next",
    repo: "vladmandic/sdnext",
    url: "https://github.com/vladmandic/sdnext",
    description: "An all-in-one diffusion generation app supporting dozens of image and video model families (SD, SDXL, SD3, FLUX, and more) across multiple backends and accelerators, with a web UI plus API — a broad, actively-maintained local alternative backend for gen-media workloads.",
    license: "unknown",
    tags: ["image-generation", "video-generation", "web-ui", "diffusion", "self-host"],
  },
  {
    title: "SwarmUI",
    repo: "mcmonkeyprojects/SwarmUI",
    url: "https://github.com/mcmonkeyprojects/SwarmUI",
    description: "A modular diffusion web interface built on top of ComfyUI as its backend: an accessible front end for easy image and video generation plus full access to the underlying node graph for power users, with multi-GPU and queue management — bridges a simple UI and the ComfyUI engine.",
    license: "MIT",
    tags: ["image-generation", "video-generation", "web-ui", "comfyui", "self-host"],
  },
  // --- (2) Open image / video model families --------------------------------
  {
    title: "FLUX",
    repo: "black-forest-labs/flux",
    url: "https://github.com/black-forest-labs/flux",
    description: "Black Forest Labs' FLUX.1 family of rectified-flow text-to-image transformers and the official inference code — a leading open image-generation model known for strong prompt adherence and typography. Runs in ComfyUI / Diffusers; weight variants carry different terms, so check each release.",
    license: "Apache-2.0",
    tags: ["image-generation", "model", "flow-transformer", "weights"],
  },
  {
    title: "Stability Generative Models",
    repo: "Stability-AI/generative-models",
    url: "https://github.com/Stability-AI/generative-models",
    description: "Stability AI's official repository for the Stable Diffusion image models (SDXL, SD 2.x, SD3-era releases) and Stable Video Diffusion: reference sampling, configs, and weights for the foundational open diffusion family that most engines and fine-tunes build on. Model weights carry non-standard RAIL-style terms.",
    license: "unknown",
    tags: ["image-generation", "video-generation", "model", "diffusion", "weights"],
  },
  {
    title: "PixArt",
    repo: "PixArt-alpha/PixArt-sigma",
    url: "https://github.com/PixArt-alpha/PixArt-sigma",
    description: "A family of efficient diffusion-transformer text-to-image models (PixArt-α / PixArt-Σ) that reach high-resolution photorealistic quality at a fraction of the training cost of comparable models — an open, lightweight alternative image backbone for self-hosted generation.",
    license: "unknown",
    tags: ["image-generation", "model", "diffusion-transformer", "weights"],
  },
  {
    title: "AnimateDiff",
    repo: "guoyww/AnimateDiff",
    url: "https://github.com/guoyww/AnimateDiff",
    description: "A motion module that turns a personalized text-to-image diffusion model into an animation generator without model-specific tuning: inject learned temporal motion into Stable Diffusion / SDXL to produce short animated clips from a prompt — a widely-used path to text-to-video on top of existing image models.",
    license: "Apache-2.0",
    tags: ["video-generation", "animation", "model", "diffusion", "weights"],
  },
  {
    title: "CogVideoX",
    repo: "THUDM/CogVideo",
    url: "https://github.com/THUDM/CogVideo",
    description: "An open text-to-video and image-to-video diffusion-transformer family (CogVideoX) with released weights and inference code that generates multi-second clips from a prompt, runnable locally via Diffusers or ComfyUI — one of the stronger open video-generation models.",
    license: "Apache-2.0",
    tags: ["video-generation", "model", "diffusion-transformer", "weights"],
  },
  {
    title: "Open-Sora",
    repo: "hpcaitech/Open-Sora",
    url: "https://github.com/hpcaitech/Open-Sora",
    description: "A fully open text-to-video project — model, training recipe, and inference code — aiming to reproduce Sora-class video generation efficiently, so teams can run or fine-tune their own open video model instead of calling a closed API.",
    license: "Apache-2.0",
    tags: ["video-generation", "model", "diffusion-transformer", "weights", "training"],
  },
  {
    title: "Genmo Mochi",
    repo: "genmoai/models",
    url: "https://github.com/genmoai/models",
    description: "Genmo's open text-to-video model (Mochi 1) with released weights and inference code, built on an asymmetric diffusion-transformer for high-fidelity motion and prompt adherence — a self-hostable open alternative for generating video clips from text.",
    license: "Apache-2.0",
    tags: ["video-generation", "model", "diffusion-transformer", "weights"],
  },
  {
    title: "LTX-Video",
    repo: "Lightricks/LTX-Video",
    url: "https://github.com/Lightricks/LTX-Video",
    description: "Lightricks' real-time-oriented open text-to-video and image-to-video DiT model that generates clips faster than they play back on suitable hardware, with released weights and ComfyUI / Diffusers support — the speed-focused option for self-hosted video generation. Weights ship under a non-standard open-RAIL licence.",
    license: "unknown",
    tags: ["video-generation", "model", "real-time", "diffusion-transformer", "weights"],
  },
  {
    title: "HunyuanVideo",
    repo: "Tencent-Hunyuan/HunyuanVideo",
    url: "https://github.com/Tencent-Hunyuan/HunyuanVideo",
    description: "Tencent's large open text-to-video foundation model with released weights and inference code, producing high-quality, high-motion clips at competitive scale — a self-hostable open video generator. Distributed under Tencent's non-standard community licence, so review terms before use.",
    license: "unknown",
    tags: ["video-generation", "model", "foundation-model", "weights"],
  },
  {
    title: "Wan 2.1",
    repo: "Wan-Video/Wan2.1",
    url: "https://github.com/Wan-Video/Wan2.1",
    description: "Alibaba's Wan open video-generation suite: text-to-video and image-to-video models with released weights and code spanning multiple sizes, including a small variant that runs on consumer GPUs — a broadly-capable, Apache-licensed option for local video generation.",
    license: "Apache-2.0",
    tags: ["video-generation", "model", "foundation-model", "weights"],
  },
  {
    title: "Stable Video Diffusion",
    repo: "",
    url: "https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt",
    description: "Stability AI's image-to-video diffusion model: condition on a single still image and generate a short coherent video clip, runnable via Diffusers or ComfyUI — a foundational open image-to-video model. Released under a non-standard, research-oriented licence.",
    license: "unknown",
    tags: ["video-generation", "image-to-video", "model", "diffusion", "weights"],
  },
  // --- (3) Media-specialised hosted inference --------------------------------
  {
    title: "fal.ai",
    repo: "",
    url: "https://fal.ai/",
    description: "A generative-media inference cloud optimized for fast image, video, and audio models: a pay-per-use API and SDKs serving FLUX, SDXL, video and other gen-media models on tuned infrastructure, so an agent can generate media without running a local diffusion stack. Media-specialised, distinct from general model hosts.",
    license: "proprietary",
    tags: ["image-generation", "video-generation", "hosted", "api", "serverless"],
  },
];

// --- Adapter ------------------------------------------------------------------

function mediagenAdapter() {
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
          maturity: "experimental",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: [...new Set(["generative-media", "infrastructure", ...(item.tags || [])])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when an agent must PRODUCE a picture or a video clip rather than text — the generative-media (text-to-image / text-to-video) layer of a harness. An engine/library here runs the diffusion or flow sampler locally; a model family provides the open weights it samples from; a media-specialised host serves them over an API. This is the visual parallel of the voice modality: agent/LLM -> media-generation engine (this) -> image/video.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's generative-media list — the text-to-image / text-to-video modality, distinct from the LLM (token) inference engines and from the voice (speech) modality. Weight licences on open model families vary per release; confirm terms before use. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-caching.mjs) -------------------------------

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
    const adapter = mediagenAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[mediagen] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[mediagen] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[mediagen] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
