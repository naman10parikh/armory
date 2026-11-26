#!/usr/bin/env node
// Component web-search / live-retrieval API crawler. Curated list of the WEB-SEARCH
// tool layer — the retrieval-API providers an agent calls to get fresh, sourced web
// knowledge at run time: send a query, get back ranked results / snippets / a cited
// answer that the model then reasons over. Two tiers:
//   (1) AI-NATIVE retrieval APIs purpose-built for LLMs/agents/RAG (query -> clean,
//       relevance-ranked content or a sourced answer, often with per-result text).
//   (2) SERP / search-result APIs (query -> structured Google/Bing/independent-index
//       results as JSON) plus the open-source self-host metasearch option and the
//       widely-used free search libraries.
//
// This is a genuinely absent, clean, named layer. Verified across all 12 categories:
// `infrastructure` has only BROWSER-AUTOMATION substrate (browser-use-webui,
// scrapybara, webvoyager) — no web-search API; the only non-mcps hits for these
// products are a few `skills` (tavily-web, exa-search, perplexity-search), and
// serper/searxng/linkup/brave-search/serpapi/you.com/valyu/kagi have zero presence
// outside MCP servers that WRAP them. Identity is type-scoped, so the `skills`
// entries don't collide with these `infrastructure` components.
//
// It is DISTINCT from the three adjacent layers already catalogued:
//   - docparse (crawl-docparse, A12): PARSE/OCR/chunk a GIVEN document or URL into
//     clean text for RAG indexing — the ingestion step. THIS answers the prior
//     question "which URLs/snippets are even relevant to this query right now."
//   - browser automation (browser-use/scrapybara/webvoyager in infra): drive a FULL
//     browser session. A search API is a single stateless query->results call.
//   - rerankers (crawl-rerankers, A10): reorder an ALREADY-retrieved candidate set.
// The call path: query -> web-search API (THIS) -> results/sourced answer -> agent.
//
// Emits one component stub per entry into incoming/websearch/ with type
// `infrastructure` (the same home as the browser-automation substrate it sits beside;
// an installable search-API client/service the agent calls == substrate).
// `infrastructure` is an under-represented category, so this is a high-novelty
// Performance-Novelty fill.
//
// Run:
//   node ingest/crawl-websearch.mjs           # dry-run
//   node ingest/crawl-websearch.mjs --apply   # write to incoming/websearch/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-11-26";
const SOURCE_NAME = "websearch";

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
// All entries are real web-search / live-retrieval API products an agent calls to
// fetch fresh web knowledge. Titles are chosen so slugs stay disjoint from the
// existing infrastructure list and from each other. Hosted-API products with no
// clean OSS repo keep license `proprietary`; open-source self-host / libraries state
// their real licence. Jina (Reader) and Firecrawl are DELIBERATELY EXCLUDED — they
// are web-INGESTION tools already covered by crawl-docparse (A12); this list is the
// query->results SEARCH layer, a different concern.

