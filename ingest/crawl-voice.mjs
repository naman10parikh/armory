#!/usr/bin/env node
// Component voice-agent crawler. Curated list of the VOICE AI infrastructure an
// agent harness needs to *speak and listen* in real time — the layer that turns a
// text-only agent into a live conversational one. Three tiers, all previously
// absent as first-class components:
//   1. Real-time voice-agent orchestration frameworks (Pipecat, LiveKit Agents,
//      Vocode) — the pipeline that wires transport + STT + LLM + TTS into a
//      low-latency turn-taking loop with interruption/VAD handling.
//   2. Hosted voice-agent platforms (Vapi, Retell AI, Bland AI) — managed
//      end-to-end telephony/voice-agent stacks.
//   3. The building blocks those pipelines call: STT (Deepgram, AssemblyAI,
//      Speechmatics, OpenAI Whisper, faster-whisper), TTS (ElevenLabs, Cartesia,
//      Rime, Kokoro), full-duplex speech models (OpenAI Realtime API, Moshi,
//      Ultravox), WebRTC transport (Daily), VAD (Silero VAD), and noise
//      cancellation (Krisp).
// The whole arc: transport + VAD -> STT -> agent framework/LLM -> TTS -> transport.
// Previously absent across all 12 categories: the only hits for pipecat/vapi/
// retell were MCP SERVERS that *mention* a voice tool (pipecat-docs-mcp,
// matthewdcage-vapi-voice-ai, retell-ai-mcp-server) — never the voice framework/
// platform itself. The infrastructure list holds compute SANDBOXES (E2B, Modal),
// model INFERENCE engines (vLLM, llama.cpp), the retrieval substrate (vector/graph
// DB, embeddings, rerankers, docparse, gateways), and agent frameworks (A14) — but
// nothing for the speech/real-time modality. Emits one stub per entry into
// incoming/voice/ with type `infrastructure` (an installable voice runtime/engine
// == substrate, consistent with the inference-engine and framework entries already
// there). All emitted slugs verified disjoint vs brain/components/infrastructure.
//
// Run:
//   node ingest/crawl-voice.mjs           # dry-run
//   node ingest/crawl-voice.mjs --apply   # write to incoming/voice/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-10-27";
const SOURCE_NAME = "voice";

// --- Shared helpers (mirrors crawl-frameworks.mjs) ---------------------------

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
// tier, tags }. All entries are real, actively maintained voice-AI components.
// Titles slugify disjoint from the existing infrastructure list and from each
// other. A few names also appear under OTHER types (incidental mcps that mention
// a voice tool) — identity is type-scoped, so there is no clash in
// `infrastructure`. Where a component is a proprietary hosted API with no single
// canonical repo, license is left "unknown" rather than guessed.

