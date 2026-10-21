#!/usr/bin/env node
// Component embedding-model / embedding-serving crawler. Curated list of the
// text-embedding layer that sits BETWEEN the retrieval data stores and the agent:
// the model families, libraries, inference servers, and API providers that turn
// text into the dense vectors the vector databases (crawl-vectordb) index and the
// graph stores (crawl-graphdb) annotate. This is distinct from both:
//   - the vector/graph DBs themselves (they STORE vectors; these PRODUCE them), and
//   - the RAG agent-memory FRAMEWORKS (Letta, cognee, graphiti — they orchestrate;
//     these are the embedding primitive those frameworks call).
// Currently absent across all 12 categories (TODO A7). Emits one component stub per
// entry into incoming/embeddings/ with type `infrastructure` (a deployable embedding
// service / substrate == infrastructure, consistent with crawl-vectordb/graphdb).
//
// Run:
//   node ingest/crawl-embeddings.mjs           # dry-run
//   node ingest/crawl-embeddings.mjs --apply   # write to incoming/embeddings/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-10-21";
const SOURCE_NAME = "embeddings";

// --- Shared helpers (mirrors crawl-vectordb.mjs) -----------------------------

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
// All entries are real, actively maintained embedding models, libraries, serving
// engines, or (for the dominant closed providers) hosted embedding APIs.
// Titles are chosen so slugs stay disjoint from the existing infrastructure list
// (e.g. "Infinity Embedding Server" avoids colliding with the vectordb "Infinity").

