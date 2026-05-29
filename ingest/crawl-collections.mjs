#!/usr/bin/env node
// Component COLLECTIONS crawler. Deterministic generator (parse source tree ->
// emit one component stub per entry; NEVER hand-authoring) that fills the
// under-covered registry categories from their biggest open-source catalogs:
//
//   1. claudemd-rules <- PatrickJS/awesome-cursorrules  (rules/*.mdc, ~256)
//   2. subagents      <- VoltAgent/awesome-claude-code-subagents (categories/**/*.md, ~154)
//   3. hooks          <- disler/claude-code-hooks-mastery (.claude/hooks/*.py)
//                      + decider/claude-hooks            (hooks/*-*.py)
//
// Zero npm deps. Reuses crawl.mjs's `toMarkdown` + `slugify` serializer and
// validates against catalog.mjs's `parseFrontmatter`. Idempotent: each owned
// incoming dir is RESET then re-emitted so upstream deletions propagate and
// re-runs overwrite cleanly. Does NOT promote (stays in incoming/).
//
// SCRUB: descriptions/bodies are sanitized — no absolute /Users/ paths and no
// personal-name leakage. Filenames are unique within a type via -2/-3 suffix.
//
// Run (after `git clone --depth 1` each source into /tmp):
//   node ingest/crawl-collections.mjs \
//     --cursorrules /tmp/eng-cursorrules \
//     --voltagent   /tmp/eng-voltagent \
//     --disler      /tmp/eng-disler \
//     --decider     /tmp/eng-decider \
//     [--apply]      # default: dry-run
import {
  mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync, statSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-05-26";

// --- Shared helpers --------------------------------------------------------

// Make a name unique within a Set by appending -2, -3, ... on collision.
function uniqueName(base, seen) {
  let name = base || "untitled";
  if (!seen.has(name)) { seen.add(name); return name; }
  for (let n = 2; ; n++) {
    const cand = `${name}-${n}`;
    if (!seen.has(cand)) { seen.add(cand); return cand; }
  }
}

// Wipe a directory tree's contents so re-runs are clean.
function resetDir(dir) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

// Recursively collect files matching a predicate.
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

// Collapse whitespace into a single tidy line.
function oneLine(s) { return String(s || "").replace(/\s+/g, " ").trim(); }

// SCRUB: strip absolute home paths and personal-name leakage from any text
// that lands in frontmatter or body. Replaces /Users/<name>/... and
// /home/<name>/... with a generic placeholder; redacts a known owner handle
// only when it appears as a filesystem path component (not in source_repo).
function scrub(s) {
  return oneLine(s)
    .replace(/\/Users\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/home\/[^\s/]+(\/[^\s]*)?/g, "<path>")
    .replace(/\/root(\/[^\s]*)?/g, "<path>");
}

// Extract the first YAML frontmatter `description:` value from raw md/mdc text.
function frontmatterField(raw, field) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return "";
  const line = m[1].split(/\r?\n/).find((l) => new RegExp(`^${field}:`).test(l));
  if (!line) return "";
  return line.replace(new RegExp(`^${field}:\\s*`), "").replace(/^["']|["']$/g, "").trim();
}

// Extract the first triple-quoted Python docstring (used for hook descriptions).
function pyDocstring(raw) {
  const m = raw.match(/"""([\s\S]*?)"""/);
  return m ? oneLine(m[1]) : "";
}

// =====================================================================
// SOURCE 1: PatrickJS/awesome-cursorrules -> claudemd-rules
// rules/<slug>.mdc, each with YAML frontmatter `description:`. Cursor rules
// are valid agent-harness rules; catalogued as type: claudemd-rules.
// =====================================================================
export function cursorRulesAdapter({ repoDir, existingNames = new Set() }) {
  const name = "cursor-rules";
  const type = "claudemd-rules";
  const rulesDir = join(repoDir, "rules");
  const owner = "PatrickJS", repo = "awesome-cursorrules";
  const seen = new Set(existingNames);
  return {
    name, type,
    async fetch() {
      const files = walkFiles(rulesDir, (f) => f.endsWith(".mdc")).sort();
      return files.map((f) => {
        const raw = readFileSync(f, "utf8");
        const fileSlug = basename(f, ".mdc");
        return {
          fileSlug,
          relPath: `rules/${basename(f)}`,
          description: frontmatterField(raw, "description"),
        };
      });
    },
    toComponent(item) {
      const base = slugify(item.fileSlug);
      const uname = uniqueName(base, seen);
      const desc = scrub(item.description) ||
        `Apply the ${item.fileSlug.replace(/-/g, " ")} Cursor rules when working in that stack.`;
      const url = `https://github.com/${owner}/${repo}/blob/main/${item.relPath}`;
      return { frontmatter: {
        name: uname, type, description: desc,
        source_repo: `${owner}/${repo}`, source_url: url,
        license: "CC0-1.0",
        cli_compat: ["claude", "cursor"],
        maturity: "beta", stars: null, eval_score: null,
        verified_at: VERIFIED_AT, related: [],
        tags: ["cursor-rules", "claude-md-files", "rules"],
      }, body: `## What it is\n${desc}\n\n## When to use it\n${desc}\n\n## How to install / invoke\n` +
        "```bash\n# copy the rule into your project (Cursor reads .mdc; Claude can read it as CLAUDE.md guidance)\n" +
        `curl -sL https://github.com/${owner}/${repo}/raw/main/${item.relPath} -o .cursor/rules/${item.fileSlug}.mdc\n` +
        "```\n\n## Notes\n" +
        `Migrated from [\`${owner}/${repo}\`](${url}) (the largest Cursor-rules collection). ` +
        `Cursor \`.mdc\` rule files are valid agent-harness rules. Pending verify -> promote.` };
    },
  };
}

// =====================================================================
// SOURCE 2: VoltAgent/awesome-claude-code-subagents -> subagents
// categories/NN-<area>/<slug>.md, each a real Claude sub-agent definition
// with YAML frontmatter (name, description, tools, model). README.md excluded.
// =====================================================================
export function voltAgentAdapter({ repoDir, existingNames = new Set() }) {
  const name = "cc-subagents";
  const type = "subagents";
  const catDir = join(repoDir, "categories");
  const owner = "VoltAgent", repo = "awesome-claude-code-subagents";
  const seen = new Set(existingNames);
  return {
    name, type,
    async fetch() {
      const files = walkFiles(catDir, (f) => f.endsWith(".md") && basename(f) !== "README.md").sort();
      return files.map((f) => {
        const raw = readFileSync(f, "utf8");
        const category = basename(dirname(f)).replace(/^\d+-/, "");
        const fmName = frontmatterField(raw, "name");
        const model = frontmatterField(raw, "model");
        return {
          fileSlug: basename(f, ".md"),
          fmName,
          model,
          category,
          relPath: `categories/${basename(dirname(f))}/${basename(f)}`,
          description: frontmatterField(raw, "description"),
        };
      });
    },
    toComponent(item) {
      // Prefer the frontmatter name; fall back to filename. kebab-case slug.
      const base = slugify(item.fmName || item.fileSlug);
      const uname = uniqueName(base, seen);
      const desc = scrub(item.description) ||
        `Use the ${item.fileSlug.replace(/-/g, " ")} sub-agent for ${item.category.replace(/-/g, " ")} tasks.`;
      const url = `https://github.com/${owner}/${repo}/blob/main/${item.relPath}`;
      const modelNote = item.model ? ` (model: ${item.model})` : "";
      return { frontmatter: {
        name: uname, type, description: desc,
        source_repo: `${owner}/${repo}`, source_url: url,
        license: "MIT",
        cli_compat: ["claude"],
        maturity: "beta", stars: null, eval_score: null,
        verified_at: VERIFIED_AT, related: [],
        tags: [item.category, "subagent"],
      }, body: `## What it is\n\`${owner}/${repo}\` sub-agent \`${item.fileSlug}\`${modelNote}, ` +
        `from the \`${item.category}\` category. ${desc}\n\n## When to use it\n${desc}\n\n` +
        "## How to install / invoke\n```bash\n# copy the agent definition into your project's .claude/agents/\n" +
        `curl -sL https://github.com/${owner}/${repo}/raw/main/${item.relPath} -o .claude/agents/${item.fileSlug}.md\n` +
        "```\n\n## Notes\n" +
        `Extracted from [\`${owner}/${repo}\`](${url}). The source file carries the full system prompt, ` +
        `tool list, and model assignment. Pending verify -> promote.` };
    },
  };
}

// =====================================================================
// SOURCE 3: hooks — two repos merged into incoming/cc-hooks/
//   3a. disler/claude-code-hooks-mastery  .claude/hooks/*.py  (lifecycle hooks)
//   3b. decider/claude-hooks               hooks/*-*.py        (dispatchers/validators)
// Each Claude Code lifecycle event name maps to a clear WHEN-to-use trigger.
// =====================================================================

// Map a Claude Code lifecycle hook (file stem) to a WHEN-to-use trigger line.
const HOOK_TRIGGERS = {
  pre_tool_use: "Run before every tool call to inspect, gate, or block the tool input (e.g. veto dangerous shell commands).",
  post_tool_use: "Run after every tool call to log, validate, or react to the tool's result.",
  post_tool_use_failure: "Run when a tool call fails, to capture the error, notify, or trigger recovery.",
  user_prompt_submit: "Run when the user submits a prompt, to log it or inject extra context before the model sees it.",
  notification: "Run on Claude Code notification events to surface alerts (e.g. text-to-speech, desktop toast).",
  permission_request: "Run when a permission dialog is shown, to audit, auto-approve, or deny tool permissions.",
  stop: "Run when the main agent finishes responding, to announce completion or run end-of-turn checks.",
  subagent_start: "Run when a sub-agent starts, to set up context or log the delegation.",
  subagent_stop: "Run when a sub-agent finishes, to capture its output or chain follow-up work.",
  session_start: "Run at session start, to load context, memory, or environment state.",
  session_end: "Run at session end, to flush logs, persist memory, or clean up.",
  pre_compact: "Run before context compaction, to flush state to disk so nothing is lost.",
  setup: "Run on setup/initialization to prepare the hook environment.",
};

export function hooksAdapter({ dislerDir, deciderDir, existingNames = new Set() }) {
  const name = "cc-hooks";
  const type = "hooks";
  const seen = new Set(existingNames);
  return {
    name, type,
    async fetch() {
      const items = [];
      // 3a. disler lifecycle hooks (top-level .claude/hooks/*.py only — skip utils/validators).
      const dislerHooks = join(dislerDir, ".claude", "hooks");
      if (existsSync(dislerHooks)) {
        for (const f of readdirSync(dislerHooks).filter((x) => x.endsWith(".py")).sort()) {
          const stem = basename(f, ".py");
          const raw = readFileSync(join(dislerHooks, f), "utf8");
          items.push({
            source: "disler", owner: "disler", repo: "claude-code-hooks-mastery",
            license: "unknown",
            fileSlug: stem.replace(/_/g, "-"),
            relPath: `.claude/hooks/${f}`,
            trigger: HOOK_TRIGGERS[stem] || "",
            docstring: pyDocstring(raw),
          });
        }
      }
      // 3b. decider hook scripts (kebab-named dispatchers/validators in hooks/).
      const deciderHooks = join(deciderDir, "hooks");
      if (existsSync(deciderHooks)) {
        for (const f of readdirSync(deciderHooks)
          .filter((x) => x.endsWith(".py") && x.includes("-")).sort()) {
          const stem = basename(f, ".py");
          const raw = readFileSync(join(deciderHooks, f), "utf8");
          items.push({
            source: "decider", owner: "decider", repo: "claude-hooks",
            license: "MIT",
            fileSlug: slugify(stem),
            relPath: `hooks/${f}`,
            trigger: "",
            docstring: pyDocstring(raw),
          });
        }
      }
      return items;
    },
    toComponent(item) {
      // Disambiguate same-named hooks across repos by prefixing the repo owner.
      const base = uniqueName(slugify(item.fileSlug), new Set()); // no-op normalize
      const candidate = seen.has(base) ? `${item.owner}-${base}` : base;
      const uname = uniqueName(candidate, seen);
      const desc = scrub(item.trigger || item.docstring) ||
        `Use the ${item.fileSlug.replace(/-/g, " ")} Claude Code hook from ${item.owner}/${item.repo}.`;
      const url = `https://github.com/${item.owner}/${item.repo}/blob/main/${item.relPath}`;
      const detail = item.docstring ? `\n\nSource docstring: ${scrub(item.docstring)}` : "";
      return { frontmatter: {
        name: uname, type, description: desc,
        source_repo: `${item.owner}/${item.repo}`, source_url: url,
        license: item.license,
        cli_compat: ["claude"],
        maturity: "beta", stars: null, eval_score: null,
        verified_at: VERIFIED_AT, related: [],
        tags: ["hook", item.owner],
      }, body: `## What it is\nA Claude Code hook from [\`${item.owner}/${item.repo}\`](${url}). ${desc}` +
        `\n\n## When to use it\n${desc}\n\n## How to install / invoke\n` +
        "```bash\n# wire the script into .claude/settings.json hooks for the matching event\n" +
        `curl -sL https://github.com/${item.owner}/${item.repo}/raw/main/${item.relPath} -o .claude/hooks/${item.fileSlug}.py\n` +
        "```\n\n## Notes\n" +
        `Extracted from \`${item.relPath}\`. See the repo for the settings.json wiring and full implementation.${detail} Pending verify -> promote.` };
    },
  };
}

// --- Run one adapter: fetch -> toComponent -> write stubs (resets dir first) ---
export async function runCollection(adapter, { dryRun = true, outDir = INCOMING, log = console.log } = {}) {
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
    if (fm.name !== frontmatter.name) throw new Error(`name roundtrip mismatch for ${file}: ${fm.name} != ${frontmatter.name}`);
    if (!dryRun) writeFileSync(file, md);
    written.push({ file, frontmatter, md });
  }
  log(`${dryRun ? "[dry-run] " : ""}${adapter.name}: ${written.length} stub(s) -> incoming/${adapter.name}/`);
  return written;
}

// --- CLI ------------------------------------------------------------------
function arg(args, flag) { const i = args.indexOf(flag); return i === -1 ? null : args[i + 1]; }

async function main(argv) {
  const args = argv.slice(2);
  const dryRun = !args.includes("--apply");
  const cursorrules = arg(args, "--cursorrules");
  const voltagent = arg(args, "--voltagent");
  const disler = arg(args, "--disler");
  const decider = arg(args, "--decider");
  if (!cursorrules && !voltagent && !disler && !decider) {
    console.error("usage: crawl-collections.mjs --cursorrules <dir> --voltagent <dir> --disler <dir> --decider <dir> [--apply]");
    process.exit(2);
  }
  if (cursorrules) await runCollection(cursorRulesAdapter({ repoDir: cursorrules }), { dryRun });
  if (voltagent) await runCollection(voltAgentAdapter({ repoDir: voltagent }), { dryRun });
  if (disler || decider) {
    await runCollection(hooksAdapter({ dislerDir: disler || "", deciderDir: decider || "" }), { dryRun });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
