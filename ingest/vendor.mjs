#!/usr/bin/env node
// Armory vendor.mjs — copies ACTUAL component files from upstream repos into
// gear/<type>/ and harness-native dot-folders.
//
// Owned surfaces (touched, reset on --apply):
//   gear/{skills,agents,commands,hooks,rules}/
//   .claude/{skills,agents,commands,hooks}/
//   .cursor/rules/
//   .claude/rules/           (mirror of cursor rules)
//   .codex/README.md  .opencode/README.md  .gemini/README.md
//   gear/README.md
//
// NEVER touched: brain/, catalog.json, armory-mcp/, cli/, armory-skill/,
//                armory-plugin/, README.md, package.json, ingest/* (other files)
//
// Usage:
//   node ingest/vendor.mjs           # dry-run: prints counts per type
//   node ingest/vendor.mjs --apply   # reset + copy everything

import {
  existsSync, mkdirSync, rmSync, readdirSync, statSync,
  writeFileSync, readFileSync, copyFileSync,
} from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const DRY_RUN = !process.argv.includes("--apply");
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COMP = join(ROOT, "gear");
const TMP = "/tmp/armory-vendor";

// ─── helpers ────────────────────────────────────────────────────────────────

function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}

function uniqueSlug(base, seen) {
  let name = base;
  if (!seen.has(name)) { seen.add(name); return name; }
  for (let n = 2; ; n++) {
    const cand = `${name}-${n}`;
    if (!seen.has(cand)) { seen.add(cand); return cand; }
  }
}

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function resetDir(p) {
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
  mkdirSync(p, { recursive: true });
}

function walkFiles(dir, pred, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walkFiles(full, pred, acc);
    else if (pred(e.name, full)) acc.push(full);
  }
  return acc;
}

// Shallow clone —depth 1 into a named subdir of TMP. Returns destDir or null on failure.
function clone(repo, name) {
  const dest = join(TMP, name);
  if (existsSync(dest)) return dest; // already present
  try {
    console.log(`  cloning ${repo} → ${dest} ...`);
    execSync(
      `git clone --depth 1 --quiet https://github.com/${repo}.git "${dest}"`,
      { stdio: ["ignore", "ignore", "pipe"], timeout: 90_000 },
    );
    return dest;
  } catch (e) {
    const msg = e.stderr ? e.stderr.toString().trim() : String(e);
    console.warn(`  ⚠  SKIP ${repo}: ${msg.slice(0, 120)}`);
    return null;
  }
}

// Scrub /Users/... and /home/... paths + any literal "Naman" (case-insensitive) from a header.
function scrubHeader(s) {
  return s
    .replace(/\/Users\/[^\s,)>]+/g, "<path>")
    .replace(/\/home\/[^\s,)>]+/g, "<path>")
    .replace(/\bnaman\b/gi, "<author>");
}

// Prepend a provenance comment to the top of content, format-aware.
// Returns the new content string.
function withProvenance(content, owner, repo, license, ext) {
  const safeComment = scrubHeader(`source: ${owner}/${repo} · ${license} · vendored by Armory`);
  if (ext === ".py" || ext === ".sh") {
    // Only prepend if not already provenance-stamped
    if (content.includes("vendored by Armory")) return content;
    return `# ${safeComment}\n${content}`;
  }
  if (ext === ".json") return content; // don't break JSON
  // .md and everything else → HTML comment
  if (content.includes("vendored by Armory")) return content;
  return `<!-- ${safeComment} -->\n${content}`;
}

// ─── copy helpers ────────────────────────────────────────────────────────────

// Copy a single source file to destDir/<slug>.<ext> with provenance header.
// Returns the slug used.
function vendorFile(srcPath, destDir, slug, ext, owner, repo, license, seen) {
  const finalSlug = uniqueSlug(slug, seen);
  const destName = `${finalSlug}${ext}`;
  const destPath = join(destDir, destName);
  if (!DRY_RUN) {
    let content = readFileSync(srcPath, "utf8");
    content = withProvenance(content, owner, repo, license, ext);
    writeFileSync(destPath, content, "utf8");
  }
  return finalSlug;
}

