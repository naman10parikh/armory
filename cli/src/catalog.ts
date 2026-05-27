// Shared catalog access + ranking for the engram CLI.
// Codes to the catalog.json contract (see CONTRIBUTING.md). Kept small on
// purpose — Simplicity First. The MCP package has its own ~15-line copy of
// loadCatalog rather than a cross-package import.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface Engram {
  name: string;
  type: string;
  description: string;
  source_repo: string;
  source_url: string;
  license: string;
  cli_compat: string[];
  maturity: string;
  stars: number | null;
  eval_score: number | null;
  verified_at: string;
  related: string[];
  tags: string[];
  path: string;
}

export interface Catalog {
  generated_at: string;
  counts: { total: number; by_type: Record<string, number> };
  engrams: Engram[];
}

const HERE = dirname(fileURLToPath(import.meta.url));

// Resolve the repo root that holds catalog.json + brain/. Override with
// ENGRAM_ROOT (used by tests to point at a fixture). Otherwise walk up from
// this file until catalog.json is found.
export function resolveRoot(): string {
  const override = process.env.ENGRAM_ROOT;
  if (override) return resolve(override);
  let dir = HERE;
  for (let i = 0; i < 8; i += 1) {
    if (existsSync(join(dir, "catalog.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback: two levels up from dist/ (engram/cli/dist -> engram).
  return resolve(HERE, "..", "..");
}

// ~15-line catalog loader: read catalog.json from the resolved root.
export function loadCatalog(root = resolveRoot()): Catalog {
  const file = join(root, "catalog.json");
  if (!existsSync(file)) {
    throw new Error(`catalog.json not found at ${file} — run \`pnpm catalog\` first.`);
  }
  const parsed = JSON.parse(readFileSync(file, "utf8")) as Catalog;
  if (!Array.isArray(parsed.engrams)) {
    throw new Error(`catalog.json at ${file} is malformed (missing engrams array).`);
  }
  return parsed;
}

// Read an engram's markdown body. `path` is relative to brain/.
export function readEngramBody(engram: Engram, root = resolveRoot()): string {
  const file = join(root, "brain", engram.path);
  if (!existsSync(file)) {
    throw new Error(`engram body not found at ${file}`);
  }
  return readFileSync(file, "utf8");
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

// Field weights: a query term in the name matters more than in the body.
const WEIGHTS: Record<"name" | "tags" | "description", number> = {
  name: 3,
  tags: 2,
  description: 1,
};

export interface RankedEngram {
  engram: Engram;
  score: number;
}

// BM25-ish keyword ranking over name + description + tags.
// IDF rewards rarer terms; weighted TF rewards matches in higher-signal fields.
// Deterministic — ties broken by name for stable output.
export function rankEngrams(engrams: Engram[], query: string): RankedEngram[] {
  const qTerms = [...new Set(tokenize(query))];
  if (qTerms.length === 0) return [];

  const docCount = engrams.length || 1;
  // Document frequency per query term (how many engrams mention it anywhere).
  const df = new Map<string, number>();
  const docTokens = engrams.map((e) => {
    const name = tokenize(e.name);
    const tags = e.tags.flatMap(tokenize);
    const desc = tokenize(e.description);
    const all = new Set([...name, ...tags, ...desc]);
    for (const term of qTerms) if (all.has(term)) df.set(term, (df.get(term) ?? 0) + 1);
    return { name, tags, desc };
  });

  const idf = (term: string): number =>
    Math.log(1 + docCount / (1 + (df.get(term) ?? 0)));

  const tf = (terms: string[], term: string): number =>
    terms.filter((t) => t === term).length;

  const ranked = engrams.map((engram, i) => {
    const { name, tags, desc } = docTokens[i];
    let score = 0;
    for (const term of qTerms) {
      const weighted =
        WEIGHTS.name * tf(name, term) +
        WEIGHTS.tags * tf(tags, term) +
        WEIGHTS.description * tf(desc, term);
      if (weighted > 0) score += idf(term) * weighted;
    }
    return { engram, score };
  });

  return ranked
    .filter((r) => r.score > 0)
    .sort((a, b) =>
      b.score === a.score ? a.engram.name.localeCompare(b.engram.name) : b.score - a.score
    );
}

// Pull the install/invoke snippet out of an engram body. We return the prose
// + any fenced code under the "How to install / invoke" heading. Falls back to
// the whole body if the heading is absent.
export function extractInstallSnippet(body: string): string {
  const stripped = body.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
  const lines = stripped.split(/\r?\n/);
  const start = lines.findIndex((l) => /^#{1,6}\s+how to install/i.test(l));
  if (start === -1) return stripped.trim();
  const section: string[] = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^#{1,6}\s+\S/.test(lines[i])) break; // next heading ends the section
    section.push(lines[i]);
  }
  return section.join("\n").trim();
}
