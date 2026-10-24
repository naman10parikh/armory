#!/usr/bin/env node
// Component document-parsing / chunking / ingestion crawler. Curated list of the
// FIRST-stage retrieval primitive that runs BEFORE embeddings: given a raw source
// (PDF, DOCX, PPTX, HTML, scanned image, or a live URL), these tools partition it
// into clean, structured, LLM-ready text and split it into semantically coherent
// chunks. That parsed+chunked output is what the embedding layer (crawl-embeddings)
// then vectorises, the vector/graph stores (crawl-vectordb / crawl-graphdb) index,
// and the reranker (crawl-rerankers) reorders. It completes the retrieval arc on its
// front end — the ingestion/ETL stage every RAG and agent-memory pipeline starts with:
//   parse + chunk (THIS) -> embed -> store (vector / graph) -> rerank -> LLM.
// Previously absent across all 12 categories: the infrastructure list had vector DBs,
// graph DBs, embeddings, and rerankers, but nothing that turns a raw document into the
// clean chunks those layers consume. Emits one component stub per entry into
// incoming/docparse/ with type `infrastructure` (a deployable parse/chunk service or
// library == infrastructure, consistent with crawl-vectordb/graphdb/embeddings/rerankers).
//
// Run:
//   node ingest/crawl-docparse.mjs           # dry-run
//   node ingest/crawl-docparse.mjs --apply   # write to incoming/docparse/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-10-24";
const SOURCE_NAME = "docparse";

// --- Shared helpers (mirrors crawl-rerankers.mjs) ----------------------------

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
// All entries are real, actively maintained document-parsing, OCR-extraction, or
// text-chunking tools, libraries, or hosted ingestion APIs. Titles slugify disjoint
// from the existing infrastructure list (only "firecracker" the microVM pre-existed —
// unrelated to "Firecrawl") and from each other.