// Copy a skill directory (slug/SKILL.md + any siblings) into destDir/<slug>/.
// Returns slug.
function vendorSkillDir(skillDir, destDir, slug, owner, repo, license, seen) {
  const finalSlug = uniqueSlug(slug, seen);
  const destSkillDir = join(destDir, finalSlug);
  if (!DRY_RUN) {
    ensureDir(destSkillDir);
    const files = readdirSync(skillDir, { withFileTypes: true });
    for (const f of files) {
      if (!f.isFile()) continue;
      const srcFile = join(skillDir, f.name);
      let content = readFileSync(srcFile, "utf8");
      const ext = extname(f.name);
      content = withProvenance(content, owner, repo, license, ext);
      writeFileSync(join(destSkillDir, f.name), content, "utf8");
    }
  }
  return finalSlug;
}

// ─── results tracker ─────────────────────────────────────────────────────────

const counts = { skills: 0, agents: 0, commands: 0, hooks: 0, rules: 0 };
const cloneResults = {}; // repo → "ok" | "skip"

// ─── SOURCE PROCESSORS ───────────────────────────────────────────────────────

// 1. anthropics/skills  (obra/superpowers reuses same shape: skills/<name>/SKILL.md)
function processSkillsRepo(cloneDir, owner, repo, license, destDir, seen) {
  const skillsDir = join(cloneDir, "skills");
  if (!existsSync(skillsDir)) return;
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillDir = join(skillsDir, entry.name);
    const skillFile = join(skillDir, "SKILL.md");
    if (!existsSync(skillFile)) continue;
    const slug = slugify(entry.name);
    vendorSkillDir(skillDir, destDir, slug, owner, repo, license, seen);
    counts.skills++;
  }
}

// 2. wshobson/agents: plugins/*/agents/*.md → agents
//    wshobson/agents: plugins/*/commands/*.md → commands
function processWshobsonAgents(cloneDir, destAgents, destCommands, seenA, seenC) {
  const pluginsDir = join(cloneDir, "plugins");
  if (!existsSync(pluginsDir)) return;
  for (const plugin of readdirSync(pluginsDir, { withFileTypes: true })) {
    if (!plugin.isDirectory()) continue;
    const pluginPath = join(pluginsDir, plugin.name);
    const agentFiles = walkFiles(join(pluginPath, "agents"), (n) => n.endsWith(".md"));
    for (const f of agentFiles) {
      const slug = slugify(basename(f, ".md"));
      vendorFile(f, destAgents, slug, ".md", "wshobson", "agents", "MIT", seenA);
      counts.agents++;
    }
    const commandFiles = walkFiles(join(pluginPath, "commands"), (n) => n.endsWith(".md"));
    for (const f of commandFiles) {
      const slug = slugify(basename(f, ".md"));
      vendorFile(f, destCommands, slug, ".md", "wshobson", "agents", "MIT", seenC);
      counts.commands++;
    }
  }
}

// 3. wshobson/commands: tools/*.md + workflows/*.md → commands
function processWshobsonCommands(cloneDir, destCommands, seen) {
  for (const sub of ["tools", "workflows"]) {
    const files = walkFiles(join(cloneDir, sub), (n) => n.endsWith(".md") && n !== "README.md");
    for (const f of files) {
      const slug = slugify(basename(f, ".md"));
      vendorFile(f, destCommands, slug, ".md", "wshobson", "commands", "MIT", seen);
      counts.commands++;
    }
  }
}

// 4. VoltAgent/awesome-claude-code-subagents: categories/**/*.md → agents
function processVoltAgent(cloneDir, destAgents, seen) {
  const catDir = join(cloneDir, "categories");
  const files = walkFiles(catDir,
    (n) => n.endsWith(".md") && n !== "README.md",
  );
  for (const f of files) {
    const slug = slugify(basename(f, ".md"));
    vendorFile(f, destAgents, slug, ".md", "VoltAgent", "awesome-claude-code-subagents", "MIT", seen);
    counts.agents++;
  }
}

