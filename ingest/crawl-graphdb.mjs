#!/usr/bin/env node
// Component graph / knowledge-graph database crawler. Curated list of graph and
// RDF/triple stores — the OTHER half of the agent-memory retrieval substrate
// (GraphRAG). These are distinct from both the vector-database list (dense
// nearest-neighbor search) and the agent-memory-FRAMEWORK list in `memory/`
// (Letta, Zep/Graphiti, cognee, Microsoft GraphRAG): a graph DB is the data
// layer those GraphRAG frameworks persist their entity/relation graphs into.
// Emits one component stub per engine into incoming/graphdb/ with type
// `infrastructure` (a deployable retrieval service == infrastructure).
//
// Run:
//   node ingest/crawl-graphdb.mjs           # dry-run
//   node ingest/crawl-graphdb.mjs --apply   # write to incoming/graphdb/
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-10-19";
const SOURCE_NAME = "graphdb";

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
// Each record: { title, repo ("owner/repo"), url, description, license, tags }
// All entries are real, actively maintained graph / RDF / knowledge-graph stores.

const records = [
  {
    title: "Neo4j",
    repo: "neo4j/neo4j",
    url: "https://github.com/neo4j/neo4j",
    description: "The reference native property-graph database with the Cypher query language, ACID transactions, and index-free adjacency — the store most GraphRAG pipelines target for entity/relation memory.",
    license: "GPL-3.0",
    tags: ["property-graph", "cypher", "java", "graphrag"],
  },
  {
    title: "Memgraph",
    repo: "memgraph/memgraph",
    url: "https://github.com/memgraph/memgraph",
    description: "In-memory, Cypher-compatible graph database built in C++ for real-time analytics and streaming, with a MAGE algorithm library and drop-in Neo4j protocol compatibility.",
    license: "BSL-1.1",
    tags: ["property-graph", "cypher", "in-memory", "streaming"],
  },
  {
    title: "NebulaGraph",
    repo: "vesoft-inc/nebula",
    url: "https://github.com/vesoft-inc/nebula",
    description: "Distributed, linearly scalable graph database designed for trillion-edge graphs, with a shared-nothing architecture and the nGQL query language for billion-vertex workloads.",
    license: "Apache-2.0",
    tags: ["property-graph", "distributed", "ngql", "scale"],
  },
  {
    title: "Dgraph",
    repo: "hypermodeinc/dgraph",
    url: "https://github.com/hypermodeinc/dgraph",
    description: "Distributed, GraphQL-native graph database written in Go with horizontal sharding, ACID transactions, and low-latency traversals for building knowledge graphs at scale.",
    license: "Apache-2.0",
    tags: ["graph-db", "graphql", "distributed", "go"],
  },
  {
    title: "Kuzu",
    repo: "kuzudb/kuzu",
    url: "https://github.com/kuzudb/kuzu",
    description: "Embeddable property-graph database with a columnar storage engine, vectorized Cypher execution, and built-in vector/full-text indexes — the SQLite of graphs for local GraphRAG.",
    license: "MIT",
    tags: ["property-graph", "embedded", "cypher", "columnar"],
  },
  {
    title: "FalkorDB",
    repo: "FalkorDB/FalkorDB",
    url: "https://github.com/FalkorDB/FalkorDB",
    description: "Ultra-low-latency graph database (a RedisGraph successor) using sparse matrices and GraphBLAS, with OpenCypher and vector indexing purpose-built as a GraphRAG knowledge store.",
    license: "SSPL-1.0",
    tags: ["property-graph", "opencypher", "graphblas", "graphrag"],
  },
  {
    title: "ArangoDB",
    repo: "arangodb/arangodb",
    url: "https://github.com/arangodb/arangodb",
    description: "Multi-model database that unifies documents, graphs, and key-value in one engine with the AQL query language, so agent memory can mix relational, document, and graph traversals.",
    license: "Apache-2.0",
    tags: ["multi-model", "graph-db", "aql", "document"],
  },
  {
    title: "JanusGraph",
    repo: "JanusGraph/janusgraph",
    url: "https://github.com/JanusGraph/janusgraph",
    description: "Distributed graph database layered over Cassandra, HBase, or ScyllaDB, speaking Apache TinkerPop's Gremlin traversal language for massive, elastically scalable graphs.",
    license: "Apache-2.0",
    tags: ["graph-db", "gremlin", "distributed", "tinkerpop"],
  },
  {
    title: "TypeDB",
    repo: "typedb/typedb",
    url: "https://github.com/typedb/typedb",
    description: "Strongly-typed knowledge-graph database with a schema, entity-relation-attribute model, and a built-in reasoning engine that infers new facts from rules at query time.",
    license: "MPL-2.0",
    tags: ["knowledge-graph", "reasoning", "typeql", "schema"],
  },
  {
    title: "Apache AGE",
    repo: "apache/age",
    url: "https://github.com/apache/age",
    description: "PostgreSQL extension that adds openCypher graph queries to an existing relational database, letting you store and traverse a property graph alongside SQL tables and pgvector.",
    license: "Apache-2.0",
    tags: ["graph-db", "postgres", "opencypher", "extension"],
  },
  {
    title: "Oxigraph",
    repo: "oxigraph/oxigraph",
    url: "https://github.com/oxigraph/oxigraph",
    description: "Lightweight SPARQL-compliant RDF triple store written in Rust, usable as a server or an embedded library, ideal for standards-based knowledge graphs and linked-data memory.",
    license: "Apache-2.0",
    tags: ["rdf", "sparql", "triple-store", "rust"],
  },
  {
    title: "TerminusDB",
    repo: "terminusdb/terminusdb",
    url: "https://github.com/terminusdb/terminusdb",
    description: "Versioned knowledge-graph database with git-like branch/merge/revert over a Datalog engine, giving agents an auditable, time-travelable graph of entities and relations.",
    license: "Apache-2.0",
    tags: ["knowledge-graph", "versioned", "datalog", "git-like"],
  },
  {
    title: "Apache Jena",
    repo: "apache/jena",
    url: "https://github.com/apache/jena",
    description: "Mature Java framework for building semantic-web and linked-data apps, bundling the TDB2 triple store, a SPARQL engine (Fuseki), and an OWL/RDFS inference layer.",
    license: "Apache-2.0",
    tags: ["rdf", "sparql", "triple-store", "semantic-web"],
  },
  {
    title: "HugeGraph",
    repo: "apache/incubator-hugegraph",
    url: "https://github.com/apache/incubator-hugegraph",
    description: "Apache distributed graph database compatible with Gremlin/TinkerPop, built for hundred-billion-edge graphs with pluggable storage backends and OLTP/OLAP traversals.",
    license: "Apache-2.0",
    tags: ["graph-db", "gremlin", "distributed", "apache"],
  },
  {
    title: "CozoDB",
    repo: "cozodb/cozo",
    url: "https://github.com/cozodb/cozo",
    description: "Embeddable, transactional Datalog graph database with built-in vector search and time-travel queries, running in-process from Python, Rust, or the browser for hybrid graph+vector memory.",
    license: "MPL-2.0",
    tags: ["graph-db", "datalog", "embedded", "vector"],
  },
  {
    title: "SurrealDB",
    repo: "surrealdb/surrealdb",
    url: "https://github.com/surrealdb/surrealdb",
    description: "Multi-model database in Rust combining document records, graph relations, and full-text/vector search behind one SQL-like query language, deployable embedded or as a server.",
    license: "BSL-1.1",
    tags: ["multi-model", "graph-db", "rust", "document"],
  },
  {
    title: "IndraDB",
    repo: "indradb/indradb",
    url: "https://github.com/indradb/indradb",
    description: "Lightweight graph database written in Rust, usable as a library or a server, with pluggable storage (RocksDB, in-memory) and a focus on a simple, embeddable property-graph API.",
    license: "MPL-2.0",
    tags: ["graph-db", "rust", "embedded", "rocksdb"],
  },
  {
    title: "Cayley",
    repo: "cayleygraph/cayley",
    url: "https://github.com/cayleygraph/cayley",
    description: "Open-source graph database in Go (born at Google) that layers a Gremlin-like query language over pluggable backends such as PostgreSQL, Mongo, and BoltDB for linked-data stores.",
    license: "Apache-2.0",
    tags: ["graph-db", "go", "gremlin", "linked-data"],
  },
  {
    title: "Apache TinkerPop",
    repo: "apache/tinkerpop",
    url: "https://github.com/apache/tinkerpop",
    description: "Graph computing framework and home of the Gremlin traversal language — the vendor-neutral query substrate that JanusGraph, HugeGraph, Neptune, and many graph stores implement.",
    license: "Apache-2.0",
    tags: ["graph-db", "gremlin", "framework", "traversal"],
  },
];

// --- Adapter ------------------------------------------------------------------

function graphdbAdapter() {
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
          tags: ["graph-db", "knowledge-graph", "graphrag", ...(item.tags || [])],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\nReach for ${item.title} when agent memory or RAG needs the GraphRAG substrate — persisting entities and relations as a traversable graph (or RDF triples) rather than only dense vectors, so you can answer multi-hop and relationship queries.\n\n` +
          `## How to install / invoke\nSee the source repo or docs at ${sourceUrl}.\n\n` +
          `## Notes\nListed from Armory's graph / knowledge-graph database list — the graph layer that GraphRAG and agent-memory frameworks persist into. Verified ${VERIFIED_AT}.`,
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
    const adapter = graphdbAdapter();
    const written = await runCollection(adapter, { dryRun });
    if (written.length === 0) {
      console.error("[graphdb] No stubs produced — check records array.");
      process.exit(1);
    }
    // Spot-check: print sample slugs from beginning, middle, end.
    const samples = [written[0], written[Math.floor(written.length / 2)], written[written.length - 1]];
    for (const s of samples) console.log(`[graphdb] sample: ${s.frontmatter.name}`);
  } catch (err) {
    console.error(`[graphdb] FATAL: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