const records = [
  // --- Tier 1: real-time voice-agent orchestration frameworks ---------------
  {
    title: "Pipecat",
    repo: "pipecat-ai/pipecat",
    url: "https://github.com/pipecat-ai/pipecat",
    description: "An open-source Python framework for real-time voice and multimodal conversational agents: a streaming pipeline of frame processors wires transport, STT, LLM, and TTS together with built-in interruption handling, VAD, and sub-second turn-taking.",
    license: "BSD-2-Clause",
    tier: "framework",
    tags: ["real-time", "pipeline", "turn-taking", "python"],
  },
  {
    title: "LiveKit Agents",
    repo: "livekit/agents",
    url: "https://github.com/livekit/agents",
    description: "LiveKit's framework for building real-time voice and video AI agents on top of WebRTC: a worker runtime that joins rooms, streams audio to STT/LLM/TTS or speech-to-speech models, and handles interruptions, VAD, and telephony.",
    license: "Apache-2.0",
    tier: "framework",
    tags: ["webrtc", "real-time", "agents", "python"],
  },
  {
    title: "Vocode",
    repo: "vocodedev/vocode-core",
    url: "https://github.com/vocodedev/vocode-core",
    description: "An open-source library for building voice-based LLM applications: compose transcribers, agents, and synthesizers into streaming phone and web voice bots, with pluggable STT/TTS providers and telephony integrations.",
    license: "MIT",
    tier: "framework",
    tags: ["voice-bots", "telephony", "streaming", "python"],
  },

  // --- Tier 2: hosted voice-agent platforms ---------------------------------
  {
    title: "Vapi",
    repo: "",
    url: "https://vapi.ai",
    description: "A hosted platform for building, testing, and deploying voice agents: a managed orchestration layer over STT, LLM, and TTS with telephony, function/tool calling, and configurable turn-taking exposed through an API and SDKs.",
    license: "unknown",
    tier: "platform",
    tags: ["hosted", "telephony", "managed", "api"],
  },
  {
    title: "Retell AI",
    repo: "",
    url: "https://www.retellai.com",
    description: "A hosted conversational voice-AI platform for building and running phone agents: a managed real-time pipeline (STT, LLM, TTS) with low-latency turn-taking, call transfer, and knowledge/tool integration behind an API.",
    license: "unknown",
    tier: "platform",
    tags: ["hosted", "phone-agents", "real-time", "api"],
  },
  {
    title: "Bland AI",
    repo: "",
    url: "https://www.bland.ai",
    description: "A hosted platform for programmable AI phone calls: a managed voice-agent stack with conversational pathways, tool calling, and telephony for inbound and outbound calls, invoked through an API.",
    license: "unknown",
    tier: "platform",
    tags: ["hosted", "phone", "pathways", "api"],
  },

  // --- Tier 3a: speech-to-text (STT) ----------------------------------------
  {
    title: "Deepgram",
    repo: "deepgram/deepgram-python-sdk",
    url: "https://deepgram.com",
    description: "A speech platform offering fast, accurate streaming and batch speech-to-text plus text-to-speech, widely used as the STT/TTS layer in real-time voice agents; accessed through a WebSocket/REST API and official SDKs.",
    license: "unknown",
    tier: "stt",
    tags: ["stt", "tts", "streaming", "api"],
  },
  {
    title: "AssemblyAI",
    repo: "AssemblyAI/assemblyai-python-sdk",
    url: "https://www.assemblyai.com",
    description: "A speech-to-text API with real-time streaming transcription plus audio-intelligence models (diarization, sentiment, summarization), commonly used as the transcription stage of a voice-agent pipeline.",
    license: "unknown",
    tier: "stt",
    tags: ["stt", "streaming", "audio-intelligence", "api"],
  },
  {
    title: "Speechmatics",
    repo: "",
    url: "https://www.speechmatics.com",
    description: "An enterprise speech-to-text engine with real-time and batch transcription across many languages and accents, used as the STT component in conversational and telephony voice systems.",
    license: "unknown",
    tier: "stt",
    tags: ["stt", "multilingual", "real-time", "api"],
  },
  {
    title: "OpenAI Whisper",
    repo: "openai/whisper",
    url: "https://github.com/openai/whisper",
    description: "OpenAI's open-source automatic speech-recognition model and inference code: robust multilingual transcription and translation, a common self-hosted STT building block for voice agents and audio pipelines.",
    license: "MIT",
    tier: "stt",
    tags: ["stt", "open-weights", "multilingual", "self-hosted"],
  },
  {
    title: "faster-whisper",
    repo: "SYSTRAN/faster-whisper",
    url: "https://github.com/SYSTRAN/faster-whisper",
    description: "A CTranslate2 reimplementation of Whisper that transcribes several times faster with lower memory use, the go-to high-throughput self-hosted STT backend for real-time and batch voice pipelines.",
    license: "MIT",
    tier: "stt",
    tags: ["stt", "ctranslate2", "fast", "self-hosted"],
  },

  // --- Tier 3b: text-to-speech (TTS) ----------------------------------------
  {
    title: "ElevenLabs",
    repo: "elevenlabs/elevenlabs-python",
    url: "https://elevenlabs.io",
    description: "A text-to-speech and voice platform producing highly natural, low-latency speech with voice cloning and a streaming API — a widely used TTS stage for conversational voice agents.",
    license: "unknown",
    tier: "tts",
    tags: ["tts", "voice-cloning", "streaming", "api"],
  },
  {
    title: "Cartesia",
    repo: "cartesia-ai/cartesia-python",
    url: "https://cartesia.ai",
    description: "A real-time text-to-speech platform built on state-space models (Sonic) for ultra-low-latency streaming speech, designed for interactive voice agents; accessed through a streaming API and SDKs.",
    license: "unknown",
    tier: "tts",
    tags: ["tts", "low-latency", "streaming", "api"],
  },
  {
    title: "Rime",
    repo: "",
    url: "https://rime.ai",
    description: "A text-to-speech API focused on natural, conversational, low-latency voices for production voice agents and contact-center automation, with on-prem and streaming options.",
    license: "unknown",
    tier: "tts",
    tags: ["tts", "conversational", "low-latency", "api"],
  },
  {
    title: "Kokoro",
    repo: "hexgrad/kokoro",
    url: "https://github.com/hexgrad/kokoro",
    description: "An open-weight, compact text-to-speech model that delivers high-quality speech from a small (~82M-parameter) footprint, a popular self-hosted TTS building block for cost-sensitive voice pipelines.",
    license: "Apache-2.0",
    tier: "tts",
    tags: ["tts", "open-weights", "lightweight", "self-hosted"],
  },

  // --- Tier 3c: full-duplex / speech-to-speech models -----------------------
  {
    title: "OpenAI Realtime API",
    repo: "",
    url: "https://platform.openai.com/docs/guides/realtime",
    description: "OpenAI's low-latency speech-to-speech API: stream audio in and out over WebSocket/WebRTC to a model that listens, reasons, and speaks with tool calling and interruption — a single-model alternative to a separate STT+LLM+TTS chain.",
    license: "unknown",
    tier: "realtime",
    tags: ["speech-to-speech", "real-time", "tool-calling", "api"],
  },
  {
    title: "Moshi",
    repo: "kyutai-labs/moshi",
    url: "https://github.com/kyutai-labs/moshi",
    description: "Kyutai's open full-duplex speech-text foundation model and inference stack: it listens and speaks simultaneously with very low latency, enabling natural interruption and overlap for self-hosted real-time voice agents.",
    license: "MIT",
    tier: "realtime",
    tags: ["full-duplex", "speech-to-speech", "open-weights", "low-latency"],
  },
  {
    title: "Ultravox",
    repo: "fixie-ai/ultravox",
    url: "https://github.com/fixie-ai/ultravox",
    description: "An open, fast multimodal speech LLM that consumes audio directly (skipping a separate STT step) to respond to spoken input with low latency — a self-hosted speech-in building block for voice agents.",
    license: "MIT",
    tier: "realtime",
    tags: ["speech-llm", "multimodal", "open-weights", "low-latency"],
  },

  // --- Tier 3d: transport / VAD / audio front-end ---------------------------
  {
    title: "Daily",
    repo: "",
    url: "https://www.daily.co",
    description: "A WebRTC platform providing the real-time audio/video transport layer for voice agents — low-latency media rooms, SIP/telephony dial-in, and SDKs widely paired with Pipecat and other voice frameworks.",
    license: "unknown",
    tier: "transport",
    tags: ["webrtc", "transport", "telephony", "api"],
  },
  {
    title: "Silero VAD",
    repo: "snakers4/silero-vad",
    url: "https://github.com/snakers4/silero-vad",
    description: "A fast, lightweight, pre-trained voice-activity-detection model that segments speech from silence in streaming audio — the standard VAD used to trigger turn-taking and endpointing in real-time voice pipelines.",
    license: "MIT",
    tier: "vad",
    tags: ["vad", "endpointing", "lightweight", "self-hosted"],
  },
  {
    title: "Krisp",
    repo: "",
    url: "https://krisp.ai",
    description: "A real-time audio-enhancement SDK providing noise cancellation, echo removal, and accent/voice processing — the audio clean-up front-end that improves STT accuracy and call quality in voice agents.",
    license: "unknown",
    tier: "audio",
    tags: ["noise-cancellation", "audio-enhancement", "sdk", "real-time"],
  },
];

