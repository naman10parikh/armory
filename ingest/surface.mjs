#!/usr/bin/env node
// surface.mjs — Surfaces catalog-only types as browsable root folders.
//
// For MCP components → generates root mcp/<slug>.json (install configs).
// For non-real-file types → generates slim card .md files at the type root.
//
// Idempotent (--apply): resets each generated type's root dir, then re-emits.
// NEVER touches: skills/ agents/ commands/ hooks/ rules/ (real vendored files from TASK 1)
// NEVER touches: brain/, catalog.json, armory-mcp/, cli/, armory-skill/, .github/, skills/, subagents/, workflows/, hooks/, claudemd-rules/
//
// Usage:
//   node ingest/surface.mjs           # dry-run: prints counts
//   node ingest/surface.mjs --apply   # reset + generate

import {
  existsSync, mkdirSync, rmSync, readdirSync,
  readFileSync, writeFileSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const DRY_RUN = !process.argv.includes("--apply");
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BRAIN = join(ROOT, "brain", "components");

// Real-file types already vendored at root — DO NOT generate/reset these
const REAL_FILE_TYPES = new Set(["skills", "subagents", "workflows", "hooks", "claudemd-rules"]);

// Catalog-only types that get generated root folders
const CATALOG_TYPES = [
  "subagents",
  "clis-tools",
  "evals",
  "observability",
  "infrastructure",
  "memory",
  "identity",
  "workflows",
  // claudemd-rules already has real counterpart in .claude/rules — expose as catalog view
  "claudemd-rules",
];

// ── helpers ──────────────────────────────────────────────────────────────────

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function resetDir(p) {
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
  mkdirSync(p, { recursive: true });
}

/** Parse YAML frontmatter from a markdown file. Returns an object. */
function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim();
    let val = line.slice(colon + 1).trim();
    // strip inline YAML string quotes
    if ((val.startsWith("'") && val.endsWith("'")) ||
        (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1);
    }
    if (val) fm[key] = val;
  }
  return fm;
}

/** Read a brain component directory and return array of parsed entries. */
function loadBrainType(type) {
  const dir = join(BRAIN, type);
  if (!existsSync(dir)) return [];
  const entries = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".md")) continue;
    const content = readFileSync(join(dir, name), "utf8");
    const fm = parseFrontmatter(content);
    // Pull description from multiline block if value is just ">"
    let desc = fm.description || "";
    if (desc === ">") {
      const m = content.match(/^description:\s*>\n\s+([\s\S]+?)(?=\n\S|\n---)/m);
      if (m) desc = m[1].replace(/\n\s+/g, " ").trim();
    }
    entries.push({
      slug: basename(name, ".md"),
      name: fm.name || basename(name, ".md"),
      type: fm.type || type,
      description: desc,
      source_repo: fm.source_repo || "",
      source_url: fm.source_url || "",
      license: fm.license || "unknown",
    });
  }
  return entries;
}

// ── MCP generation ────────────────────────────────────────────────────────────

/**
 * Derive a best-effort install string from source_repo / source_url.
 * Priority: npm (if repo name looks like an npm package) → npx → git clone
 */
function deriveInstall(source_repo, source_url) {
  if (!source_repo && !source_url) return "# No source available — check the brain page for details";
  const url = source_url || `https://github.com/${source_repo}`;
  const repoName = source_repo ? source_repo.split("/").pop() : "";

  // Heuristic: if the repo name ends with -mcp, -mcp-server, mcp-server — prefer npx
  if (repoName && /^(@[a-z0-9-]+\/)?[a-z0-9._-]+([-_]mcp|[-_]mcp[-_]server|mcp[-_]server)$/i.test(repoName)) {
    return `npx -y ${repoName}`;
  }
  // If source_url points to npmjs.com
  if (url.includes("npmjs.com/package/")) {
    const pkg = url.split("npmjs.com/package/")[1].replace(/\/.*/, "");
    return `npx -y ${pkg}`;
  }
  // Fallback: git clone instruction
  return `# git clone --depth 1 ${url}\n# See source for mcpServers config block`;
}

