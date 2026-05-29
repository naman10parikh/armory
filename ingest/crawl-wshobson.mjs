#!/usr/bin/env node
// Component crawler for wshobson/agents + wshobson/commands.
//
//   wshobson/agents  → plugins/*/agents/*.md  → type: subagents  (191 files)
//                      plugins/*/commands/*.md → type: workflows  (102 files)
//   wshobson/commands → tools/*.md            → type: workflows  (42 files)
//                       workflows/*.md         → type: workflows  (15 files)
//
// README.md and non-component docs are skipped.
// Output: incoming/wshobson/<slug>.md  (dir reset on --apply).
// Zero npm deps. Self-validates each stub via parseFrontmatter before writing.
//
// Run:
//   node ingest/crawl-wshobson.mjs \
//     --agents   /tmp/eng-wsh-agents \
//     --commands /tmp/eng-wsh-commands \
//     [--apply]   # default: dry-run

import {
  mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync, statSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-05-27";
const WSHOBSON_DIR = join(INCOMING, "wshobson");

// --- Shared helpers (mirrored from crawl-collections.mjs) ------------------

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

function walkFiles(dir, pred, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walkFiles(full, pred, acc);
    else if (pred(full)) acc.push(full);
  }
  return acc;
}

function oneLine(s) { return String(s || "").replace(/\s+/g, " ").trim(); }

function scrub(s) {
  return oneLine(s)
    .replace(/\/Users\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/home\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/root(\/[^\s]*)?/g, "<path>");
}

