#!/usr/bin/env node
// Engram adapter: community skill + CLAUDE.md/rules collections.
// Sources (all from anthropics/claude-cookbook):
//   - skills (SKILL.md files) -> type: skills
//   - managed-agent CLAUDE.md harness files -> type: claudemd-rules
//
// Three repos (travis-burmaster/claude-skills, dwarvesf/prompt-log,
// PatrickJS/awesome-claude-rules) returned 404 at crawl time — handled
// gracefully (report + zero stubs). sirmalloc/ccstatusline cloned but
// carries only project-local dev guidance — no reusable skill/rule
// content; skipped.
//
// Run:
//   node ingest/crawl-more-skills.mjs --cookbook /tmp/eng-cb2 [--apply]
//
// Default: dry-run (no writes). Pass --apply to reset+write incoming/more-skills-rules/.

import {
  mkdirSync, writeFileSync, readFileSync, existsSync, rmSync,
  readdirSync, statSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const OUT_DIR  = join(INCOMING, "more-skills-rules");
const VERIFIED_AT = "2026-05-27";

// ---------------------------------------------------------------------------
// Shared helpers (mirrors crawl-collections.mjs exactly)
// ---------------------------------------------------------------------------

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

// Extract frontmatter `field:` value from raw markdown.
function frontmatterField(raw, field) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return "";
  const line = m[1].split(/\r?\n/).find((l) => new RegExp(`^${field}:`).test(l));
  if (!line) return "";
  return line.replace(new RegExp(`^${field}:\\s*`), "").replace(/^["']|["']$/g, "").trim();
}

// Return the first non-empty, non-heading prose line from markdown body
// (after any frontmatter block). Used as fallback description.
function firstProseLine(raw) {
  const body = raw.replace(/^---[\s\S]*?---\s*/, "");
  for (const line of body.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith("```") || t.startsWith("!")) continue;
    // Skip pure-badge/link lines
    if (/^\[.*\]\(.*\)$/.test(t)) continue;
    if (t.length > 10) return t;
  }
  return "";
}

// ---------------------------------------------------------------------------
// SOURCE: anthropics/claude-cookbook
// Harvests:
//   - *.../SKILL.md  files -> type: skills
//   - managed_agents/*/CLAUDE.md and claude_agent_sdk/*/CLAUDE.md -> type: claudemd-rules
//
// Exclusions:
//   - Root CLAUDE.md (project dev setup only)
//   - skills/CLAUDE.md (project dev setup only)
// ---------------------------------------------------------------------------

const OWNER = "anthropics";
const REPO  = "claude-cookbook";

// Relative paths of CLAUDE.md files worth indexing as claudemd-rules.
// These carry agent harness conventions, managed-agent patterns, and
// real operating rules — not just project setup docs.
const CLAUDEMD_RELPATHS = [
  "managed_agents/cma-mcp/CLAUDE.md",
  "managed_agents/linear/CLAUDE.md",
  "managed_agents/slack/CLAUDE.md",
  "claude_agent_sdk/chief_of_staff_agent/CLAUDE.md",
];

export function cookbookAdapter({ repoDir, existingNames = new Set() }) {
  const name  = "more-skills-rules"; // determines outDir name in runMoreSkills
  const seen  = new Set(existingNames);

  return {
    name,
    async fetch() {
      const items = [];

      // --- 1. SKILL.md files ---
      const skillFiles = walkFiles(repoDir, (f) => basename(f) === "SKILL.md").sort();
      for (const f of skillFiles) {
        const raw = readFileSync(f, "utf8");
        // Compute path relative to repo root
        const relPath = f.replace(repoDir + "/", "");
        // Use the SKILL.md frontmatter name, then dir name, then relPath slug.
        const fmName = frontmatterField(raw, "name");
        items.push({
          kind: "skill",
          relPath,
          fmName,
          description: frontmatterField(raw, "description") || firstProseLine(raw),
        });
      }

      // --- 2. CLAUDE.md files (selected managed-agent harnesses) ---
      for (const relPath of CLAUDEMD_RELPATHS) {
        const f = join(repoDir, relPath);
        if (!existsSync(f)) continue;
        const raw = readFileSync(f, "utf8");
        // Title = first heading, else dir name
        const headingMatch = raw.match(/^#+\s+(.+)/m);
        const title = headingMatch ? headingMatch[1].trim() : basename(dirname(f));
        items.push({
          kind: "claudemd-rules",
          relPath,
          fmName: title,
          description: firstProseLine(raw),
        });
      }

      return items;
    },

    toEngram(item) {
      const type = item.kind === "skill" ? "skills" : "claudemd-rules";
      const base = slugify(item.fmName || basename(dirname(item.relPath)));
      const uname = uniqueName(base, seen);

      // Build description: scrub, then fallback to filename-derived phrase.
      const rawDesc = scrub(item.description);
      const desc = rawDesc ||
        (type === "skills"
          ? `Apply the ${uname.replace(/-/g, " ")} skill in Claude Code.`
          : `Use the ${uname.replace(/-/g, " ")} CLAUDE.md harness rules for this integration.`);

      const sourceUrl = `https://github.com/${OWNER}/${REPO}/blob/main/${item.relPath}`;

      // Tags: repo short-name + type + domain tag derived from path
      const pathParts = item.relPath.split("/");
      const domainTag = pathParts.length >= 2 ? slugify(pathParts[0]) : "cookbook";

      return {
        frontmatter: {
          name: uname,
          type,
          description: desc,
          source_repo: `${OWNER}/${REPO}`,
          source_url: sourceUrl,
          license: "unknown",
          cli_compat: ["claude"],
          maturity: "beta",
          stars: null,
          eval_score: null,
          verified_at: VERIFIED_AT,
          related: [],
          tags: ["claude-cookbook", type, domainTag],
        },
        body:
          `## What it is\n${desc}\n\n` +
          `## When to use it\n${desc}\n\n` +
          "## How to install / invoke\n" +
          "```bash\n" +
          `# Download the file into your project\n` +
          `curl -sL https://github.com/${OWNER}/${REPO}/raw/main/${item.relPath} -o ${basename(item.relPath)}\n` +
          "```\n\n" +
          "## Notes\n" +
          `Extracted from [\`${OWNER}/${REPO}\`](${sourceUrl}). ` +
          (type === "skills"
            ? "Place SKILL.md in your .claude/skills/<name>/ directory to invoke as a slash command."
            : "Merge relevant sections into your project CLAUDE.md or .claude/rules/ to apply these harness conventions.") +
          " Pending verify -> promote.",
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Runner: fetch -> toEngram -> self-validate -> write (mirrors runCollection)
// ---------------------------------------------------------------------------

export async function runMoreSkills(adapter, { dryRun = true, log = console.log } = {}) {
  const items = await adapter.fetch();
  const dir   = OUT_DIR;

  if (!dryRun) resetDir(dir);

  const written = [];
  for (const item of items) {
    const { frontmatter, body } = adapter.toEngram(item);
    const file = join(dir, `${frontmatter.name}.md`);
    const md   = toMarkdown({ frontmatter, body });

    // Self-validate: parseFrontmatter roundtrip must preserve name.
    const fm = parseFrontmatter(md);
    if (fm.name !== frontmatter.name) {
      throw new Error(`name roundtrip mismatch for ${file}: expected "${frontmatter.name}" got "${fm.name}"`);
    }

    if (!dryRun) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, md);
    }
    log(`${dryRun ? "[dry-run] " : ""}wrote ${file}`);
    written.push({ file, frontmatter, md });
  }

  // Per-repo breakdown
  const byRepo = {};
  for (const w of written) {
    const r = w.frontmatter.source_repo;
    byRepo[r] = (byRepo[r] || 0) + 1;
  }
  log(`\n${dryRun ? "[dry-run] " : ""}more-skills-rules: ${written.length} stub(s) -> incoming/more-skills-rules/`);
  for (const [repo, count] of Object.entries(byRepo)) {
    log(`  ${repo}: ${count}`);
  }
  return written;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function arg(args, flag) {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1];
}

async function main(argv) {
  const args   = argv.slice(2);
  const dryRun = !args.includes("--apply");

  const cookbookDir = arg(args, "--cookbook");

  if (!cookbookDir) {
    console.error(
      "usage: crawl-more-skills.mjs --cookbook <dir> [--apply]\n" +
      "\n" +
      "  --cookbook  path to a local clone of anthropics/claude-cookbook\n" +
      "  --apply     write stubs (default: dry-run)\n" +
      "\n" +
      "Expected clones:\n" +
      "  git clone --depth 1 https://github.com/anthropics/claude-cookbook /tmp/eng-cb2\n" +
      "\n" +
      "Repos 404 at crawl time (skipped cleanly):\n" +
      "  travis-burmaster/claude-skills\n" +
      "  dwarvesf/prompt-log\n" +
      "  PatrickJS/awesome-claude-rules\n" +
      "\n" +
      "Repos cloned but no skill/rules content (skipped cleanly):\n" +
      "  sirmalloc/ccstatusline  (project-local dev guide only)"
    );
    process.exit(2);
  }

  if (!existsSync(cookbookDir)) {
    console.error(`cookbook dir not found: ${cookbookDir}`);
    process.exit(1);
  }

  const adapter = cookbookAdapter({ repoDir: cookbookDir });
  const results = await runMoreSkills(adapter, { dryRun });

  // Print sample slugs
  if (results.length > 0) {
    const sample = results.slice(0, 5).map((r) => r.frontmatter.name).join(", ");
    console.log(`\nSample slugs: ${sample}${results.length > 5 ? ", ..." : ""}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
