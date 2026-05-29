#!/usr/bin/env node
// Component MASS migrator. Deterministic generator (parse list -> emit one component
// stub per entry; NEVER hand-authoring) for the two canonical "awesome"
// navigation directories. Zero npm deps. Reuses crawl.mjs's `toMarkdown` +
// `slugify` serializer and validates against catalog.mjs's `parseFrontmatter`.
//
// Sources (clone --depth 1 into /tmp first):
//   1. awesome-mcp-servers  (punkpeye)     -> incoming/awesome-mcp-servers/
//   2. awesome-claude-code  (hesreallyhim) -> incoming/awesome-claude-code-full/<type>/
//
// Idempotent: re-running RESETS each owned dir then re-emits, so stubs overwrite
// cleanly and deletions in the upstream list propagate. Does NOT promote.
//
// Run: node ingest/migrate-awesome.mjs --amcp /tmp/cp106-amcp --acc /tmp/cp106-acc-full
import {
  mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, readdirSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { toMarkdown, slugify } from "./crawl.mjs";
import { parseFrontmatter } from "./catalog.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INCOMING = join(ROOT, "incoming");
const VERIFIED_AT = "2026-05-26";

// Legend emojis used as inline badges in awesome-mcp-servers (language / scope /
// OS / official). Stripped before extracting the human description. Source: the
// README "## Legend" block. Kept as a set of codepoints + variation selectors.
const BADGE_EMOJIS = [
  "🎖️", "🐍", "📇", "🏎️", "🦀", "#️⃣", "☕", "🌊", "💎",
  "☁️", "🏠", "📟", "🍎", "🪟", "🐧",
];

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

// owner/repo if the URL is a GitHub repo link, else "".
function ghRepo(url) {
  const m = String(url).match(/github\.com\/([^/#?]+)\/([^/#?]+)/i);
  if (!m) return "";
  return `${m[1]}/${m[2].replace(/\.git$/, "")}`;
}

// Wipe a directory's *.md (and nested type dirs') so re-runs are clean.
function resetDir(dir) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

// Collapse whitespace; trim a trailing period-free single sentence for the
// folded description. Falls back to a synthesized WHEN-to-use line.
function descOrSynth(raw, name, kind) {
  const text = String(raw || "").replace(/\s+/g, " ").trim();
  if (text) return text;
  return `Reach for ${name} when you need the ${kind} it provides.`;
}

// =====================================================================
// SOURCE 1: awesome-mcp-servers (markdown bullet list under ### headings)
// =====================================================================

// Strip glama/shields-style image-link badges: [![alt](img)](href)
function stripShields(s) {
  return s.replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, " ");
}

// Strip leading legend emojis + separators to isolate the description.
function stripBadges(s) {
  let t = s;
  // remove any standalone shield images first
  t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  // repeatedly peel a leading badge emoji (with optional following space)
  let changed = true;
  while (changed) {
    changed = false;
    t = t.replace(/^\s+/, "");
    for (const e of BADGE_EMOJIS) {
      if (t.startsWith(e)) { t = t.slice(e.length); changed = true; }
    }
  }
  // peel a leading separator dash / en-dash / em-dash / colon
  t = t.replace(/^\s*[-–—:]\s*/, "");
  return t.trim();
}

// Extract the human category name from a "### emoji <a name=..></a>Name" heading.
function headingToCategory(headingText) {
  let n = headingText.replace(/<a\s+name="[^"]*">\s*<\/a>/gi, "");
  n = n.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️‍#️⃣]/gu, "");
  return n.replace(/\s+/g, " ").trim();
}

// Turn a category name into kebab tags.
function categoryTags(category) {
  const tag = slugify(category);
  return tag ? ["mcp", tag] : ["mcp"];
}

// Parse the README into raw server items. Scoped to "## Server Implementations"
// .. "## Tips and Tricks" (covers Server Implementations + Frameworks). Only
// top-level bullets directly under a ### category heading are entries.
export function parseAmcpReadme(markdown) {
  const lines = markdown.split(/\r?\n/);
  const idxOf = (re) => lines.findIndex((l) => re.test(l));
  const start = idxOf(/^##\s+Server Implementations/);
  const end = idxOf(/^##\s+Tips and Tricks/);
  const lo = start === -1 ? 0 : start;
  const hi = end === -1 ? lines.length : end;

  const items = [];
  let category = null;
  // Top-level bullet (no leading indent) with a [text](url) link.
  const bulletRe = /^[-*]\s+\[([^\]]+)\]\(([^)]+)\)(.*)$/;
  const headingRe = /^#{2,3}\s+(.*)$/;
  for (let i = lo; i < hi; i++) {
    const line = lines[i];
    const h = line.match(headingRe);
    if (h) { category = headingToCategory(h[1]) || category; continue; }
    const b = line.match(bulletRe);
    if (!b || !category) continue;
    const title = b[1].trim();
    const url = b[2].trim();
    let rest = stripBadges(stripShields(b[3]));
    items.push({ title, url, description: rest, category });
  }
  return items;
}

// Build component stubs for awesome-mcp-servers. Slug from the link text (often
// "owner/name"); we slugify the whole thing so it stays unique-ish, then dedupe.
export function buildAmcpStubs(items) {
  const seen = new Set();
  const stubs = [];
  for (const it of items) {
    const base = slugify(it.title);
    const name = uniqueName(base, seen);
    const repo = ghRepo(it.url);
    const description = descOrSynth(it.description, it.title, "MCP server");
    const tags = categoryTags(it.category);
    const frontmatter = {
      name, type: "mcps", description,
      source_repo: repo, source_url: it.url, license: "unknown",
      // mcps run across the major CLIs per the contract example.
      cli_compat: ["claude", "codex", "cursor", "gemini", "opencode"],
      maturity: "beta", verified_at: VERIFIED_AT, related: [], tags,
    };
    const body = `## What it is\n${description}\n\n` +
      `## When to use it\nWhen an agent needs the "${it.category}" capability this MCP server exposes.\n\n` +
      `## Source\nMigrated from the awesome-mcp-servers navigation directory (category: ${it.category}). ` +
      `See ${it.url}. Pending verify -> promote.`;
    stubs.push({ frontmatter, body });
  }
  return stubs;
}

// =====================================================================
// SOURCE 2: awesome-claude-code (THE_RESOURCES_TABLE.csv)
// =====================================================================

// Minimal RFC-4180-ish CSV parser: handles quoted fields, embedded commas,
// embedded newlines, and "" escaped quotes. Returns array of row-arrays.
export function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Category -> component type, per the migration contract. Categories not in the map
// (e.g. "Official Documentation") are skipped — they aren't component types.
const ACC_CATEGORY_TO_TYPE = {
  "Slash-Commands": "workflows",
  "Workflows & Knowledge Guides": "workflows",
  "Output Styles": "workflows",
  "Hooks": "hooks",
  "CLAUDE.md Files": "claudemd-rules",
  "Tooling": "clis-tools",
  "Alternative Clients": "clis-tools",
  "Agent Skills": "skills",
  "Status Lines": "observability",
};

// Strip inline markdown links from a CSV description blurb: [text](url) -> text.
function unlinkMd(s) {
  return String(s).replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
}

// Map a license blurb to an SPDX-ish id; "unknown" when not specified.
function normLicense(raw) {
  const l = String(raw || "").trim();
  if (!l || /no license|not specified|unknown/i.test(l)) return "unknown";
  return l;
}

// Parse the CSV into typed ACC items (active rows w/ a mapped category only).
export function parseAccCsv(csvText) {
  const rows = parseCsv(csvText);
  if (!rows.length) return [];
  const header = rows[0];
  const col = (n) => header.indexOf(n);
  const ci = {
    name: col("Display Name"), category: col("Category"),
    primary: col("Primary Link"), secondary: col("Secondary Link"),
    repo: col("Author Link"), active: col("Active"),
    license: col("License"), description: col("Description"),
    removed: col("Removed From Origin"),
  };
  const items = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row.length) continue;
    const active = (row[ci.active] || "").toUpperCase();
    if (active !== "TRUE") continue;                 // only ACTIVE entries
    const removed = (row[ci.removed] || "").toUpperCase();
    if (removed === "TRUE") continue;                 // skip removed-from-origin
    const category = (row[ci.category] || "").trim();
    const type = ACC_CATEGORY_TO_TYPE[category];
    if (!type) continue;                              // skip unmapped categories
    const url = (row[ci.primary] || row[ci.secondary] || "").trim();
    if (!url) continue;
    items.push({
      title: (row[ci.name] || "").trim(),
      url,
      description: unlinkMd(row[ci.description] || ""),
      license: normLicense(row[ci.license]),
      category, type,
    });
  }
  return items;
}

// Build component stubs for awesome-claude-code, grouped by type dir. `related`
// stays [] (synapses filled at verify time). Slug from the display name.
export function buildAccStubs(items) {
  const seenByType = {};                              // unique within each type dir
  const stubs = [];
  for (const it of items) {
    const seen = (seenByType[it.type] ||= new Set());
    const name = uniqueName(slugify(it.title), seen);
    const repo = ghRepo(it.url);
    const description = descOrSynth(it.description, it.title, it.category.toLowerCase());
    const frontmatter = {
      name, type: it.type, description,
      source_repo: repo, source_url: it.url, license: it.license,
      cli_compat: ["claude"],                         // ACC entries are Claude Code-native
      maturity: "beta", verified_at: VERIFIED_AT, related: [],
      tags: ["claude-code", slugify(it.category)],
    };
    const body = `## What it is\n${description}\n\n` +
      `## When to use it\nWhen working in Claude Code and you need the "${it.category}" resource this provides.\n\n` +
      `## Source\nMigrated from the awesome-claude-code resources table (category: ${it.category}). ` +
      `See ${it.url}. Pending verify -> promote.`;
    stubs.push({ type: it.type, frontmatter, body });
  }
  return stubs;
}

// --- Writers ---------------------------------------------------------------

function writeStub(dir, frontmatter, body) {
  const file = join(dir, `${frontmatter.name}.md`);
  writeFileSync(file, toMarkdown({ frontmatter, body }));
  return file;
}

function writeReadme(dir, title, sourceUrl, count, extra = "") {
  const md = `# ${title}\n\n` +
    `Auto-generated component stubs, migrated **${VERIFIED_AT}** by ` +
    `\`ingest/migrate-awesome.mjs\`.\n\n` +
    `- **Source:** ${sourceUrl}\n` +
    `- **Stubs:** ${count}\n` +
    `- **Status:** \`maturity: beta\`, **pending verify -> promote**. ` +
    `These are navigation-directory stubs; none are promoted to ` +
    `\`brain/components/\` until each \`source_url\` is checked live and ` +
    `\`verified_at\` is refreshed.\n${extra ? "\n" + extra + "\n" : ""}` +
    `\nRe-running the generator overwrites this directory cleanly (idempotent).\n`;
  writeFileSync(join(dir, "README.md"), md);
}

// --- Orchestration ---------------------------------------------------------

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

function migrateAmcp(repoDir) {
  const readme = join(repoDir, "README.md");
  if (!existsSync(readme)) throw new Error(`amcp README not found: ${readme}`);
  const outDir = join(INCOMING, "awesome-mcp-servers");
  resetDir(outDir);
  const items = parseAmcpReadme(readFileSync(readme, "utf8"));
  const stubs = buildAmcpStubs(items);
  for (const s of stubs) writeStub(outDir, s.frontmatter, s.body);
  writeReadme(outDir, "awesome-mcp-servers (migrated stubs)",
    "https://github.com/punkpeye/awesome-mcp-servers", stubs.length,
    "Every active server entry from the README's *Server Implementations* and " +
    "*Frameworks* sections becomes one `type: mcps` stub; tags carry the category heading.");
  return { count: stubs.length, dir: outDir, names: stubs.map((s) => s.frontmatter.name) };
}

function migrateAcc(repoDir) {
  const csv = join(repoDir, "THE_RESOURCES_TABLE.csv");
  if (!existsSync(csv)) throw new Error(`acc CSV not found: ${csv}`);
  const outDir = join(INCOMING, "awesome-claude-code-full");
  resetDir(outDir);
  const items = parseAccCsv(readFileSync(csv, "utf8"));
  const stubs = buildAccStubs(items);
  const byType = {};
  for (const s of stubs) {
    const typeDir = join(outDir, s.type);
    mkdirSync(typeDir, { recursive: true });
    writeStub(typeDir, s.frontmatter, s.body);
    (byType[s.type] ||= []).push(s.frontmatter.name);
  }
  const typeLines = Object.entries(byType)
    .map(([t, ns]) => `  - \`${t}/\`: ${ns.length}`).join("\n");
  writeReadme(outDir, "awesome-claude-code (FULL, migrated stubs)",
    "https://github.com/hesreallyhim/awesome-claude-code", stubs.length,
    "Every **active** row of `THE_RESOURCES_TABLE.csv` is mapped category->type " +
    "and emitted under its type subdir:\n" + typeLines);
  return { count: stubs.length, dir: outDir, byType,
    names: stubs.map((s) => `${s.type}/${s.frontmatter.name}`) };
}

// Validate a random sample of written stubs with the real parser.
function validateSample(dir, n = 20) {
  const files = [];
  const walk = (d) => {
    for (const f of readdirSync(d, { withFileTypes: true })) {
      if (f.isDirectory()) walk(join(d, f.name));
      else if (f.name.endsWith(".md") && f.name !== "README.md") files.push(join(d, f.name));
    }
  };
  walk(dir);
  // deterministic-ish random: stride sample across the sorted list
  files.sort();
  const step = Math.max(1, Math.floor(files.length / n));
  const sample = [];
  for (let i = 0; i < files.length && sample.length < n; i += step) sample.push(files[i]);
  let errors = 0, nameMismatch = 0;
  for (const f of sample) {
    const fm = parseFrontmatter(readFileSync(f, "utf8"));
    const req = ["name", "type", "description", "source_url", "license", "verified_at"];
    for (const k of req) if (fm[k] === undefined || fm[k] === null || fm[k] === "") errors++;
    if (fm.name !== basename(f, ".md")) nameMismatch++;
  }
  return { sampled: sample.length, errors, nameMismatch };
}

function main() {
  const amcpDir = arg("--amcp");
  const accDir = arg("--acc");
  if (!amcpDir && !accDir) {
    console.error("usage: migrate-awesome.mjs --amcp <clone> --acc <clone>");
    process.exit(2);
  }
  const out = {};
  if (amcpDir) out.amcp = migrateAmcp(amcpDir);
  if (accDir) out.acc = migrateAcc(accDir);

  console.log("\n=== MIGRATION TOTALS ===");
  if (out.amcp) {
    console.log(`awesome-mcp-servers       : ${out.amcp.count} stubs -> ${out.amcp.dir.replace(ROOT, ".")}`);
    console.log(`  sample slugs: ${out.amcp.names.slice(0, 5).join(", ")}`);
  }
  if (out.acc) {
    console.log(`awesome-claude-code (full): ${out.acc.count} stubs -> ${out.acc.dir.replace(ROOT, ".")}`);
    for (const [t, ns] of Object.entries(out.acc.byType)) console.log(`    ${t}: ${ns.length}`);
    console.log(`  sample slugs: ${out.acc.names.slice(0, 5).join(", ")}`);
  }

  console.log("\n=== VALIDATION (20-file stride sample, real parseFrontmatter) ===");
  if (out.amcp) {
    const v = validateSample(out.amcp.dir);
    console.log(`awesome-mcp-servers   : sampled=${v.sampled} frontmatter-errors=${v.errors} name!=file=${v.nameMismatch}`);
  }
  if (out.acc) {
    const v = validateSample(out.acc.dir);
    console.log(`awesome-claude-code   : sampled=${v.sampled} frontmatter-errors=${v.errors} name!=file=${v.nameMismatch}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