// Human-readable description of each tier for the stub body.
const TIER_BLURB = {
  framework: "a real-time voice-agent orchestration framework — the pipeline that wires transport, speech-to-text, the LLM, and text-to-speech into a low-latency turn-taking loop",
  platform: "a hosted voice-agent platform — a managed end-to-end stack (telephony + STT + LLM + TTS) you configure through an API rather than assemble yourself",
  stt: "the speech-to-text stage — turning the caller's audio into text for the agent",
  tts: "the text-to-speech stage — turning the agent's text into spoken audio",
  realtime: "a full-duplex speech-to-speech model — a single model that listens and speaks directly, collapsing the STT+LLM+TTS chain into one low-latency step",
  transport: "the real-time media transport layer (WebRTC/telephony) that carries audio to and from the agent",
  vad: "voice-activity detection — segmenting speech from silence to drive turn-taking and endpointing",
  audio: "the audio front-end — cleaning up the input signal (noise, echo) before it reaches speech recognition",
};

// --- Adapter ------------------------------------------------------------------

function voiceAdapter() {
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
      const tierBlurb = TIER_BLURB[item.tier] || "a voice-AI infrastructure component";

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
          tags: ["voice-ai", "speech", "real-time", "substrate", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when you are giving an agent a real-time voice: it is ${tierBlurb}. Pick it at the point in the voice pipeline it covers — the full arc is transport + VAD -> STT -> agent/LLM -> TTS -> transport.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's voice-AI infrastructure list — the speech/real-time substrate that turns a text-only agent into a conversational one. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-frameworks.mjs) -----------------------------

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
    const adapter = voiceAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[voice] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[voice] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[voice] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
