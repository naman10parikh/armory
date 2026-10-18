#!/usr/bin/env node
// Component vector-database crawler. Curated list of vector / retrieval databases
// and approximate-nearest-neighbor (ANN) engines — the storage-and-search
// substrate that powers agent memory and RAG. These are distinct from both the
// compute/sandbox-heavy infrastructure list (runtimes, browsers, payment rails)
// and the agent-memory-FRAMEWORK list (Letta, Zep, cognee, graphiti): a vector DB
// is the data layer those frameworks index into. Emits one component stub per
// engine into incoming/vectordb/ with type `infrastructure` (a deployable
// retrieval service == infrastructure).
//
// Run:
//   node ingest/crawl-vectordb.mjs           # dry-run
//   node ingest/crawl-vectordb.mjs --apply   # write to incoming/vectordb/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-10-18";
const SOURCE_NAME = "vectordb";

// --- Shared helpers (mirrors crawl-guardrails.mjs) ---------------------------

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
// All entries are real, actively maintained vector / retrieval engines.

const records = [
  {
    title: "Qdrant",
    repo: "qdrant/qdrant",
    url: "https://github.com/qdrant/qdrant",
    description: "High-performance vector database and similarity-search engine written in Rust, with rich payload filtering, quantization, and a gRPC/REST API for production RAG.",
    license: "Apache-2.0",
    tags: ["vector-db", "rust", "filtering", "rag"],
  },
  {
    title: "Weaviate",
    repo: "weaviate/weaviate",
    url: "https://github.com/weaviate/weaviate",
    description: "Open-source vector database in Go with built-in hybrid (keyword + vector) search, pluggable embedding modules, and GraphQL/REST APIs for semantic retrieval.",
    license: "BSD-3-Clause",
    tags: ["vector-db", "hybrid-search", "graphql", "go"],
  },
  {
    title: "Milvus",
    repo: "milvus-io/milvus",
    url: "https://github.com/milvus-io/milvus",
    description: "Cloud-native vector database built for billion-scale similarity search, with GPU indexing, multiple ANN backends, and horizontal scalability for large RAG workloads.",
    license: "Apache-2.0",
    tags: ["vector-db", "cloud-native", "gpu", "scale"],
  },
  {
    title: "Chroma",
    repo: "chroma-core/chroma",
    url: "https://github.com/chroma-core/chroma",
    description: "Open-source embeddings database designed for LLM applications; runs in-process or as a server, handling embedding storage, metadata filtering, and nearest-neighbor queries.",
    license: "Apache-2.0",
    tags: ["vector-db", "embeddings", "llm", "embedded"],
  },
  {
    title: "pgvector",
    repo: "pgvector/pgvector",
    url: "https://github.com/pgvector/pgvector",
    description: "PostgreSQL extension that adds a vector column type plus IVFFlat and HNSW indexes, so you can run exact and approximate nearest-neighbor search inside your existing database.",
    license: "PostgreSQL",
    tags: ["vector-db", "postgres", "extension", "hnsw"],
  },
  {
    title: "LanceDB",
    repo: "lancedb/lancedb",
    url: "https://github.com/lancedb/lancedb",
    description: "Serverless, embedded vector database built on the Lance columnar format; stores vectors and metadata in object storage with zero-copy versioning and fast filtered search.",
    license: "Apache-2.0",
    tags: ["vector-db", "embedded", "columnar", "serverless"],
  },
  {
    title: "Vespa",
    repo: "vespa-engine/vespa",
    url: "https://github.com/vespa-engine/vespa",
    description: "Open big-data serving engine from Yahoo that combines vector search, full-text search, and tensor ranking in one platform for search, recommendation, and RAG at scale.",
    license: "Apache-2.0",
    tags: ["vector-db", "search", "ranking", "tensor"],
  },
  {
    title: "Marqo",
    repo: "marqo-ai/marqo",
    url: "https://github.com/marqo-ai/marqo",
    description: "End-to-end tensor search engine that generates embeddings for text and images at index and query time, so you store documents instead of pre-computed vectors.",
    license: "Apache-2.0",
    tags: ["vector-db", "tensor-search", "multimodal", "embeddings"],
  },
  {
    title: "txtai",
    repo: "neuml/txtai",
    url: "https://github.com/neuml/txtai",
    description: "All-in-one embeddings database for semantic search, LLM orchestration, and language-model workflows, bundling vector indexes, graph storage, and pipelines in one library.",
    license: "Apache-2.0",
    tags: ["vector-db", "embeddings", "semantic-search", "python"],
  },
  {
    title: "FAISS",
    repo: "facebookresearch/faiss",
    url: "https://github.com/facebookresearch/faiss",
    description: "Meta's foundational library for efficient similarity search and clustering of dense vectors, with CPU/GPU indexes (IVF, PQ, HNSW) that underpin many vector databases.",
    license: "MIT",
    tags: ["ann", "library", "gpu", "meta"],
  },
  {
    title: "hnswlib",
    repo: "nmslib/hnswlib",
    url: "https://github.com/nmslib/hnswlib",
    description: "Header-only C++/Python implementation of Hierarchical Navigable Small World graphs for fast approximate nearest-neighbor search with incremental index updates.",
    license: "Apache-2.0",
    tags: ["ann", "hnsw", "library", "cpp"],
  },
  {
    title: "Annoy",
    repo: "spotify/annoy",
    url: "https://github.com/spotify/annoy",
    description: "Spotify's Approximate Nearest Neighbors Oh Yeah library — memory-mapped, read-only ANN trees ideal for serving static embedding sets with minimal footprint.",
    license: "Apache-2.0",
    tags: ["ann", "library", "mmap", "spotify"],
  },
  {
    title: "ScaNN",
    repo: "google-research/google-research",
    url: "https://github.com/google-research/google-research/tree/master/scann",
    description: "Google Research's Scalable Nearest Neighbors library using anisotropic vector quantization to deliver state-of-the-art accuracy/speed trade-offs for large-scale ANN.",
    license: "Apache-2.0",
    tags: ["ann", "library", "quantization", "google"],
  },
  {
    title: "Vald",
    repo: "vdaas/vald",
    url: "https://github.com/vdaas/vald",
    description: "Cloud-native distributed vector search engine on Kubernetes built around NGT, with automatic index distribution, backup, and horizontal scaling for billion-scale sets.",
    license: "Apache-2.0",
    tags: ["vector-db", "kubernetes", "distributed", "ngt"],
  },
  {
    title: "USearch",
    repo: "unum-cloud/usearch",
    url: "https://github.com/unum-cloud/usearch",
    description: "Compact, single-file similarity-search engine with HNSW indexes, custom metrics, and bindings for a dozen languages — embeddable from SQL, Python, Rust, and more.",
    license: "Apache-2.0",
    tags: ["ann", "embedded", "hnsw", "polyglot"],
  },
  {
    title: "Deep Lake",
    repo: "activeloopai/deeplake",
    url: "https://github.com/activeloopai/deeplake",
    description: "Activeloop's database for AI that stores vectors alongside images, audio, video, and text as tensors, with a vector-store API and streaming dataloaders for RAG and training.",
    license: "Apache-2.0",
    tags: ["vector-db", "multimodal", "tensors", "dataloader"],
  },
  {
    title: "Typesense",
    repo: "typesense/typesense",
    url: "https://github.com/typesense/typesense",
    description: "Fast, typo-tolerant open-source search engine in C++ that pairs instant keyword search with vector and hybrid search, offering a simpler alternative to Elasticsearch.",
    license: "GPL-3.0",
    tags: ["search", "hybrid-search", "typo-tolerant", "cpp"],
  },
  {
    title: "RediSearch",
    repo: "RediSearch/RediSearch",
    url: "https://github.com/RediSearch/RediSearch",
    description: "Redis module adding full-text and vector similarity search with HNSW/FLAT indexes, so an existing Redis deployment can serve low-latency embedding retrieval for agents.",
    license: "custom",
    tags: ["vector-db", "redis", "module", "low-latency"],
  },
  {
    title: "OpenSearch k-NN",
    repo: "opensearch-project/k-NN",
    url: "https://github.com/opensearch-project/k-NN",
    description: "OpenSearch plugin that brings approximate k-nearest-neighbor search (via FAISS, nmslib, and Lucene engines) to the OpenSearch cluster for scalable vector retrieval.",
    license: "Apache-2.0",
    tags: ["vector-db", "opensearch", "plugin", "knn"],
  },
  {
    title: "pgvecto.rs",
    repo: "tensorchord/pgvecto.rs",
    url: "https://github.com/tensorchord/pgvecto.rs",
    description: "Postgres extension written in Rust that adds scalable vector search with HNSW and quantization, filtered search, and multiple distance metrics on top of relational data.",
    license: "Apache-2.0",
    tags: ["vector-db", "postgres", "rust", "extension"],
  },
  {
    title: "sqlite-vec",
    repo: "asg017/sqlite-vec",
    url: "https://github.com/asg017/sqlite-vec",
    description: "Tiny, dependency-free SQLite extension for vector search that runs anywhere SQLite does — in the browser, on edge devices, or in a serverless function alongside app data.",
    license: "Apache-2.0",
    tags: ["vector-db", "sqlite", "extension", "edge"],
  },
  {
    title: "Infinity",
    repo: "infiniflow/infinity",
    url: "https://github.com/infiniflow/infinity",
    description: "AI-native database purpose-built for RAG that fuses dense vector, sparse vector, full-text, and tensor search with sub-millisecond latency and a single hybrid query API.",
    license: "Apache-2.0",
    tags: ["vector-db", "rag", "hybrid-search", "sparse"],
  },
  {
    title: "Vearch",
    repo: "vearch/vearch",
    url: "https://github.com/vearch/vearch",
    description: "Distributed vector-search system for building scalable similarity and hybrid search over embeddings, with a filtering query layer and horizontal sharding for large corpora.",
    license: "Apache-2.0",
    tags: ["vector-db", "distributed", "hybrid-search", "sharding"],
  },
  {
    title: "nmslib",
    repo: "nmslib/nmslib",
    url: "https://github.com/nmslib/nmslib",
    description: "Non-Metric Space Library — an efficient, extensible toolkit for approximate nearest-neighbor search over generic (including non-metric) spaces, a research-grade ANN benchmark baseline.",
    license: "Apache-2.0",
    tags: ["ann", "library", "non-metric", "research"],
  },
];

// --- Adapter ------------------------------------------------------------------

function vectordbAdapter() {
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
          tags: ["vector-db", "retrieval", "rag", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when you need the storage-and-search substrate behind agent memory or RAG — indexing embeddings and running (filtered) nearest-neighbor or hybrid search at query time.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's vector / retrieval database list — the data layer that agent-memory frameworks index into. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-guardrails.mjs) -----------------------------

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
    const adapter = vectordbAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[vectordb] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[vectordb] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[vectordb] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
