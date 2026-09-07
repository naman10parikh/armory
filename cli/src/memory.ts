// `armory memory-search <q>` — BM25 search over Armiger's OWN memory corpus:
// MEMORY.md, SOUL.md, the operating docs (CLAUDE/AGENTS/HARNESS/STRUCTURE/…),
// docs/, the cataloged memory/ + identity/ pattern pages, the brain MOC, and
// (via the generated catalog index) the full brain/components corpus.
// Pattern ported from energy/scripts/memory-search.sh: term-frequency × IDF ×
// source weight × recency, top-N with surrounding context.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { loadCatalog, rankComponents, resolveRoot } from "./catalog.js";

export interface MemoryHit {
  /** Repo-relative path of the source file (or brain/<path> for catalog hits). */
  file: string;
  /** Section heading the hit landed in ("" when the file has no headings). */
  heading: string;
  /** Combined relevance score (tf·idf × source weight × recency weight). */
  score: number;
  /** Up to three matching context lines from the section. */
  context: string[];
}

interface Section {
  file: string;
  heading: string;
  lines: string[];
  weight: number;
  recency: number;
}

// Source weight map — mirrors energy/scripts/memory-search.sh: the bootstrap
// memory and identity files are most authoritative, generated surfaces least.
function weightFor(rel: string): number {
  if (rel === "MEMORY.md") return 5;
  if (/^(SOUL|CLAUDE|AGENTS|HARNESS|BRAND)\.md$/.test(rel)) return 4;
  if (rel.startsWith("memory/") || rel.startsWith("docs/")) return 3;
  if (rel.startsWith("identity/") || rel.startsWith("brain/")) return 2;
  return 1; // README, STRUCTURE, MASTER-TODO, AUTOLAB-LOG, …
}

// Recency weight: recently-touched memory scores higher (energy pattern).
function recencyFor(file: string): number {
  try {
    const ageDays = (Date.now() - statSync(file).mtimeMs) / 86_400_000;
    if (ageDays <= 1) return 10;
    if (ageDays <= 3) return 8;
    if (ageDays <= 7) return 6;
    if (ageDays <= 14) return 4;
    if (ageDays <= 30) return 2;
    return 1;
  } catch {
    return 1;
  }
}

const ROOT_DOCS = [
  "MEMORY.md", "SOUL.md", "BRAND.md", "CLAUDE.md", "AGENTS.md", "HARNESS.md",
  "STRUCTURE.md", "README.md", "MASTER-TODO.md", "AUTOLAB-LOG.md", "CONTRIBUTING.md",
];
const CORPUS_DIRS = ["docs", "memory", "identity", "brain"]; // brain = MOC level only

function listCorpusFiles(root: string): string[] {
  const files: string[] = [];
  for (const f of ROOT_DOCS) if (existsSync(join(root, f))) files.push(f);
  for (const dir of CORPUS_DIRS) {
    const abs = join(root, dir);
    if (!existsSync(abs)) continue;
    for (const name of readdirSync(abs)) {
      if (name.endsWith(".md")) files.push(join(dir, name));
    }
  }
  return files;
}

// Split a markdown file into ##-heading sections so hits point at the exact
// part of the doc, not just the file.
function sectionize(root: string, rel: string): Section[] {
  const text = readFileSync(join(root, rel), "utf8");
  const weight = weightFor(rel);
  const recency = recencyFor(join(root, rel));
  const sections: Section[] = [];
  let current: Section = { file: rel, heading: "", lines: [], weight, recency };
  for (const line of text.split(/\r?\n/)) {
    if (/^#{1,3}\s+\S/.test(line)) {
      if (current.lines.length > 0) sections.push(current);
      current = { file: rel, heading: line.replace(/^#+\s*/, ""), lines: [line], weight, recency };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length > 0) sections.push(current);
  return sections;
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);
}

// BM25-ish: tf·idf per section, scaled by source weight + recency.
// Deterministic — ties broken by file path for stable output.
export function searchMemory(query: string, root = resolveRoot(), limit = 5): MemoryHit[] {
  const qTerms = [...new Set(tokenize(query))];
  if (qTerms.length === 0) return [];

  const sections = listCorpusFiles(root).flatMap((rel) => sectionize(root, rel));
  const docCount = sections.length || 1;
  const tokens = sections.map((s) => tokenize(s.lines.join(" ")));

  const df = new Map<string, number>();
  for (const toks of tokens) {
    const set = new Set(toks);
    for (const term of qTerms) if (set.has(term)) df.set(term, (df.get(term) ?? 0) + 1);
  }
  const idf = (term: string): number => Math.log(1 + docCount / (1 + (df.get(term) ?? 0)));

  const hits = sections.map((section, i) => {
    let tfidf = 0;
    for (const term of qTerms) {
      const tf = tokens[i].filter((t) => t === term).length;
      if (tf > 0) tfidf += idf(term) * tf;
    }
    const score = tfidf * section.weight * section.recency;
    const context = section.lines
      .filter((l) => qTerms.some((t) => l.toLowerCase().includes(t)))
      .slice(0, 3)
      .map((l) => l.trim());
    return { file: section.file, heading: section.heading, score, context };
  });

  return hits
    .filter((h) => h.score > 0)
    .sort((a, b) => (b.score === a.score ? a.file.localeCompare(b.file) : b.score - a.score))
    .slice(0, limit);
}

export interface BrainHit {
  name: string;
  type: string;
  path: string;
  score: number;
}

// The brain/components corpus (~30k pages) is searched through its generated
// index (catalog.json) instead of re-reading 30k files per query — same BM25
// ranking the rest of the CLI uses.
export function searchBrain(query: string, root = resolveRoot(), limit = 3): BrainHit[] {
  const catalog = loadCatalog(root);
  return rankComponents(catalog.components, query)
    .slice(0, limit)
    .map(({ component, score }) => ({
      name: component.name,
      type: component.type,
      path: `brain/${component.path}`,
      score,
    }));
}
