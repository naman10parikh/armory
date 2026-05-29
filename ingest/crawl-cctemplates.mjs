#!/usr/bin/env node
// Component cc-templates crawler. Deterministic generator that walks
// davila7/claude-code-templates (aitmpl.com) and emits one component stub per
// component file into incoming/cc-templates/<slug>.md.
//
// Source layout (cli-tool/components/):
//   agents/**/*.md       -> type: subagents
//   commands/**/*.md     -> type: workflows
//   hooks/**/*.json|py|sh (excl. HOOK_PATTERNS_COMPRESSED.json) -> type: hooks
//   mcps/**/*.json       -> type: mcps
//   settings/**/*.json   -> type: claudemd-rules
//   skills/**/SKILL.md   -> type: skills
//
// Zero npm deps. Reuses crawl.mjs's `toMarkdown` + `slugify` serializer.
// Validates every stub via catalog.mjs's `parseFrontmatter`.
//
// Run (after git clone --depth 1 https://github.com/davila7/claude-code-templates /tmp/eng-cctemplates):
//   node ingest/crawl-cctemplates.mjs --repo /tmp/eng-cctemplates [--apply]
//   (default: dry-run)
import {
  mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync, statSync,
} from "node:fs";
import { join, dirname, basename, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-05-27";
const OWNER = "davila7";
const REPO = "claude-code-templates";
const GITHUB_BLOB = `https://github.com/${OWNER}/${REPO}/blob/main`;

// --- Shared helpers (mirrors crawl-collections.mjs exactly) ----------------

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

// Extract a YAML frontmatter field value from raw markdown text.
function frontmatterField(raw, field) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return "";
  const line = m[1].split(/\r?\n/).find((l) => new RegExp(`^${field}:`).test(l));
  if (!line) return "";
  return line.replace(new RegExp(`^${field}:\\s*`), "").replace(/^["']|["']$/g, "").trim();
}

// Return the first non-heading, non-empty prose line from a markdown body
// (used as fallback description when frontmatter has none).
function firstProseLine(raw) {
  // Strip frontmatter block first
  const body = raw.replace(/^---[\s\S]*?---\r?\n/, "");
  for (const line of body.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith("```") || t.startsWith("!")) continue;
    return t.slice(0, 200);
  }
  return "";
}

// Build a github blob URL for a file given its absolute path inside the cloned repo.
function blobUrl(repoDir, absPath) {
  const rel = relative(repoDir, absPath).replace(/\\/g, "/");
  return `${GITHUB_BLOB}/${rel}`;
}

// Build a human-readable name from a file path (stem + parent category).
function humanName(filePath) {
  const stem = basename(filePath, extname(filePath));
  return stem.replace(/[-_]/g, " ");
}

// =====================================================================
// ADAPTER: davila7/claude-code-templates -> all types in one pass
// One shared `seen` Set for collision-free names across the full source.
// =====================================================================
export function ccTemplatesAdapter({ repoDir }) {
  const name = "cc-templates";
  const componentsDir = join(repoDir, "cli-tool", "components");
  const seen = new Set();

  return {
    name,
    async fetch() {
      const items = [];

      // ── subagents: agents/**/*.md ────────────────────────────────────────
      const agentsDir = join(componentsDir, "agents");
      const agentFiles = walkFiles(agentsDir, (f) => f.endsWith(".md")).sort();
      for (const f of agentFiles) {
        const raw = readFileSync(f, "utf8");
        const category = deriveCategory(f, agentsDir);
        items.push({
          type: "subagents",
          file: f,
          category,
          raw,
          descFromFm: frontmatterField(raw, "description"),
          nameFromFm: frontmatterField(raw, "name"),
        });
      }

      // ── workflows: commands/**/*.md ──────────────────────────────────────
      const commandsDir = join(componentsDir, "commands");
      const commandFiles = walkFiles(commandsDir, (f) => f.endsWith(".md")).sort();
      for (const f of commandFiles) {
        const raw = readFileSync(f, "utf8");
        const category = deriveCategory(f, commandsDir);
        items.push({
          type: "workflows",
          file: f,
          category,
          raw,
          descFromFm: frontmatterField(raw, "description") || frontmatterField(raw, "argument-hint"),
          nameFromFm: frontmatterField(raw, "name"),
        });
      }

      // ── hooks: hooks/**/{*.json,*.py,*.sh} (not HOOK_PATTERNS_COMPRESSED.json) ─
      const hooksDir = join(componentsDir, "hooks");
      const hookFiles = walkFiles(hooksDir, (f) => {
        const ext = extname(f);
        if (basename(f) === "HOOK_PATTERNS_COMPRESSED.json") return false;
        return ext === ".json" || ext === ".py" || ext === ".sh";
      }).sort();
      for (const f of hookFiles) {
        const raw = readFileSync(f, "utf8");
        const category = deriveCategory(f, hooksDir);
        let descFromFm = "";
        if (extname(f) === ".json") {
          try {
            const parsed = JSON.parse(raw);
            descFromFm = scrub(parsed.description || "");
          } catch { /* ignore malformed json */ }
        } else {
          // .py / .sh: try docstring or first comment block
          const docM = raw.match(/"""([\s\S]*?)"""/);
          if (docM) {
            descFromFm = oneLine(docM[1]);
          } else {
            const commentM = raw.match(/^#[^!](.+)/m);
            if (commentM) descFromFm = commentM[1].trim();
          }
        }
        items.push({
          type: "hooks",
          file: f,
          category,
          raw,
          descFromFm,
          nameFromFm: "",
        });
      }

      // ── mcps: mcps/**/*.json ─────────────────────────────────────────────
      const mcpsDir = join(componentsDir, "mcps");
      const mcpFiles = walkFiles(mcpsDir, (f) => f.endsWith(".json")).sort();
      for (const f of mcpFiles) {
        const raw = readFileSync(f, "utf8");
        const category = deriveCategory(f, mcpsDir);
        let descFromFm = "";
        let nameFromFm = "";
        try {
          const parsed = JSON.parse(raw);
          // Structure: { mcpServers: { <serverName>: { description, command, args } } }
          const servers = parsed.mcpServers || {};
          const serverNames = Object.keys(servers);
          if (serverNames.length > 0) {
            nameFromFm = serverNames[0]; // use first server name
            descFromFm = scrub(servers[serverNames[0]].description || "");
          }
        } catch { /* ignore malformed json */ }
        items.push({
          type: "mcps",
          file: f,
          category,
          raw,
          descFromFm,
          nameFromFm,
        });
      }

      // ── claudemd-rules: settings/**/*.json ──────────────────────────────
      const settingsDir = join(componentsDir, "settings");
      const settingsFiles = walkFiles(settingsDir, (f) => f.endsWith(".json")).sort();
      for (const f of settingsFiles) {
        const raw = readFileSync(f, "utf8");
        const category = deriveCategory(f, settingsDir);
        let descFromFm = "";
        try {
          const parsed = JSON.parse(raw);
          descFromFm = scrub(parsed.description || "");
        } catch { /* ignore malformed json */ }
        items.push({
          type: "claudemd-rules",
          file: f,
          category,
          raw,
          descFromFm,
          nameFromFm: "",
        });
      }

      // ── skills: skills/**/SKILL.md (canonical per-skill definition only) ─
      const skillsDir = join(componentsDir, "skills");
      const skillFiles = walkFiles(skillsDir, (f) => basename(f) === "SKILL.md").sort();
      for (const f of skillFiles) {
        const raw = readFileSync(f, "utf8");
        // Category = parent directory name (the skill group)
        const category = basename(dirname(f));
        items.push({
          type: "skills",
          file: f,
          category,
          raw,
          descFromFm: frontmatterField(raw, "description"),
          nameFromFm: frontmatterField(raw, "name") || category,
        });
      }

      return items;
    },

    toComponent(item) {
      // Derive name: prefer frontmatter name, else file stem (or dir for SKILL.md)
      const fileBase = item.nameFromFm
        ? slugify(item.nameFromFm)
        : (basename(item.file) === "SKILL.md"
            ? slugify(basename(dirname(item.file)))
            : slugify(basename(item.file, extname(item.file))));

      const uname = uniqueName(fileBase, seen);

      // Derive description: frontmatter > first prose line > sensible default
      const desc = scrub(
        item.descFromFm ||
        firstProseLine(item.raw) ||
        `${item.type.replace(/-/g, " ")} template: ${humanName(item.file)} (${item.category})`
      );

      const url = blobUrl(repoDir, item.file);
      const tags = [item.category, item.type];

      return {
        frontmatter: {
          name: uname,
          type: item.type,
          description: desc,
          source_repo: `${OWNER}/${REPO}`,
          source_url: url,
          license: "MIT",
          cli_compat: ["claude"],
          maturity: "beta",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags,
        },
        body: buildBody(item, uname, desc, url),
      };
    },
  };
}

// Derive a category label from a file's immediate parent relative to a base dir.
function deriveCategory(filePath, baseDir) {
  const rel = relative(baseDir, filePath);
  const parts = rel.split("/");
  return parts.length > 1 ? parts[0] : "general";
}

// Build a consistent stub body for each type.
function buildBody(item, uname, desc, url) {
  const { type, category } = item;
  const installHint = buildInstallHint(item, uname, url);
  return (
    `## What it is\n${desc}\n\n` +
    `## When to use it\n${desc}\n\n` +
    `## How to install / invoke\n${installHint}\n\n` +
    `## Notes\n` +
    `Extracted from [\`${OWNER}/${REPO}\`](${url}) — ${category} category. ` +
    `Type: ${type}. Pending verify -> promote.`
  );
}

function buildInstallHint(item, uname, url) {
  const stem = basename(item.file, extname(item.file));
  const ext = extname(item.file);
  switch (item.type) {
    case "subagents":
      return (
        "```bash\n# Copy the agent definition into your project's .claude/agents/\n" +
        `curl -sL https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${relative("/tmp/eng-cctemplates", item.file).replace(/\\/g, "/")} -o .claude/agents/${stem}.md\n` +
        "```"
      );
    case "workflows":
      return (
        "```bash\n# Copy the command into your project's .claude/commands/\n" +
        `curl -sL https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${relative("/tmp/eng-cctemplates", item.file).replace(/\\/g, "/")} -o .claude/commands/${stem}.md\n` +
        "```"
      );
    case "hooks":
      return (
        "```bash\n# Wire this hook script into .claude/settings.json\n" +
        `curl -sL https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${relative("/tmp/eng-cctemplates", item.file).replace(/\\/g, "/")} -o .claude/hooks/${stem}${ext}\n` +
        "```"
      );
    case "mcps":
      return (
        "```bash\n# Add the mcpServers block to your .claude/settings.json or .mcp.json\n" +
        `curl -sL https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${relative("/tmp/eng-cctemplates", item.file).replace(/\\/g, "/")} | jq .mcpServers\n` +
        "```"
      );
    case "claudemd-rules":
      return (
        "```bash\n# Merge the settings block into your .claude/settings.json\n" +
        `curl -sL https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${relative("/tmp/eng-cctemplates", item.file).replace(/\\/g, "/")} | jq .\n` +
        "```"
      );
    case "skills":
      return (
        "```bash\n# Copy the skill into your .claude/skills/ directory\n" +
        `curl -sL https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${relative("/tmp/eng-cctemplates", item.file).replace(/\\/g, "/")} -o .claude/skills/${basename(dirname(item.file))}/SKILL.md\n` +
        "```"
      );
    default:
      return `See source at ${url}`;
  }
}

// --- Run the adapter: fetch -> toComponent -> write stubs (resets dir first) ---
export async function runCcTemplates({ repoDir, dryRun = true, outDir = INCOMING, log = console.log }) {
  const adapter = ccTemplatesAdapter({ repoDir });
  const items = await adapter.fetch();
  const dir = join(outDir, adapter.name);
  if (!dryRun) resetDir(dir);
  const written = [];
  const byType = {};
  for (const item of items) {
    const { frontmatter, body } = adapter.toComponent(item);
    const file = join(dir, `${frontmatter.name}.md`);
    const md = toMarkdown({ frontmatter, body });
    // Self-validate every stub against the catalog parser before writing.
    const fm = parseFrontmatter(md);
    if (fm.name !== frontmatter.name) {
      throw new Error(`name roundtrip mismatch for ${file}: parsed "${fm.name}" != expected "${frontmatter.name}"`);
    }
    if (!dryRun) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, md);
    }
    byType[frontmatter.type] = (byType[frontmatter.type] || 0) + 1;
    written.push({ file, frontmatter });
  }
  const typeBreakdown = Object.entries(byType)
    .map(([t, n]) => `${t}:${n}`)
    .join(", ");
  log(`${dryRun ? "[dry-run] " : ""}${adapter.name}: ${written.length} stub(s) -> incoming/${adapter.name}/  [${typeBreakdown}]`);
  return written;
}

// --- CLI -------------------------------------------------------------------
function arg(args, flag) { const i = args.indexOf(flag); return i === -1 ? null : args[i + 1]; }

async function main(argv) {
  const args = argv.slice(2);
  const dryRun = !args.includes("--apply");
  const repoDir = arg(args, "--repo");
  if (!repoDir) {
    console.error("usage: crawl-cctemplates.mjs --repo <cloned-dir> [--apply]   (default: dry-run)");
    process.exit(2);
  }
  if (!existsSync(repoDir)) {
    console.error(`repo dir not found: ${repoDir}`);
    process.exit(2);
  }
  await runCcTemplates({ repoDir, dryRun });
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
