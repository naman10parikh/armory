#!/usr/bin/env node
// Engram crawler framework. Pluggable SourceAdapters turn external sources
// (awesome-lists, JSON APIs) into engram stubs under incoming/<source>/<slug>.md.
// Zero npm deps. Adapters are INJECTABLE so they unit-test with mock data — this
// task performs NO live network calls. Run: node ingest/crawl.mjs --source <name> [--apply]
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");

// SourceAdapter shape: { name, type, fetch(): Promise<RawItem[]>, toEngram(item) => {frontmatter, body} }

// --- Stub serializer (the inverse of parseFrontmatter) --------------------
export function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "untitled";
}

// Serialize one value to a YAML scalar/inline-list matching the engram dialect.
function yamlValue(v) {
  if (v === null || v === undefined) return "null";
  if (Array.isArray(v)) return `[${v.map((x) => String(x)).join(", ")}]`;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return String(v);
}

// Build a full engram markdown file from {frontmatter, body}. `description` is
// emitted as a folded (>) block to match the contract and catalog parser.
export function toMarkdown({ frontmatter, body }) {
  const fm = { ...frontmatter };
  const lines = ["---"];
  for (const [k, v] of Object.entries(fm)) {
    if (k === "description") {
      lines.push("description: >", `  ${String(v).replace(/\s+/g, " ").trim()}`);
    } else {
      lines.push(`${k}: ${yamlValue(v)}`);
    }
  }
  lines.push("---", "");
  return lines.join("\n") + (body ? body.trim() + "\n" : "");
}

// --- Example adapter 1: GitHub awesome-list (markdown bullet list) ---------
// Parses "- [Name](url) — description" bullets into engram stubs.
export function githubAwesomeList({ name, type = "mcps", markdown = "", license = "unknown", verifiedAt }) {
  const today = verifiedAt || new Date().toISOString().slice(0, 10);
  const re = /^\s*[-*]\s+\[([^\]]+)\]\(([^)]+)\)\s*(?:[—:-]\s*(.+))?$/;
  return {
    name, type,
    async fetch() { return markdown.split(/\r?\n/).map((l) => l.match(re)).filter(Boolean)
      .map((m) => ({ title: m[1].trim(), url: m[2].trim(), description: (m[3] || m[1]).trim() })); },
    toEngram(item) {
      const repo = (item.url.match(/github\.com\/([^/]+\/[^/#?]+)/) || [])[1] || "";
      const slug = slugify(item.title);
      return { frontmatter: {
        name: slug, type, description: item.description,
        source_repo: repo, source_url: item.url, license,
        cli_compat: ["claude", "codex", "cursor", "gemini", "opencode"],
        maturity: "experimental", stars: null, eval_score: null,
        verified_at: today, related: [], tags: [name],
      }, body: `## What it is\n${item.description}\n\n## When to use it\n${item.description}\n\n## How to install / invoke\nSee the source repo README.\n\n## Notes\nDiscovered via the ${name} awesome-list. Pending verify -> promote.` };
    },
  };
}

// --- Example adapter 2: generic JSON API (array of records) ----------------
// Maps a JSON array into stubs via field accessors (defaults match common shapes).
export function genericJsonApi({ name, type = "mcps", records = [], license = "unknown", verifiedAt,
  pick = { title: "name", url: "url", description: "description", repo: "repo", stars: "stars" } }) {
  const today = verifiedAt || new Date().toISOString().slice(0, 10);
  return {
    name, type,
    async fetch() { return records; },
    toEngram(item) {
      const title = item[pick.title] ?? "untitled";
      const desc = item[pick.description] ?? title;
      const slug = slugify(title);
      return { frontmatter: {
        name: slug, type, description: desc,
        source_repo: item[pick.repo] ?? "", source_url: item[pick.url] ?? "", license,
        cli_compat: ["claude", "codex", "cursor", "gemini", "opencode"],
        maturity: "experimental", stars: item[pick.stars] ?? null, eval_score: null,
        verified_at: today, related: [], tags: [name],
      }, body: `## What it is\n${desc}\n\n## When to use it\n${desc}\n\n## How to install / invoke\nSee the source for the config/command.\n\n## Notes\nDiscovered via the ${name} JSON source. Pending verify -> promote.` };
    },
  };
}

// --- Run one adapter: fetch -> toEngram -> write stubs ---------------------
export async function runCrawl(adapter, { dryRun = true, outDir = INCOMING, log = console.log } = {}) {
  const items = await adapter.fetch();
  const dir = join(outDir, adapter.name);
  const written = [];
  for (const item of items) {
    const { frontmatter, body } = adapter.toEngram(item);
    const file = join(dir, `${frontmatter.name}.md`);
    const md = toMarkdown({ frontmatter, body });
    if (dryRun) { log(`[dry-run] would write ${file} (${md.split("\n").length} lines)`); }
    else { mkdirSync(dir, { recursive: true }); writeFileSync(file, md); log(`wrote ${file}`); }
    written.push({ file, frontmatter, md });
  }
  log(`${dryRun ? "[dry-run] " : ""}${adapter.name}: ${written.length} stub(s)`);
  return written;
}

// --- CLI ------------------------------------------------------------------
// No registered live adapters in this task (no network). Pass --source to see
// the framework refuse cleanly; real adapters are wired by the CI workflow.
const ADAPTERS = {}; // name -> () => SourceAdapter (populated when live sources land)

async function main(argv) {
  const args = argv.slice(2);
  const source = args[(args.indexOf("--source") + 1) || -1];
  const dryRun = !args.includes("--apply"); // default dry-run
  if (!source || args.indexOf("--source") === -1) {
    console.error("usage: crawl.mjs --source <name> [--apply]   (default: dry-run)");
    console.error(`registered sources: ${Object.keys(ADAPTERS).join(", ") || "(none — adapters injected via tests/CI)"}`);
    process.exit(2);
  }
  const make = ADAPTERS[source];
  if (!make) { console.error(`unknown source "${source}". Adapters are injectable; register one in ADAPTERS or use runCrawl() directly.`); process.exit(2); }
  await runCrawl(make(), { dryRun });
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
