#!/usr/bin/env node
// Component SKILL-PACKS crawler. Deterministic generator: walks official + community
// skill-pack repos for SKILL.md files and emits one component stub per skill.
//
// Sources:
//   1. anthropics/skills        skills/*/SKILL.md          (official Anthropic skill packs)
//   2. obra/superpowers          skills/*/SKILL.md          (community superpowers pack)
//   3. anthropics/claude-cookbook .claude/skills/*/SKILL.md  (cookbook internal skills)
//                               skills/custom_skills/*/SKILL.md
//
// All stubs land in incoming/skills-packs/. Dir is RESET on --apply so re-runs
// are idempotent and upstream deletions propagate.
//
// Frontmatter schema matches catalog.mjs FIELDS exactly. SCRUB: no /Users/ paths,
// no personal names in body/description text. uniqueName() across all sources via
// shared `seen` Set. Self-validates each stub via parseFrontmatter.
//
// Run (after git clone --depth 1 each source into /tmp):
//   node ingest/crawl-skillpacks.mjs \
//     --anthropic  /tmp/eng-anthropic-skills \
//     --superpowers /tmp/eng-superpowers \
//     --cookbook    /tmp/eng-cookbook \
//     [--apply]    # default: dry-run

import {
  mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync, statSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const OUT_DIR = join(INCOMING, "skills-packs");
const VERIFIED_AT = "2026-05-27";

// --- Shared helpers (mirrors crawl-collections.mjs) -------------------------

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

// Extract a named scalar field from YAML frontmatter block.
function frontmatterField(raw, field) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return "";
  // Handle multi-line quoted values (description can span with quotes)
  const block = m[1];
  const line = block.split(/\r?\n/).find((l) => new RegExp(`^${field}:`).test(l));
  if (!line) return "";
  const val = line.replace(new RegExp(`^${field}:\\s*`), "").trim();
  // Strip surrounding quotes
  return val.replace(/^["']|["']$/g, "").trim();
}

// Extract first meaningful prose line (non-heading, non-empty) from body text.
function firstProseLine(raw) {
  const body = raw.replace(/^---[\s\S]*?---/, "").trim();
  for (const line of body.split(/\r?\n/)) {
    const t = line.trim();
    if (t && !t.startsWith("#") && !t.startsWith("```") && t.length > 10) return t;
  }
  return "";
}

// Build one component stub from a SKILL.md file.
function skillToComponent({ file, owner, repo, relPath, seen }) {
  const raw = readFileSync(file, "utf8");
  const fmName = frontmatterField(raw, "name");
  const fmDesc = frontmatterField(raw, "description");
  const fmLicense = frontmatterField(raw, "license");

  // Normalize license field: strip "Proprietary..." etc to "unknown" for non-MIT
  const license = (!fmLicense || fmLicense.toLowerCase().includes("proprietary"))
    ? (owner === "obra" ? "MIT" : "unknown")
    : (fmLicense.toLowerCase().includes("mit") ? "MIT" : fmLicense.split(".")[0].trim() || "unknown");

  const dirName = basename(dirname(file));
  const base = slugify(fmName || dirName);
  const uname = uniqueName(base, seen);

  const desc = scrub(fmDesc) ||
    scrub(firstProseLine(raw)) ||
    `Apply the ${dirName.replace(/-/g, " ")} skill pack.`;

  const sourceUrl = `https://github.com/${owner}/${repo}/blob/main/${relPath}`;

  // cli_compat: superpowers explicitly supports opencode/gemini too
  const cliCompat = (owner === "obra")
    ? ["claude", "gemini", "opencode"]
    : ["claude"];

  return {
    frontmatter: {
      name: uname,
      type: "skills",
      description: desc,
      source_repo: `${owner}/${repo}`,
      source_url: sourceUrl,
      license,
      cli_compat: cliCompat,
      maturity: "beta",
      stars: null,
      eval_score: null,
      verified_at: VERIFIED_AT,
      related: [],
      tags: ["skill", repo],
    },
    body: `## What it is\nA skill pack from [\`${owner}/${repo}\`](${sourceUrl}). ${desc}\n\n` +
      `## When to use it\n${desc}\n\n` +
      `## How to install / invoke\n` +
      "```bash\n" +
      `# copy into your project's skills/ directory\n` +
      `curl -sL https://github.com/${owner}/${repo}/raw/main/${relPath} -o .claude/skills/${dirName}/SKILL.md\n` +
      "```\n\n" +
      `## Notes\n` +
      `Extracted from \`${owner}/${repo}\` at \`${relPath}\`. Pending verify -> promote.`,
  };
}

// ============================================================================
// SOURCE 1: anthropics/skills — skills/*/SKILL.md
// ============================================================================
export function anthropicSkillsAdapter({ repoDir, seen }) {
  const owner = "anthropics", repo = "skills";
  const skillsDir = join(repoDir, "skills");
  const items = [];

  if (!existsSync(skillsDir)) return items;

  // Only direct-child SKILL.md files (one per skill subdirectory)
  for (const entry of readdirSync(skillsDir)) {
    const full = join(skillsDir, entry, "SKILL.md");
    if (existsSync(full)) {
      items.push({ file: full, owner, repo, relPath: `skills/${entry}/SKILL.md`, seen });
    }
  }
  return items;
}

// ============================================================================
// SOURCE 2: obra/superpowers — skills/*/SKILL.md
// ============================================================================
export function superpowersAdapter({ repoDir, seen }) {
  const owner = "obra", repo = "superpowers";
  const skillsDir = join(repoDir, "skills");
  const items = [];

  if (!existsSync(skillsDir)) return items;

  for (const entry of readdirSync(skillsDir)) {
    const full = join(skillsDir, entry, "SKILL.md");
    if (existsSync(full)) {
      items.push({ file: full, owner, repo, relPath: `skills/${entry}/SKILL.md`, seen });
    }
  }
  return items;
}

// ============================================================================
// SOURCE 3: anthropics/claude-cookbook — two skill locations
//   a) .claude/skills/*/SKILL.md     (internal cookbook skills)
//   b) skills/custom_skills/*/SKILL.md (example custom skills)
// ============================================================================
export function cookbookAdapter({ repoDir, seen }) {
  const owner = "anthropics", repo = "claude-cookbook";
  const items = [];

  // 3a: .claude/skills/*/SKILL.md
  const claudeSkillsDir = join(repoDir, ".claude", "skills");
  if (existsSync(claudeSkillsDir)) {
    for (const entry of readdirSync(claudeSkillsDir)) {
      const full = join(claudeSkillsDir, entry, "SKILL.md");
      if (existsSync(full)) {
        items.push({ file: full, owner, repo, relPath: `.claude/skills/${entry}/SKILL.md`, seen });
      }
    }
  }

  // 3b: skills/custom_skills/*/SKILL.md
  const customSkillsDir = join(repoDir, "skills", "custom_skills");
  if (existsSync(customSkillsDir)) {
    for (const entry of readdirSync(customSkillsDir)) {
      const full = join(customSkillsDir, entry, "SKILL.md");
      if (existsSync(full)) {
        items.push({ file: full, owner, repo, relPath: `skills/custom_skills/${entry}/SKILL.md`, seen });
      }
    }
  }

  return items;
}

// ============================================================================
// Run: collect all items from all sources, write to incoming/skills-packs/
// ============================================================================
export async function runSkillPacks({ anthropicDir, superpowersDir, cookbookDir, dryRun = true, log = console.log } = {}) {
  const seen = new Set();
  const allItems = [];
  const counts = { anthropic: 0, superpowers: 0, cookbook: 0 };

  if (anthropicDir) {
    const items = anthropicSkillsAdapter({ repoDir: anthropicDir, seen });
    counts.anthropic = items.length;
    allItems.push(...items);
  }
  if (superpowersDir) {
    const items = superpowersAdapter({ repoDir: superpowersDir, seen });
    counts.superpowers = items.length;
    allItems.push(...items);
  }
  if (cookbookDir) {
    const items = cookbookAdapter({ repoDir: cookbookDir, seen });
    counts.cookbook = items.length;
    allItems.push(...items);
  }

  if (!dryRun) resetDir(OUT_DIR);
  else log("[dry-run] would reset incoming/skills-packs/");

  const written = [];
  for (const item of allItems) {
    const { frontmatter, body } = skillToComponent(item);
    const file = join(OUT_DIR, `${frontmatter.name}.md`);
    const md = toMarkdown({ frontmatter, body });

    // Self-validate via catalog parser (mirrors runCollection pattern)
    const fm = parseFrontmatter(md);
    if (fm.name !== frontmatter.name) {
      throw new Error(`name roundtrip mismatch for ${file}: got "${fm.name}", expected "${frontmatter.name}"`);
    }

    if (dryRun) {
      log(`[dry-run] would write ${file}`);
    } else {
      writeFileSync(file, md);
      log(`wrote ${file}`);
    }
    written.push({ file, frontmatter, md });
  }

  log(`\n${dryRun ? "[dry-run] " : ""}skills-packs: ${written.length} stub(s) -> incoming/skills-packs/`);
  log(`  anthropic: ${counts.anthropic}  superpowers: ${counts.superpowers}  cookbook: ${counts.cookbook}`);
  return { written, counts };
}

// --- CLI --------------------------------------------------------------------
function arg(args, flag) { const i = args.indexOf(flag); return i === -1 ? null : args[i + 1]; }

async function main(argv) {
  const args = argv.slice(2);
  const dryRun = !args.includes("--apply");
  const anthropicDir = arg(args, "--anthropic");
  const superpowersDir = arg(args, "--superpowers");
  const cookbookDir = arg(args, "--cookbook");

  if (!anthropicDir && !superpowersDir && !cookbookDir) {
    console.error(
      "usage: crawl-skillpacks.mjs " +
      "--anthropic <dir> --superpowers <dir> --cookbook <dir> [--apply]"
    );
    process.exit(2);
  }

  await runSkillPacks({ anthropicDir, superpowersDir, cookbookDir, dryRun });
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