const records = [
  {
    title: "Unstructured",
    repo: "Unstructured-IO/unstructured",
    url: "https://github.com/Unstructured-IO/unstructured",
    description: "The canonical open-source ETL library for LLMs: partitions PDFs, HTML, DOCX, PPTX, emails, and images into clean, structured document elements (titles, tables, narrative text) ready for chunking and embedding.",
    license: "Apache-2.0",
    tags: ["library", "etl", "partition", "multi-format"],
  },
  {
    title: "Docling",
    repo: "docling-project/docling",
    url: "https://github.com/docling-project/docling",
    description: "IBM's document converter that parses PDF, DOCX, PPTX, XLSX, HTML, and images into a unified rich document model with layout, reading order, tables, and code, exporting Markdown/JSON for RAG ingestion.",
    license: "MIT",
    tags: ["library", "layout", "tables", "multi-format"],
  },
  {
    title: "MarkItDown",
    repo: "microsoft/markitdown",
    url: "https://github.com/microsoft/markitdown",
    description: "Microsoft's lightweight utility that converts Office files, PDFs, images, audio, and HTML into clean Markdown optimised for LLM ingestion, preserving structure like headings, lists, and tables.",
    license: "MIT",
    tags: ["library", "markdown", "office", "multi-format"],
  },
  {
    title: "Marker",
    repo: "datalab-to/marker",
    url: "https://github.com/datalab-to/marker",
    description: "A fast, accurate pipeline that converts PDFs, EPUBs, and other documents to Markdown or JSON, handling tables, equations, code blocks, and reading order far better than naive text extraction.",
    license: "GPL-3.0",
    tags: ["library", "pdf", "markdown", "equations"],
  },
  {
    title: "LlamaParse",
    repo: "",
    url: "https://docs.cloud.llamaindex.ai/llamaparse/overview",
    description: "LlamaIndex's hosted document parser built for RAG over complex PDFs — it reconstructs tables, figures, and layout into clean Markdown and nodes, with natural-language parsing instructions for tricky documents.",
    license: "proprietary",
    tags: ["api", "hosted", "pdf", "tables"],
  },
  {
    title: "Firecrawl",
    repo: "mendableai/firecrawl",
    url: "https://github.com/mendableai/firecrawl",
    description: "Turns entire websites into clean, LLM-ready Markdown or structured data via a crawl/scrape API that handles JavaScript rendering, pagination, and anti-bot pages — the web-ingestion front end for RAG.",
    license: "AGPL-3.0",
    tags: ["api", "web", "crawl", "markdown"],
  },
  {
    title: "Crawl4AI",
    repo: "unclecode/crawl4ai",
    url: "https://github.com/unclecode/crawl4ai",
    description: "An open-source, LLM-friendly web crawler and scraper that outputs clean Markdown and extracted structured data from any page, with chunking and filtering built in for feeding RAG pipelines at scale.",
    license: "Apache-2.0",
    tags: ["library", "web", "crawl", "markdown"],
  },
  {
    title: "Jina Reader",
    repo: "jina-ai/reader",
    url: "https://github.com/jina-ai/reader",
    description: "Converts any URL into LLM-friendly input by prefixing it with r.jina.ai — fetches, renders, and returns clean Markdown (or a search result set) so an agent can read a live page as grounded context.",
    license: "Apache-2.0",
    tags: ["api", "web", "url-to-markdown", "reader"],
  },
  {
    title: "Nougat",
    repo: "facebookresearch/nougat",
    url: "https://github.com/facebookresearch/nougat",
    description: "Meta's Neural Optical Understanding for Academic Documents — a transformer OCR model that converts scientific PDFs, including math and tables, into structured markup (Mathpix Markdown) for downstream retrieval.",
    license: "MIT",
    tags: ["model", "ocr", "scientific", "math"],
  },
  {
    title: "Surya",
    repo: "datalab-to/surya",
    url: "https://github.com/datalab-to/surya",
    description: "A document OCR toolkit covering text recognition, layout and reading-order detection, and table parsing across 90+ languages — the vision backbone that powers accurate parsing of scanned and complex pages.",
    license: "GPL-3.0",
    tags: ["library", "ocr", "layout", "multilingual"],
  },
  {
    title: "Zerox",
    repo: "getomni-ai/zerox",
    url: "https://github.com/getomni-ai/zerox",
    description: "A dead-simple vision-LLM OCR pipeline that converts any document or PDF to Markdown page by page by sending rendered images to a multimodal model, handling scans and messy layouts without bespoke parsers.",
    license: "MIT",
    tags: ["library", "ocr", "vision-llm", "markdown"],
  },
  {
    title: "MinerU",
    repo: "opendatalab/MinerU",
    url: "https://github.com/opendatalab/MinerU",
    description: "OpenDataLab's high-quality tool that converts PDFs into machine-readable Markdown and JSON, extracting text, formulas, and tables while removing headers, footers, and page artifacts for clean RAG corpora.",
    license: "AGPL-3.0",
    tags: ["library", "pdf", "formulas", "tables"],
  },
  {
    title: "PyMuPDF4LLM",
    repo: "pymupdf/PyMuPDF",
    url: "https://pymupdf.readthedocs.io/en/latest/pymupdf4llm/",
    description: "The PyMuPDF helper that extracts PDF content as LLM- and RAG-ready Markdown, preserving multi-column reading order, tables, and headers, with page chunking — a fast, dependency-light ingestion option.",
    license: "AGPL-3.0",
    tags: ["library", "pdf", "markdown", "fast"],
  },
  {
    title: "Apache Tika",
    repo: "apache/tika",
    url: "https://github.com/apache/tika",
    description: "The long-standing content detection and extraction toolkit that parses text and metadata from over a thousand file types through one interface — the battle-tested JVM workhorse for document ingestion.",
    license: "Apache-2.0",
    tags: ["library", "jvm", "extraction", "multi-format"],
  },
  {
    title: "Extractous",
    repo: "yobix-ai/extractous",
    url: "https://github.com/yobix-ai/extractous",
    description: "A fast, Rust-based document and metadata extraction engine with Python and JS bindings — a modern, low-memory alternative to Tika that pulls clean text from PDFs, Office files, HTML, and images for RAG.",
    license: "Apache-2.0",
    tags: ["library", "rust", "extraction", "fast"],
  },
  {
    title: "GROBID",
    repo: "kermitt2/grobid",
    url: "https://github.com/kermitt2/grobid",
    description: "A machine-learning library for parsing and structuring scholarly PDFs into clean TEI-XML — extracting header metadata, references, and full-text body structure, the standard for building scientific-paper corpora.",
    license: "Apache-2.0",
    tags: ["service", "scientific", "references", "tei"],
  },
  {
    title: "MegaParse",
    repo: "quivrhq/megaparse",
    url: "https://github.com/quivrhq/megaparse",
    description: "Quivr's parser for PDF, DOCX, and PPTX optimised for LLM ingestion — aims for lossless conversion that preserves tables, table of contents, headers, and footers so no structure is dropped before chunking.",
    license: "Apache-2.0",
    tags: ["library", "lossless", "office", "rag"],
  },
  {
    title: "Chunkr",
    repo: "lumina-ai-inc/chunkr",
    url: "https://github.com/lumina-ai-inc/chunkr",
    description: "A self-hostable document ingestion API that runs layout analysis, OCR, and semantic chunking end to end, returning segmented, bounded chunks with metadata ready to embed — parse and chunk behind one service.",
    license: "AGPL-3.0",
    tags: ["service", "layout", "ocr", "chunking"],
  },
  {
    title: "Chonkie",
    repo: "chonkie-inc/chonkie",
    url: "https://github.com/chonkie-inc/chonkie",
    description: "An ultra-light, ultra-fast text chunking library offering token, sentence, recursive, semantic, and late chunking strategies behind one tiny API — the dedicated split stage between parsing and embedding.",
    license: "MIT",
    tags: ["library", "chunking", "semantic", "fast"],
  },
  {
    title: "semchunk",
    repo: "isaacus-dev/semchunk",
    url: "https://github.com/isaacus-dev/semchunk",
    description: "A fast, lightweight Python library that splits text into semantically meaningful chunks of a target token size, keeping related sentences together so each chunk embeds into a coherent vector for retrieval.",
    license: "MIT",
    tags: ["library", "chunking", "semantic", "python"],
  },
  {
    title: "text-splitter",
    repo: "benbrandt/text-splitter",
    url: "https://github.com/benbrandt/text-splitter",
    description: "A Rust library with Python and JS bindings that splits text and Markdown into chunks bounded by a chosen tokenizer's token count, respecting semantic boundaries (headings, paragraphs, sentences) for clean embedding.",
    license: "MIT",
    tags: ["library", "chunking", "rust", "tokenizer"],
  },
];

// --- Adapter ------------------------------------------------------------------

function docparseAdapter() {
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
          tags: ["docparse", "ingestion", "parsing", "chunking", "rag", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} at the ingestion stage of retrieval — before anything is embedded or stored, it turns a raw source (PDF, Office file, HTML, scanned image, or live URL) into clean, structured, chunkable text, so the embedding and vector/graph layers index high-quality content instead of garbled extraction.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's document-parsing / chunking / ingestion list — the first-stage retrieval primitive that produces what the embedding, vector/graph, and reranker layers consume. Verified ${VERIFIED_AT}.`,
      };
    },
  };
}

// --- runCollection (mirrors crawl-rerankers.mjs) ------------------------------

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
    const adapter = docparseAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[docparse] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[docparse] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[docparse] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