function generateMcpJson(entry) {
  return JSON.stringify(
    {
      name: entry.name,
      description: entry.description || entry.name,
      source_repo: entry.source_repo,
      source_url: entry.source_url,
      install: deriveInstall(entry.source_repo, entry.source_url),
    },
    null,
    2,
  );
}

// ── Catalog card generation ───────────────────────────────────────────────────

function generateCatalogCard(entry) {
  return `---
name: ${entry.name}
type: ${entry.type}
source_repo: ${entry.source_repo}
source_url: ${entry.source_url}
license: ${entry.license}
---
# ${entry.name}

${entry.description || "No description available."}

**Source:** ${entry.source_url || (entry.source_repo ? `https://github.com/${entry.source_repo}` : "unknown")}

> Generated from the Armory catalog. Full metadata lives in \`brain/components/${entry.type}/${entry.slug}.md\`.
`;
}

// ── README generators ─────────────────────────────────────────────────────────

function mcpReadme(count) {
  return `# mcps/ — ${count.toLocaleString()} MCP server install configs

Each \`<slug>.json\` is a minimal install config:
\`\`\`json
{
  "name": "…",
  "description": "…",
  "source_repo": "owner/repo",
  "source_url": "https://…",
  "install": "npx -y <package>   # or git clone …"
}
\`\`\`

**Full metadata** (description, maturity, tags, cli_compat) → \`brain/components/mcps/<slug>.md\`

This directory is **generated** by \`ingest/surface.mjs\`. Do not hand-edit.
Run \`node ingest/surface.mjs --apply\` to rebuild.
`;
}

function typeReadme(type, count) {
  return `# ${type}/ — ${count} components (catalog view)

Each \`<slug>.md\` is a slim install card generated from \`brain/components/${type}/\`.

**Full metadata** → \`brain/components/${type}/<slug>.md\`

This directory is **generated** by \`ingest/surface.mjs\`. Do not hand-edit.
Run \`node ingest/surface.mjs --apply\` to rebuild.
`;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (DRY_RUN) {
    console.log("surface.mjs — DRY RUN (pass --apply to write)\n");
  } else {
    console.log("surface.mjs — APPLY mode\n");
  }

  const counts = {};

  // ── MCPs ────────────────────────────────────────────────────────────────────

  console.log("Loading brain/components/mcps/ …");
  const mcpEntries = loadBrainType("mcps");
  const mcpDir = join(ROOT, "mcps");
  if (!DRY_RUN) {
    resetDir(mcpDir);
    for (const entry of mcpEntries) {
      writeFileSync(join(mcpDir, `${entry.slug}.json`), generateMcpJson(entry), "utf8");
    }
    writeFileSync(join(mcpDir, "README.md"), mcpReadme(mcpEntries.length), "utf8");
  }
  counts.mcp = mcpEntries.length;
  console.log(`  mcps: ${mcpEntries.length} files`);

  // ── Catalog-only types ───────────────────────────────────────────────────────

  for (const type of CATALOG_TYPES) {
    if (REAL_FILE_TYPES.has(type)) {
      console.log(`  SKIP ${type} (real-file type, already at root)`);
      continue;
    }
    console.log(`Loading brain/components/${type}/ …`);
    const entries = loadBrainType(type);
    // Use type as-is for root folder name
    const typeDir = join(ROOT, type);
    if (!DRY_RUN) {
      resetDir(typeDir);
      for (const entry of entries) {
        writeFileSync(join(typeDir, `${entry.slug}.md`), generateCatalogCard(entry), "utf8");
      }
      if (entries.length > 0) {
        writeFileSync(join(typeDir, "README.md"), typeReadme(type, entries.length), "utf8");
      }
    }
    counts[type] = entries.length;
    console.log(`  ${type}: ${entries.length} files`);
  }

  // ── summary ──────────────────────────────────────────────────────────────────

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log("\n════════════════════════════════════════════════");
  console.log("  surface.mjs — " + (DRY_RUN ? "DRY RUN" : "APPLIED"));
  console.log("════════════════════════════════════════════════");
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k.padEnd(20)} ${v.toLocaleString()}`);
  }
  console.log("  ──────────────────────────────────────────");
  console.log(`  TOTAL                ${total.toLocaleString()}`);
  console.log("════════════════════════════════════════════════\n");

  if (DRY_RUN) console.log("Run with --apply to write files.\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