// 5. dl-ezo/claude-code-sub-agents: *.md at root → agents
function processDlEzo(cloneDir, destAgents, seen) {
  for (const entry of readdirSync(cloneDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".md") || entry.name === "README.md" || entry.name === "CONTRIBUTING.md") continue;
    const f = join(cloneDir, entry.name);
    const slug = slugify(basename(f, ".md"));
    vendorFile(f, destAgents, slug, ".md", "dl-ezo", "claude-code-sub-agents", "MIT", seen);
    counts.agents++;
  }
}

// 6. davila7/claude-code-templates:
//    cli-tool/components/skills/**/<slug>/SKILL.md → skills
//    cli-tool/components/agents/**/*.md            → agents
//    cli-tool/components/commands/**/*.md           → commands
//    cli-tool/components/hooks/**/*.{json,py,sh}   → hooks (but these are JSON hooks, skip if not real code)
function processDavila7(cloneDir, destSkills, destAgents, destCommands, destHooks, seenS, seenA, seenC, seenH) {
  const base = join(cloneDir, "cli-tool", "components");

  // skills
  const skillsBase = join(base, "skills");
  if (existsSync(skillsBase)) {
    const allSkillFiles = walkFiles(skillsBase, (n) => n === "SKILL.md");
    for (const f of allSkillFiles) {
      const skillDir = dirname(f);
      const slug = slugify(basename(skillDir));
      vendorSkillDir(skillDir, destSkills, slug, "davila7", "claude-code-templates", "MIT", seenS);
      counts.skills++;
    }
  }

  // agents
  const agentsBase = join(base, "agents");
  if (existsSync(agentsBase)) {
    const agentFiles = walkFiles(agentsBase,
      (n) => n.endsWith(".md") && n !== "README.md",
    );
    for (const f of agentFiles) {
      const slug = slugify(basename(f, ".md"));
      vendorFile(f, destAgents, slug, ".md", "davila7", "claude-code-templates", "MIT", seenA);
      counts.agents++;
    }
  }

  // commands
  const commandsBase = join(base, "commands");
  if (existsSync(commandsBase)) {
    const commandFiles = walkFiles(commandsBase,
      (n) => n.endsWith(".md") && n !== "README.md",
    );
    for (const f of commandFiles) {
      const slug = slugify(basename(f, ".md"));
      vendorFile(f, destCommands, slug, ".md", "davila7", "claude-code-templates", "MIT", seenC);
      counts.commands++;
    }
  }

  // hooks — davila7 uses JSON wrapper hooks; vendor the .json files
  const hooksBase = join(base, "hooks");
  if (existsSync(hooksBase)) {
    const hookFiles = walkFiles(hooksBase,
      (n, p) => (n.endsWith(".json") || n.endsWith(".py") || n.endsWith(".sh")) && n !== "README.md",
    );
    for (const f of hookFiles) {
      const ext = extname(f);
      const slug = slugify(basename(f, ext));
      vendorFile(f, destHooks, slug, ext, "davila7", "claude-code-templates", "MIT", seenH);
      counts.hooks++;
    }
  }
}

// 7. PatrickJS/awesome-cursorrules: rules/*.mdc → rules (as .md)
function processPatrickJS(cloneDir, destRules, seenR) {
  const rulesDir = join(cloneDir, "rules");
  if (!existsSync(rulesDir)) return;
  for (const entry of readdirSync(rulesDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith(".mdc") && !entry.name.endsWith(".md")) continue;
    const f = join(rulesDir, entry.name);
    const slug = slugify(basename(entry.name, extname(entry.name)));
    vendorFile(f, destRules, slug, ".md", "PatrickJS", "awesome-cursorrules", "MIT", seenR);
    counts.rules++;
  }
}