// Extract a YAML frontmatter field from raw markdown text.
function frontmatterField(raw, field) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return "";
  const line = m[1].split(/\r?\n/).find((l) => new RegExp(`^${field}:`).test(l));
  if (!line) return "";
  return line.replace(new RegExp(`^${field}:\\s*`), "").replace(/^["']|["']$/g, "").trim();
}

// Extract the first non-empty prose line after the frontmatter block (or after
// any leading heading), used as a fallback description.
function firstProseLine(raw) {
  const afterFm = raw.replace(/^---[\s\S]*?---\n?/, "");
  for (const line of afterFm.split(/\r?\n/)) {
    const t = line.replace(/^#+\s*/, "").replace(/^\[Extended thinking:.*/, "").trim();
    if (t.length > 10) return t;
  }
  return "";
}

// =====================================================================
// ADAPTER: wshobson/agents → subagents (plugins/*/agents/*.md)
//                          → workflows (plugins/*/commands/*.md)
// =====================================================================
function wshobsonAgentsAdapter({ repoDir, seen }) {
  const owner = "wshobson";
  const repo = "agents";

  async function fetch() {
    const pluginsDir = join(repoDir, "plugins");
    if (!existsSync(pluginsDir)) return [];
    const items = [];

    for (const pluginName of readdirSync(pluginsDir).sort()) {
      const pluginDir = join(pluginsDir, pluginName);
      if (!statSync(pluginDir).isDirectory()) continue;

      // Sub-agents: plugins/<name>/agents/*.md
      const agentsDir = join(pluginDir, "agents");
      for (const file of walkFiles(agentsDir, (f) => f.endsWith(".md") && basename(f) !== "README.md").sort()) {
        const raw = readFileSync(file, "utf8");
        items.push({
          type: "subagents",
          plugin: pluginName,
          fileSlug: basename(file, ".md"),
          relPath: `plugins/${pluginName}/agents/${basename(file)}`,
          fmName: frontmatterField(raw, "name"),
          fmDescription: frontmatterField(raw, "description"),
          fmModel: frontmatterField(raw, "model"),
          raw,
        });
      }

      // Workflows: plugins/<name>/commands/*.md
      const commandsDir = join(pluginDir, "commands");
      for (const file of walkFiles(commandsDir, (f) => f.endsWith(".md") && basename(f) !== "README.md").sort()) {
        const raw = readFileSync(file, "utf8");
        items.push({
          type: "workflows",
          plugin: pluginName,
          fileSlug: basename(file, ".md"),
          relPath: `plugins/${pluginName}/commands/${basename(file)}`,
          fmName: frontmatterField(raw, "name"),
          fmDescription: frontmatterField(raw, "description"),
          fmModel: frontmatterField(raw, "model"),
          raw,
        });
      }
    }
    return items;
  }

  function toComponent(item) {
    const base = slugify(item.fmName || item.fileSlug);
    const uname = uniqueName(base, seen);
    const rawDesc = item.fmDescription || firstProseLine(item.raw);
    const desc = scrub(rawDesc) ||
      `${item.type === "subagents" ? "Sub-agent" : "Workflow"} for ${item.fileSlug.replace(/-/g, " ")} tasks from the ${item.plugin} plugin.`;
    const url = `https://github.com/${owner}/${repo}/blob/main/${item.relPath}`;
    const modelNote = item.fmModel ? ` (model: ${item.fmModel})` : "";

    return {
      frontmatter: {
        name: uname,
        type: item.type,
        description: desc,
        source_repo: `${owner}/${repo}`,
        source_url: url,
        license: "MIT",
        cli_compat: ["claude"],
        maturity: "beta",
        stars: null,
        eval_score: null,
        verified_at: VERIFIED_AT,
        related: [],
        tags: [repo, item.type],
      },
      body: `## What it is\n` +
        `\`${owner}/${repo}\` ${item.type === "subagents" ? "sub-agent" : "workflow"} \`${item.fileSlug}\`${modelNote} ` +
        `from the \`${item.plugin}\` plugin. ${desc}\n\n` +
        `## When to use it\n${desc}\n\n` +
        `## How to install / invoke\n` +
        (item.type === "subagents"
          ? "```bash\n# copy the agent definition into your project's .claude/agents/\n" +
            `curl -sL https://github.com/${owner}/${repo}/raw/main/${item.relPath} -o .claude/agents/${item.fileSlug}.md\n` +
            "```\n"
          : "```bash\n# copy the workflow into your project's .claude/commands/\n" +
            `curl -sL https://github.com/${owner}/${repo}/raw/main/${item.relPath} -o .claude/commands/${item.fileSlug}.md\n` +
            "```\n") +
        `\n## Notes\n` +
        `Extracted from [\`${owner}/${repo}\`](${url}). Plugin: \`${item.plugin}\`. Pending verify -> promote.`,
    };
  }

  return { name: "wshobson-agents", fetch, toComponent };
}

// =====================================================================
// ADAPTER: wshobson/commands → workflows (tools/*.md + workflows/*.md)
// =====================================================================
function wshobsonCommandsAdapter({ repoDir, seen }) {
  const owner = "wshobson";
  const repo = "commands";

  async function fetch() {
    const items = [];

    // tools/ directory
    const toolsDir = join(repoDir, "tools");
    for (const file of walkFiles(toolsDir, (f) => f.endsWith(".md") && basename(f) !== "README.md").sort()) {
      const raw = readFileSync(file, "utf8");
      items.push({
        subdir: "tools",
        fileSlug: basename(file, ".md"),
        relPath: `tools/${basename(file)}`,
        fmName: frontmatterField(raw, "name"),
        fmDescription: frontmatterField(raw, "description"),
        raw,
      });
    }

    // workflows/ directory
    const workflowsDir = join(repoDir, "workflows");
    for (const file of walkFiles(workflowsDir, (f) => f.endsWith(".md") && basename(f) !== "README.md").sort()) {
      const raw = readFileSync(file, "utf8");
      items.push({
        subdir: "workflows",
        fileSlug: basename(file, ".md"),
        relPath: `workflows/${basename(file)}`,
        fmName: frontmatterField(raw, "name"),
        fmDescription: frontmatterField(raw, "description"),
        raw,
      });
    }

    return items;
  }

  function toComponent(item) {
    const base = slugify(item.fmName || item.fileSlug);
    const uname = uniqueName(base, seen);
    const rawDesc = item.fmDescription || firstProseLine(item.raw);
    const desc = scrub(rawDesc) ||
      `Workflow command for ${item.fileSlug.replace(/-/g, " ")} tasks.`;
    const url = `https://github.com/${owner}/${repo}/blob/main/${item.relPath}`;

    return {
      frontmatter: {
        name: uname,
        type: "workflows",
        description: desc,
        source_repo: `${owner}/${repo}`,
        source_url: url,
        license: "MIT",
        cli_compat: ["claude"],
        maturity: "beta",
        stars: null,
        eval_score: null,
        verified_at: VERIFIED_AT,
        related: [],
        tags: [repo, item.subdir],
      },
      body: `## What it is\n` +
        `\`${owner}/${repo}\` workflow command \`${item.fileSlug}\` from the \`${item.subdir}\` directory. ${desc}\n\n` +
        `## When to use it\n${desc}\n\n` +
        `## How to install / invoke\n` +
        "```bash\n# add the command file to your project's .claude/commands/\n" +
        `curl -sL https://github.com/${owner}/${repo}/raw/main/${item.relPath} -o .claude/commands/${item.fileSlug}.md\n` +
        "```\n\n## Notes\n" +
        `Extracted from [\`${owner}/${repo}\`](${url}). Category: \`${item.subdir}\`. Pending verify -> promote.`,
    };
  }

  return { name: "wshobson-commands", fetch, toComponent };
}

// =====================================================================
// RUNNER: fetch -> toComponent -> self-validate -> write
// =====================================================================
// resetOnce: caller is responsible for resetting the dir before the first adapter.
async function runAdapter(adapter, { dryRun = true, log = console.log } = {}) {
  const items = await adapter.fetch();
  const written = [];

  for (const item of items) {
    const { frontmatter, body } = adapter.toComponent(item);
    const file = join(WSHOBSON_DIR, `${frontmatter.name}.md`);
    const md = toMarkdown({ frontmatter, body });

    // Self-validate: parseFrontmatter must round-trip the name field.
    const fm = parseFrontmatter(md);
    if (fm.name !== frontmatter.name) {
      throw new Error(`name roundtrip mismatch for ${file}: got "${fm.name}", expected "${frontmatter.name}"`);
    }

    if (dryRun) {
      log(`[dry-run] would write ${file} (${md.split("\n").length} lines)`);
    } else {
      mkdirSync(WSHOBSON_DIR, { recursive: true });
      writeFileSync(file, md);
    }
    written.push({ file, frontmatter });
  }

  log(`${dryRun ? "[dry-run] " : ""}${adapter.name}: ${written.length} stub(s) -> incoming/wshobson/`);
  return written;
}

// =====================================================================
// CLI
// =====================================================================
function arg(args, flag) { const i = args.indexOf(flag); return i === -1 ? null : args[i + 1]; }

async function main(argv) {
  const args = argv.slice(2);
  const dryRun = !args.includes("--apply");
  const agentsDir = arg(args, "--agents");
  const commandsDir = arg(args, "--commands");

  if (!agentsDir && !commandsDir) {
    console.error("usage: crawl-wshobson.mjs --agents <dir> --commands <dir> [--apply]");
    process.exit(2);
  }

  // Single shared seen set so slug uniqueness spans both adapters.
  const seen = new Set();

  // Reset once before writing any stubs (so both adapters share the same clean dir).
  if (!dryRun) resetDir(WSHOBSON_DIR);

  let totalSubagents = 0;
  let totalWorkflows = 0;

  if (agentsDir) {
    const adapter = wshobsonAgentsAdapter({ repoDir: agentsDir, seen });
    const written = await runAdapter(adapter, { dryRun });
    totalSubagents += written.filter((w) => w.frontmatter.type === "subagents").length;
    totalWorkflows += written.filter((w) => w.frontmatter.type === "workflows").length;
  }

  if (commandsDir) {
    const adapter = wshobsonCommandsAdapter({ repoDir: commandsDir, seen });
    const written = await runAdapter(adapter, { dryRun });
    totalWorkflows += written.length;
  }

  console.log(`\nTotal: ${totalSubagents} subagents + ${totalWorkflows} workflows = ${totalSubagents + totalWorkflows} stubs`);
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