const records = [
  {
    title: "Sentence Transformers",
    repo: "UKPLab/sentence-transformers",
    url: "https://github.com/UKPLab/sentence-transformers",
    description: "The reference Python framework for computing dense text and image embeddings; load thousands of pretrained models, fine-tune your own, and run bi-encoder and cross-encoder retrieval out of the box.",
    license: "Apache-2.0",
    tags: ["library", "bi-encoder", "fine-tune", "python"],
  },
  {
    title: "FlagEmbedding BGE",
    repo: "FlagOpen/FlagEmbedding",
    url: "https://github.com/FlagOpen/FlagEmbedding",
    description: "BAAI's BGE family of open general-purpose embedding and reranker models (bge, bge-m3, bge-reranker) covering multilingual, multi-granularity, and dense/sparse/colbert retrieval in one toolkit.",
    license: "MIT",
    tags: ["model", "bge", "multilingual", "reranker"],
  },
  {
    title: "Text Embeddings Inference",
    repo: "huggingface/text-embeddings-inference",
    url: "https://github.com/huggingface/text-embeddings-inference",
    description: "Hugging Face's blazing-fast Rust server for deploying embedding, reranking, and sequence-classification models, with dynamic batching, ONNX/CUDA backends, and an OpenAI-compatible API.",
    license: "Apache-2.0",
    tags: ["serving", "rust", "reranker", "openai-compatible"],
  },
  {
    title: "Infinity Embedding Server",
    repo: "michaelfeil/infinity",
    url: "https://github.com/michaelfeil/infinity",
    description: "High-throughput REST server for embedding, reranking, and CLIP models that serves any Sentence-Transformers or Hugging Face model with dynamic batching and an OpenAI-compatible endpoint.",
    license: "MIT",
    tags: ["serving", "batching", "reranker", "openai-compatible"],
  },
  {
    title: "FastEmbed",
    repo: "qdrant/fastembed",
    url: "https://github.com/qdrant/fastembed",
    description: "Qdrant's lightweight, dependency-light Python library that generates dense, sparse, and late-interaction embeddings via quantized ONNX models — no PyTorch or GPU required for fast CPU inference.",
    license: "Apache-2.0",
    tags: ["library", "onnx", "cpu", "sparse"],
  },
  {
    title: "Nomic Embed",
    repo: "nomic-ai/contrastors",
    url: "https://github.com/nomic-ai/contrastors",
    description: "Nomic's fully open (weights, data, and training code) long-context text embedding models and the contrastive training framework behind them, a reproducible open alternative to closed embedding APIs.",
    license: "Apache-2.0",
    tags: ["model", "open-data", "long-context", "contrastive"],
  },
  {
    title: "Instructor Embedding",
    repo: "xlang-ai/instructor-embedding",
    url: "https://github.com/xlang-ai/instructor-embedding",
    description: "Instruction-finetuned text embedding model that tailors a single vector to any task or domain just by prepending a natural-language instruction, with no additional fine-tuning required.",
    license: "Apache-2.0",
    tags: ["model", "instruction-tuned", "task-aware", "python"],
  },
  {
    title: "GritLM",
    repo: "ContextualAI/gritlm",
    url: "https://github.com/ContextualAI/gritlm",
    description: "Generative Representational Instruction Tuning model that unifies text embedding and text generation in one LLM, switching between retrieval vectors and chat via instructions for RAG pipelines.",
    license: "MIT",
    tags: ["model", "llm", "generative", "unified"],
  },
  {
    title: "Model2Vec",
    repo: "MinishLab/model2vec",
    url: "https://github.com/MinishLab/model2vec",
    description: "Distills any Sentence-Transformer into a tiny static embedding model that is up to 500x smaller and 15x faster, producing lookup-table vectors for ultra-low-latency, CPU-only retrieval.",
    license: "MIT",
    tags: ["model", "static", "distillation", "fast"],
  },
  {
    title: "SGPT",
    repo: "Muennighoff/sgpt",
    url: "https://github.com/Muennighoff/sgpt",
    description: "GPT sentence embeddings for semantic search that turn decoder-only language models into strong bi-encoder and cross-encoder retrievers via prompt-based and fine-tuned pooling.",
    license: "MIT",
    tags: ["model", "gpt", "semantic-search", "research"],
  },
  {
    title: "ColBERT",
    repo: "stanford-futuredata/ColBERT",
    url: "https://github.com/stanford-futuredata/ColBERT",
    description: "Stanford's late-interaction retrieval model that embeds each token separately and scores with MaxSim, delivering higher accuracy than single-vector search while staying scalable over large corpora.",
    license: "MIT",
    tags: ["model", "late-interaction", "retrieval", "maxsim"],
  },
  {
    title: "RAGatouille",
    repo: "AnswerDotAI/RAGatouille",
    url: "https://github.com/AnswerDotAI/RAGatouille",
    description: "A high-level library that makes training, indexing, and searching with ColBERT late-interaction models a few lines of code, bridging state-of-the-art retrievers into everyday RAG stacks.",
    license: "Apache-2.0",
    tags: ["library", "colbert", "retrieval", "rag"],
  },
  {
    title: "AnglE Embedding",
    repo: "SeanLee97/AnglE",
    url: "https://github.com/SeanLee97/AnglE",
    description: "Angle-optimized text embedding framework and models that mitigate the cosine-saturation problem, offering a train-and-infer toolkit for high-quality sentence representations and STS tasks.",
    license: "MIT",
    tags: ["model", "sts", "fine-tune", "python"],
  },
  {
    title: "E5 Text Embeddings",
    repo: "microsoft/unilm",
    url: "https://github.com/microsoft/unilm/tree/master/e5",
    description: "Microsoft's E5 family of weakly-supervised contrastive text embeddings (small/base/large and multilingual variants) that use query/passage prefixes for strong zero-shot retrieval.",
    license: "MIT",
    tags: ["model", "contrastive", "multilingual", "microsoft"],
  },
  {
    title: "GTE General Text Embeddings",
    repo: "",
    url: "https://huggingface.co/Alibaba-NLP/gte-large-en-v1.5",
    description: "Alibaba's GTE family of general text embedding models (including long-context and multilingual variants) that top the MTEB leaderboard at compact sizes for efficient, high-accuracy retrieval.",
    license: "Apache-2.0",
    tags: ["model", "mteb", "long-context", "alibaba"],
  },
  {
    title: "Jina Embeddings",
    repo: "",
    url: "https://jina.ai/embeddings/",
    description: "Jina AI's open and hosted embedding models featuring 8K-token context, multilingual and multimodal (text + image) variants, served both as downloadable weights and a drop-in embedding API.",
    license: "proprietary",
    tags: ["model", "api", "long-context", "multimodal"],
  },
  {
    title: "Mixedbread Embed",
    repo: "",
    url: "https://www.mixedbread.com/docs/embeddings/overview",
    description: "Mixedbread's open and hosted mxbai embedding and reranker models with Matryoshka dimensionality and binary quantization support, letting you trade vector size for speed and storage.",
    license: "proprietary",
    tags: ["model", "api", "matryoshka", "reranker"],
  },
  {
    title: "OpenAI Embeddings",
    repo: "",
    url: "https://platform.openai.com/docs/guides/embeddings",
    description: "OpenAI's hosted text-embedding-3 (small/large) endpoint, a widely-used default for RAG that supports adjustable output dimensions and returns normalized vectors via a simple REST API.",
    license: "proprietary",
    tags: ["api", "hosted", "rag", "openai"],
  },
  {
    title: "Cohere Embed",
    repo: "",
    url: "https://docs.cohere.com/docs/embeddings",
    description: "Cohere's Embed v3 multilingual embedding API with input-type hints (search query vs. document), compression-aware int8/binary outputs, and strong retrieval quality across 100+ languages.",
    license: "proprietary",
    tags: ["api", "hosted", "multilingual", "cohere"],
  },
  {
    title: "Voyage AI Embeddings",
    repo: "",
    url: "https://docs.voyageai.com/docs/embeddings",
    description: "Voyage AI's hosted general and domain-specialized (code, law, finance) embedding and reranking models tuned for retrieval accuracy, a common high-quality drop-in for production RAG.",
    license: "proprietary",
    tags: ["api", "hosted", "domain-specific", "reranker"],
  },
  {
    title: "SimCSE",
    repo: "princeton-nlp/SimCSE",
    url: "https://github.com/princeton-nlp/SimCSE",
    description: "Princeton's simple contrastive learning framework for sentence embeddings, a foundational unsupervised and supervised recipe that underpins many modern open embedding models.",
    license: "MIT",
    tags: ["model", "contrastive", "research", "foundational"],
  },
  {
    title: "Infgrad Stella",
    repo: "",
    url: "https://huggingface.co/dunzhang/stella_en_1.5B_v5",
    description: "The stella / jasper family of distilled open embedding models that reach near-frontier MTEB scores at 1.5B and smaller, offering Matryoshka dimensions for cheap, high-accuracy English retrieval.",
    license: "MIT",
    tags: ["model", "mteb", "matryoshka", "distillation"],
  },
];

// --- Adapter ------------------------------------------------------------------

function embeddingsAdapter() {
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
          tags: ["embeddings", "retrieval", "rag", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when you need the embedding layer between your data and your retrieval store — turning text (or images) into the dense vectors a vector database indexes or a graph store annotates for agent memory and RAG.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's embedding-model / embedding-serving list — the primitive that produces the vectors the retrieval databases store. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-vectordb.mjs) -------------------------------

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
    const adapter = embeddingsAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[embeddings] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[embeddings] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[embeddings] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