const records = [
  // --- AI-native retrieval APIs (built for LLMs / agents / RAG) -------------
  {
    title: "Tavily",
    repo: "tavily-ai/tavily-python",
    url: "https://tavily.com/",
    description: "A web search API purpose-built for LLM agents and RAG: a single query returns relevance-ranked results with extracted, de-noised page content and an optional short synthesized answer, so an agent gets clean context in one call instead of scraping and chunking pages itself. Python and JS SDKs.",
    license: "proprietary",
    tags: ["search-api", "ai-native", "rag", "managed"],
  },
  {
    title: "Exa",
    repo: "exa-labs/exa-py",
    url: "https://exa.ai/",
    description: "A neural/embeddings web search API (formerly Metaphor) that retrieves pages by meaning rather than keywords and can return full cleaned page text, highlights, and sourced answers — designed for agents and RAG that need semantically precise web results with the underlying content attached.",
    license: "proprietary",
    tags: ["search-api", "ai-native", "neural-search", "rag"],
  },
  {
    title: "Linkup",
    repo: "LinkupPlatform/python-sdk",
    url: "https://www.linkup.so/",
    description: "An AI search API that returns a sourced answer plus the supporting results for a natural-language query, built as a grounding/retrieval layer for agents and RAG so responses come with citations to live web sources. SDKs and framework connectors.",
    license: "proprietary",
    tags: ["search-api", "ai-native", "sourced-answer", "rag"],
  },
  {
    title: "Valyu",
    repo: "valyu-network/valyu-python",
    url: "https://www.valyu.network/",
    description: "A search/retrieval API for AI (DeepSearch) that queries web plus proprietary and academic sources and returns LLM-ready, relevance-scored content with citations, aimed at agents and RAG pipelines that need grounded, attributable context beyond the open web.",
    license: "proprietary",
    tags: ["search-api", "ai-native", "deep-search", "rag"],
  },
  {
    title: "Parallel Search API",
    repo: "",
    url: "https://parallel.ai/",
    description: "A web search API designed for AI agents that takes a natural-language objective and returns ranked, extracted web evidence optimized for an LLM to reason over, trading the keyword-link paradigm for agent-oriented retrieval with the relevant page content included.",
    license: "proprietary",
    tags: ["search-api", "ai-native", "agents", "managed"],
  },
  {
    title: "Perplexity Sonar API",
    repo: "",
    url: "https://docs.perplexity.ai/",
    description: "Perplexity's Sonar API: an online model endpoint that answers a query by searching the live web and returning a grounded response with citations, giving an agent a one-call web-sourced answer rather than a list of links to post-process. OpenAI-compatible chat interface.",
    license: "proprietary",
    tags: ["search-api", "ai-native", "sourced-answer", "online-model"],
  },
  // --- SERP / search-result APIs (structured engine results as JSON) --------
  {
    title: "SerpAPI",
    repo: "serpapi/serpapi-python",
    url: "https://serpapi.com/",
    description: "A SERP scraping API that returns structured JSON for Google, Bing, and dozens of other engines and verticals (web, news, images, maps, scholar, shopping), handling proxies, CAPTCHAs, and parsing so an agent can read live search results without running a scraper.",
    license: "proprietary",
    tags: ["serp-api", "google-search", "structured-results", "managed"],
  },
  {
    title: "Serper",
    repo: "",
    url: "https://serper.dev/",
    description: "A fast, low-latency Google Search API that returns structured JSON results (organic, answer box, knowledge graph, news, images) from a single query — a lightweight real-time SERP endpoint widely wired into agents as the 'search the web' tool.",
    license: "proprietary",
    tags: ["serp-api", "google-search", "low-latency", "managed"],
  },
  {
    title: "Brave Search API",
    repo: "",
    url: "https://brave.com/search/api/",
    description: "A web search API backed by Brave's own independent index (not a Google/Bing reseller), returning ranked web, news, and other results as JSON with an AI-grounding tier — an independent, privacy-oriented source of fresh results for agents and RAG.",
    license: "proprietary",
    tags: ["search-api", "independent-index", "structured-results", "managed"],
  },
  {
    title: "You.com API",
    repo: "",
    url: "https://api.you.com/",
    description: "You.com's search and research API: web/news search endpoints plus a retrieval-augmented 'smart/research' endpoint that returns a sourced answer with citations, giving agents either raw ranked results or a grounded synthesized response from one provider.",
    license: "proprietary",
    tags: ["search-api", "sourced-answer", "research", "managed"],
  },
  {
    title: "Kagi Search API",
    repo: "",
    url: "https://help.kagi.com/kagi/api/search.html",
    description: "Kagi's programmatic search plus FastGPT and Universal Summarizer endpoints: query Kagi's ad-free, premium web index and get ranked results or a quick cited answer, exposing a high-signal independent search source to agents via API.",
    license: "proprietary",
    tags: ["search-api", "independent-index", "sourced-answer", "managed"],
  },
  {
    title: "Bright Data SERP API",
    repo: "",
    url: "https://brightdata.com/products/serp-api",
    description: "Bright Data's SERP API returns structured, real-time search-engine results (Google, Bing, and more) at scale through a managed proxy/unlocking layer, giving agents reliable live SERP data without maintaining scraping or anti-bot infrastructure.",
    license: "proprietary",
    tags: ["serp-api", "google-search", "structured-results", "managed"],
  },
  // --- Open-source metasearch / libraries -----------------------------------
  {
    title: "SearXNG",
    repo: "searxng/searxng",
    url: "https://github.com/searxng/searxng",
    description: "A self-hosted, privacy-respecting metasearch engine that aggregates results from many upstream engines and exposes them as JSON — a free, open-source search backend agents can call for live web results without a third-party API key or per-query cost.",
    license: "AGPL-3.0",
    tags: ["metasearch", "self-host", "privacy", "open-source"],
  },
  {
    title: "DuckDuckGo Search",
    repo: "deedy5/duckduckgo_search",
    url: "https://github.com/deedy5/duckduckgo_search",
    description: "A widely-used Python library (ddgs) that fetches DuckDuckGo web, news, image, and video results with no API key, commonly wired into agents and LangChain as the zero-cost default web-search tool for quick live lookups.",
    license: "MIT",
    tags: ["search-library", "no-api-key", "python", "open-source"],
  },
];

// --- Adapter ------------------------------------------------------------------

function websearchAdapter() {
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
          tags: ["web-search", "retrieval-api", "infrastructure", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} as the web-search / live-retrieval layer of an agent stack — the stage that gives the model fresh, sourced web knowledge at run time. Send a natural-language query or keywords and get back ranked results, extracted page content, or a cited answer that the agent reasons over. It is the step that decides what on the live web is even relevant, BEFORE any parse/chunk (ingestion) or rerank — distinct from driving a full browser session.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's web-search list — the query->results retrieval-API layer the agent calls for live web context, distinct from document-parsing/ingestion, browser automation, and reranking. Verified ${VERIFIED_AT}.`,
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
    const adapter = websearchAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[websearch] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[websearch] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[websearch] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
