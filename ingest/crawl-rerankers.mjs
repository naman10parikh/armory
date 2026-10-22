#!/usr/bin/env node
// Component reranker / cross-encoder crawler. Curated list of the SECOND-stage
// retrieval primitive that sits AFTER recall: given a query and a candidate set
// surfaced by an embedding/vector store (crawl-embeddings / crawl-vectordb) or a
// graph store (crawl-graphdb), a reranker re-scores every candidate against the
// query to maximise precision@k before the top passages reach the LLM. This is
// the precision stage every production RAG stack adds on top of recall, and it is
// distinct from the layers already catalogued:
//   - embeddings PRODUCE vectors for cheap approximate recall (bi-encoder);
//   - vector/graph DBs STORE and nearest-neighbour those vectors (recall);
//   - rerankers RE-ORDER the recalled set with a slower, query-aware model
//     (cross-encoder, late-interaction, or listwise LLM) for higher accuracy.
// Previously absent across all 12 categories (TODO A8; only grazed by crawl-embeddings,
// where a few serving engines happen to also expose rerank). Emits one component stub
// per entry into incoming/rerankers/ with type `infrastructure` (a deployable rerank
// service / model == infrastructure, consistent with crawl-vectordb/graphdb/embeddings).
//
// Run:
//   node ingest/crawl-rerankers.mjs           # dry-run
//   node ingest/crawl-rerankers.mjs --apply   # write to incoming/rerankers/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-10-22";
const SOURCE_NAME = "rerankers";

// --- Shared helpers (mirrors crawl-embeddings.mjs) ---------------------------

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
// All entries are real, actively maintained reranker / cross-encoder models,
// libraries, or hosted rerank APIs. Titles are chosen so slugs stay disjoint from
// the existing infrastructure list AND from the embedding entries (crawl-embeddings)
// that share a vendor name — e.g. "BGE Reranker" vs. the embedding "FlagEmbedding BGE",
// "Cohere Rerank" vs. "Cohere Embed", "mxbai Rerank" vs. "Mixedbread Embed".