// 8. disler/claude-code-hooks-mastery: .claude/hooks/*.py → hooks
function processDisler(cloneDir, destHooks, seenH) {
  const hooksDir = join(cloneDir, ".claude", "hooks");
  if (!existsSync(hooksDir)) return;
  for (const entry of readdirSync(hooksDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const ext = extname(entry.name);
    if (ext !== ".py" && ext !== ".sh") continue;
    const slug = slugify(basename(entry.name, ext));
    vendorFile(join(hooksDir, entry.name), destHooks, slug, ext, "disler", "claude-code-hooks-mastery", "MIT", seenH);
    counts.hooks++;
  }
}

// ─── HARNESS FOLDER WRITER ───────────────────────────────────────────────────

const HARNESS_POINTER_MSG = (harness) =>
  `# Armory components for ${harness}\n\nSee \`../gear/\` for actual vendored files.\nInstall a component: \`armory install <name> --cli ${harness}\`\n`;

function buildHarnessFolders(destSkills, destAgents, destCommands, destHooks, destRules) {
  // .claude/ harness
  const clauDir = join(ROOT, ".claude");
  const clauSkills   = join(clauDir, "skills");
  const clauAgents   = join(clauDir, "agents");
  const clauCommands = join(clauDir, "commands");
  const clauHooks    = join(clauDir, "hooks");
  const clauRules    = join(clauDir, "rules");

  if (!DRY_RUN) {
    for (const d of [clauSkills, clauAgents, clauCommands, clauHooks, clauRules]) resetDir(d);
  }
  let copied = 0;

  // skills: copy each <slug>/ dir
  for (const entry of readdirSync(destSkills, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const src = join(destSkills, entry.name);
      const dst = join(clauSkills, entry.name);
      if (!DRY_RUN) {
        ensureDir(dst);
        for (const f of readdirSync(src, { withFileTypes: true })) {
          if (f.isFile()) copyFileSync(join(src, f.name), join(dst, f.name));
        }
      }
      copied++;
    }
  }

  // agents/commands/hooks/rules: flat .md / .py files
  function mirrorFlat(srcDir, dstDir, ext) {
    for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (ext && !entry.name.endsWith(ext)) continue;
      if (!DRY_RUN) copyFileSync(join(srcDir, entry.name), join(dstDir, entry.name));
      copied++;
    }
  }
  mirrorFlat(destAgents,   clauAgents,   ".md");
  mirrorFlat(destCommands, clauCommands, ".md");
  // hooks: all files
  for (const entry of readdirSync(destHooks, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!DRY_RUN) copyFileSync(join(destHooks, entry.name), join(clauHooks, entry.name));
    copied++;
  }
  // rules: all .md
  mirrorFlat(destRules, clauRules, ".md");

  // .cursor/rules/ (Cursor-native)
  const cursorRules = join(ROOT, ".cursor", "rules");
  if (!DRY_RUN) resetDir(cursorRules);
  for (const entry of readdirSync(destRules, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    if (!DRY_RUN) copyFileSync(join(destRules, entry.name), join(cursorRules, entry.name));
    copied++;
  }

  // pointer READMEs for other harnesses
  if (!DRY_RUN) {
    for (const [dir, harness] of [
      [join(ROOT, ".codex"),    "codex"],
      [join(ROOT, ".opencode"), "opencode"],
      [join(ROOT, ".gemini"),   "gemini"],
    ]) {
      ensureDir(dir);
      writeFileSync(join(dir, "README.md"), HARNESS_POINTER_MSG(harness), "utf8");
    }
  }

  return copied;
}

// ─── COMPONENTS README ───────────────────────────────────────────────────────

const COMP_README = `# Armory — Vendored Gear

This directory contains the **actual component files** vendored from upstream repos.

\`brain/\` holds metadata graph stubs (one per component, YAML frontmatter + description).
\`gear/\` holds the **real pieces** — copy them straight into your project or run
\`armory install <slug>\` to let the CLI wire them for you.

## Layout

\`\`\`
gear/
  skills/      <slug>/SKILL.md (+ optional supporting files)
  agents/      <slug>.md       (Claude sub-agent definitions)
  commands/    <slug>.md       (slash-command definitions)
  hooks/       <slug>.py|json  (lifecycle hook scripts)
  rules/       <slug>.md       (coding rules for Cursor / Claude)
\`\`\`

## Harness-native mirrors

| Harness        | Location         | Notes                              |
|----------------|------------------|------------------------------------|
| Claude Code    | \`.claude/\`      | skills/ agents/ commands/ hooks/ rules/ |
| Cursor         | \`.cursor/rules/\`| rules only                         |
| Codex          | \`.codex/\`       | pointer README → ../gear/          |
| OpenCode       | \`.opencode/\`    | pointer README → ../gear/          |
| Gemini         | \`.gemini/\`      | pointer README → ../gear/          |

Sources are vendored verbatim (license-compliant). Each file has a 1-line provenance header.
`;

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  if (DRY_RUN) {
    console.log("DRY RUN — pass --apply to write files\n");
  } else {
    console.log("APPLY mode — resetting and copying files\n");
    ensureDir(TMP);
  }

  // Destination dirs inside gear/
  const destSkills   = join(COMP, "skills");
  const destAgents   = join(COMP, "agents");
  const destCommands = join(COMP, "commands");
  const destHooks    = join(COMP, "hooks");
  const destRules    = join(COMP, "rules");

  if (!DRY_RUN) {
    for (const d of [destSkills, destAgents, destCommands, destHooks, destRules]) resetDir(d);
  } else {
    // Dry-run: just ensure the dirs exist for counting
    for (const d of [destSkills, destAgents, destCommands, destHooks, destRules]) ensureDir(d);
  }

  // Per-type seen sets for dedup
  const seenS = new Set(), seenA = new Set(), seenC = new Set(), seenH = new Set(), seenR = new Set();

  // ── clone / locate sources ──────────────────────────────────────────────────

  const sources = {
    anthropicSkills:   { repo: "anthropics/skills",                           tmp: "armory-anthropic-skills" },
    obraSuperpowers:   { repo: "obra/superpowers",                            tmp: "armory-obra-superpowers" },
    wshobsonAgents:    { repo: "wshobson/agents",                             tmp: "armory-wshobson-agents" },
    wshobsonCommands:  { repo: "wshobson/commands",                           tmp: "armory-wshobson-commands" },
    voltAgent:         { repo: "VoltAgent/awesome-claude-code-subagents",     tmp: "armory-voltagent" },
    dlEzo:             { repo: "dl-ezo/claude-code-sub-agents",               tmp: "armory-dl-ezo" },
    davila7:           { repo: "davila7/claude-code-templates",               tmp: "armory-davila7" },
    patrickJS:         { repo: "PatrickJS/awesome-cursorrules",               tmp: "armory-patrickjs" },
    disler:            { repo: "disler/claude-code-hooks-mastery",            tmp: "armory-disler" },
  };

  // Prefer existing known-good clones in /tmp before re-cloning
  const EXISTING = {
    "armory-anthropic-skills":  "/tmp/cp106-anthropic-skills",
    "armory-obra-superpowers":  "/tmp/eng-superpowers",
    "armory-wshobson-agents":   "/tmp/cp106-wshobson-v2",
    "armory-voltagent":         "/tmp/eng-voltagent",
    "armory-patrickjs":         "/tmp/eng-cursorrules",
    "armory-disler":            "/tmp/eng-disler",
  };

  const cloneDirs = {};
  for (const [key, { repo, tmp }] of Object.entries(sources)) {
    const dest = join(TMP, tmp);
    // If a prior session left a usable clone, use it
    const fallback = EXISTING[tmp];
    if (fallback && existsSync(fallback)) {
      cloneDirs[key] = fallback;
      cloneResults[repo] = "ok (reused existing clone)";
      console.log(`  reusing ${fallback} for ${repo}`);
    } else if (existsSync(dest)) {
      cloneDirs[key] = dest;
      cloneResults[repo] = "ok (cached)";
    } else if (DRY_RUN) {
      // dry-run: try to reuse existing known dirs for counting
      cloneDirs[key] = fallback && existsSync(fallback) ? fallback : null;
      cloneResults[repo] = cloneDirs[key] ? "ok (dry-run reuse)" : "dry-run (no local copy)";
    } else {
      ensureDir(TMP);
      const result = clone(repo, tmp);
      cloneDirs[key] = result;
      cloneResults[repo] = result ? "ok" : "SKIP (clone failed)";
    }
  }

  console.log("\n── Processing sources ──\n");

  // anthropics/skills → skills
  if (cloneDirs.anthropicSkills) {
    console.log("anthropics/skills …");
    processSkillsRepo(cloneDirs.anthropicSkills, "anthropics", "skills", "MIT", destSkills, seenS);
  }

  // obra/superpowers → skills
  if (cloneDirs.obraSuperpowers) {
    console.log("obra/superpowers …");
    processSkillsRepo(cloneDirs.obraSuperpowers, "obra", "superpowers", "MIT", destSkills, seenS);
  }

  // wshobson/agents → agents + commands
  if (cloneDirs.wshobsonAgents) {
    console.log("wshobson/agents …");
    processWshobsonAgents(cloneDirs.wshobsonAgents, destAgents, destCommands, seenA, seenC);
  }

  // wshobson/commands → commands
  if (cloneDirs.wshobsonCommands) {
    console.log("wshobson/commands …");
    processWshobsonCommands(cloneDirs.wshobsonCommands, destCommands, seenC);
  }

  // VoltAgent → agents
  if (cloneDirs.voltAgent) {
    console.log("VoltAgent/awesome-claude-code-subagents …");
    processVoltAgent(cloneDirs.voltAgent, destAgents, seenA);
  }

  // dl-ezo → agents
  if (cloneDirs.dlEzo) {
    console.log("dl-ezo/claude-code-sub-agents …");
    processDlEzo(cloneDirs.dlEzo, destAgents, seenA);
  }

  // davila7 → skills + agents + commands + hooks
  if (cloneDirs.davila7) {
    console.log("davila7/claude-code-templates …");
    processDavila7(cloneDirs.davila7, destSkills, destAgents, destCommands, destHooks, seenS, seenA, seenC, seenH);
  }

  // PatrickJS → rules
  if (cloneDirs.patrickJS) {
    console.log("PatrickJS/awesome-cursorrules …");
    processPatrickJS(cloneDirs.patrickJS, destRules, seenR);
  }

  // disler → hooks
  if (cloneDirs.disler) {
    console.log("disler/claude-code-hooks-mastery …");
    processDisler(cloneDirs.disler, destHooks, seenH);
  }

  // ── harness folders ──────────────────────────────────────────────────────────
  console.log("\n── Building harness-native folders ──\n");
  const mirroredFiles = buildHarnessFolders(destSkills, destAgents, destCommands, destHooks, destRules);

  // ── components README ────────────────────────────────────────────────────────
  if (!DRY_RUN) {
    writeFileSync(join(COMP, "README.md"), COMP_README, "utf8");
  }

  // ── report ───────────────────────────────────────────────────────────────────
  const total = counts.skills + counts.agents + counts.commands + counts.hooks + counts.rules;
  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  Armory vendor.mjs — ${DRY_RUN ? "DRY RUN" : "APPLIED"}`);
  console.log("═══════════════════════════════════════════════════");
  console.log(`  skills:   ${counts.skills}`);
  console.log(`  agents:   ${counts.agents}`);
  console.log(`  commands: ${counts.commands}`);
  console.log(`  hooks:    ${counts.hooks}`);
  console.log(`  rules:    ${counts.rules}`);
  console.log(`  ─────────────────────────`);
  console.log(`  TOTAL:    ${total}`);
  if (!DRY_RUN) console.log(`  harness mirror files: ${mirroredFiles}`);
  console.log("\n  Clone status:");
  for (const [repo, status] of Object.entries(cloneResults)) {
    console.log(`    ${status.startsWith("ok") ? "✓" : "✗"} ${repo}: ${status}`);
  }
  console.log("═══════════════════════════════════════════════════\n");

  if (DRY_RUN) {
    console.log("Run with --apply to write all files.\n");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