const records = [
  {
    title: "rerankers",
    repo: "AnswerDotAI/rerankers",
    url: "https://github.com/AnswerDotAI/rerankers",
    description: "A tiny unified Python API for reranking: swap between cross-encoders, ColBERT late-interaction, T5, LLM listwise rankers, and the Cohere/Jina/Voyage APIs behind one interface so you can change rerankers in a single line.",
    license: "Apache-2.0",
    tags: ["library", "unified-api", "python", "rag"],
  },
  {
    title: "BGE Reranker",
    repo: "FlagOpen/FlagEmbedding",
    url: "https://github.com/FlagOpen/FlagEmbedding",
    description: "BAAI's open bge-reranker family (bge-reranker-v2-m3, bge-reranker-v2-gemma, large/base) — multilingual cross-encoder models that directly output a query-passage relevance score to reorder a recall set for RAG.",
    license: "MIT",
    tags: ["model", "cross-encoder", "multilingual", "open-weights"],
  },
  {
    title: "Jina Reranker",
    repo: "",
    url: "https://jina.ai/reranker/",
    description: "Jina AI's jina-reranker-v2 multilingual cross-encoder, served as open weights and a hosted API, that re-scores retrieved documents (and code / function-calling candidates) against the query with long-context support.",
    license: "proprietary",
    tags: ["model", "api", "cross-encoder", "multilingual"],
  },
  {
    title: "Cohere Rerank",
    repo: "",
    url: "https://docs.cohere.com/docs/rerank",
    description: "Cohere's hosted Rerank endpoint (rerank-v3.5, multilingual) that takes a query and a list of documents and returns them re-ordered by relevance score, a widely-used drop-in precision stage for production RAG.",
    license: "proprietary",
    tags: ["api", "hosted", "multilingual", "cohere"],
  },
  {
    title: "Voyage Rerank",
    repo: "",
    url: "https://docs.voyageai.com/docs/reranker",
    description: "Voyage AI's hosted reranker models (rerank-2, rerank-2-lite) that re-score a query against candidate documents for higher retrieval accuracy, pairing with Voyage's embedding models in a two-stage RAG pipeline.",
    license: "proprietary",
    tags: ["api", "hosted", "cross-encoder", "voyage"],
  },
  {
    title: "mxbai Rerank",
    repo: "mixedbread-ai/mxbai-rerank",
    url: "https://github.com/mixedbread-ai/mxbai-rerank",
    description: "Mixedbread's open-weight mxbai-rerank-v2 family — Apache-licensed cross-encoder rerankers competitive with closed APIs, usable locally via Sentence-Transformers or served for a self-hosted precision stage.",
    license: "Apache-2.0",
    tags: ["model", "cross-encoder", "open-weights", "self-host"],
  },
  {
    title: "FlashRank",
    repo: "PrithivirajDamodaran/FlashRank",
    url: "https://github.com/PrithivirajDamodaran/FlashRank",
    description: "An ultra-light, super-fast Python reranking library built on tiny quantized ONNX cross-encoders that adds a precision rerank stage to any search or RAG pipeline with no GPU and almost no dependencies.",
    license: "Apache-2.0",
    tags: ["library", "onnx", "cpu", "fast"],
  },
  {
    title: "RankLLM",
    repo: "castorini/rank_llm",
    url: "https://github.com/castorini/rank_llm",
    description: "A toolkit for listwise reranking with large language models, home of RankZephyr and RankVicuna, that prompts or fine-tunes an LLM to re-order a candidate passage window end-to-end for state-of-the-art accuracy.",
    license: "Apache-2.0",
    tags: ["library", "listwise", "llm", "research"],
  },
  {
    title: "RankGPT",
    repo: "sunnweiwei/RankGPT",
    url: "https://github.com/sunnweiwei/RankGPT",
    description: "The reference implementation of using GPT-style LLMs as zero-shot listwise relevance rankers via a sliding-window permutation prompt, showing frontier models can rerank passages without any task-specific training.",
    license: "MIT",
    tags: ["model", "listwise", "zero-shot", "llm"],
  },
  {
    title: "PyGaggle monoT5",
    repo: "castorini/pygaggle",
    url: "https://github.com/castorini/pygaggle",
    description: "Castorini's reranking toolkit built on T5 — monoT5 pointwise and duoT5 pairwise rerankers that cast relevance scoring as sequence-to-sequence true/false generation, a strong classical neural rerank baseline.",
    license: "Apache-2.0",
    tags: ["library", "t5", "pointwise", "pairwise"],
  },
  {
    title: "MS MARCO Cross-Encoders",
    repo: "",
    url: "https://huggingface.co/cross-encoder/ms-marco-MiniLM-L-6-v2",
    description: "The canonical MS MARCO cross-encoder reranker models (ms-marco-MiniLM, ms-marco-TinyBERT) released for Sentence-Transformers — small, fast query-passage scorers that remain a default, battle-tested rerank baseline.",
    license: "Apache-2.0",
    tags: ["model", "cross-encoder", "minilm", "baseline"],
  },
  {
    title: "BCE Reranker",
    repo: "netease-youdao/BCEmbedding",
    url: "https://github.com/netease-youdao/BCEmbedding",
    description: "NetEase Youdao's open bce-reranker-base, a bilingual (Chinese/English) and crosslingual cross-encoder tuned for RAG that also emits a calibrated meaningful relevance score usable as a hard relevance threshold.",
    license: "Apache-2.0",
    tags: ["model", "cross-encoder", "bilingual", "open-weights"],
  },
  {
    title: "TART Instruction Reranker",
    repo: "facebookresearch/tart",
    url: "https://github.com/facebookresearch/tart",
    description: "Task-aware Retrieval with Instructions: a cross-encoder reranker that conditions relevance on a natural-language instruction, so the same model reorders results differently for different retrieval intents without retraining.",
    license: "CC-BY-NC-4.0",
    tags: ["model", "instruction-tuned", "cross-encoder", "research"],
  },
  {
    title: "ZeroEntropy zerank",
    repo: "zeroentropy-ai/zerank",
    url: "https://github.com/zeroentropy-ai/zerank",
    description: "ZeroEntropy's open zerank reranker models, Apache-licensed cross-encoders trained for retrieval precision that are released as downloadable weights alongside a hosted rerank API for self-hosted or managed use.",
    license: "Apache-2.0",
    tags: ["model", "cross-encoder", "open-weights", "api"],
  },
  {
    title: "Metarank",
    repo: "metarank/metarank",
    url: "https://github.com/metarank/metarank",
    description: "An open-source secondary-ranking and learning-to-rank service: a deployable real-time reranker that ingests feedback events and feature vectors to re-order search and recommendation results via LambdaMART and XGBoost models.",
    license: "Apache-2.0",
    tags: ["service", "learning-to-rank", "self-host", "real-time"],
  },
  {
    title: "NVIDIA NeMo Retriever Reranking",
    repo: "",
    url: "https://build.nvidia.com/nvidia/rerank-qa-mistral-4b",
    description: "NVIDIA's NeMo Retriever reranking NIM microservices (nv-rerankqa-mistral, llama-3.2-nv-rerankqa) that re-score retrieved passages for enterprise RAG, served as GPU-accelerated containers with an OpenAI-style rerank API.",
    license: "proprietary",
    tags: ["service", "nim", "gpu", "enterprise"],
  },
  {
    title: "Pinecone Rerank",
    repo: "",
    url: "https://docs.pinecone.io/guides/search/rerank-results",
    description: "Pinecone's hosted reranking step (serving models such as bge-reranker-v2-m3 and cohere-rerank) that re-orders a vector-search candidate set inside the managed Pinecone pipeline, so recall and rerank live behind one API.",
    license: "proprietary",
    tags: ["api", "hosted", "managed", "pinecone"],
  },
  {
    title: "LLM Rankers",
    repo: "ielab/llm-rankers",
    url: "https://github.com/ielab/llm-rankers",
    description: "A research toolkit implementing pointwise, pairwise, listwise, and setwise LLM reranking strategies in one place, for benchmarking how different prompting schemes trade off accuracy against LLM calls when reordering passages.",
    license: "Apache-2.0",
    tags: ["library", "setwise", "llm", "research"],
  },
  {
    title: "RankT5",
    repo: "",
    url: "https://huggingface.co/Soyoung97/RankT5-large",
    description: "Google Research's RankT5, a T5 encoder-decoder fine-tuned directly with ranking losses (pointwise and listwise) to output relevance scores, improving over monoT5-style true/false generation for passage reranking.",
    license: "Apache-2.0",
    tags: ["model", "t5", "listwise", "research"],
  },
];

// --- Adapter ------------------------------------------------------------------

function rerankersAdapter() {
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
          maturity: "stable",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: ["rerank", "reranker", "retrieval", "rag", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} as the precision stage of retrieval — after a vector or graph store returns a cheap approximate recall set, a reranker re-scores each candidate against the query so the most relevant passages reach the LLM, lifting precision@k in a RAG or agent-memory pipeline.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's reranker / cross-encoder list — the second-stage retrieval primitive that reorders what the embedding and vector/graph layers recall. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-embeddings.mjs) -----------------------------

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
    const adapter = rerankersAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[rerankers] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[rerankers] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[rerankers] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
