// Local catalog access + ranking for the Engram MCP server. Intentionally a
// small standalone copy of the CLI's helper (Simplicity First — no shared
// package to version across two surfaces). Codes to the catalog.json contract.
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
  return resolve(HERE, "..", "..");
}

// ~15-line catalog loader.
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

export function readEngramBody(engram: Engram, root = resolveRoot()): string {
  const file = join(root, "brain", engram.path);
  if (!existsSync(file)) throw new Error(`engram body not found at ${file}`);
  return readFileSync(file, "utf8");
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

const WEIGHTS = { name: 3, tags: 2, description: 1 } as const;

export interface RankedEngram {
  engram: Engram;
  score: number;
}

// BM25-ish keyword ranking — IDF for rarity, weighted TF for field signal.
export function rankEngrams(engrams: Engram[], query: string): RankedEngram[] {
  const qTerms = [...new Set(tokenize(query))];
  if (qTerms.length === 0) return [];

  const docCount = engrams.length || 1;
  const df = new Map<string, number>();
  const docTokens = engrams.map((e) => {
    const name = tokenize(e.name);
    const tags = e.tags.flatMap(tokenize);
    const desc = tokenize(e.description);
    const all = new Set([...name, ...tags, ...desc]);
    for (const term of qTerms) if (all.has(term)) df.set(term, (df.get(term) ?? 0) + 1);
    return { name, tags, desc };
  });

  const idf = (term: string): number => Math.log(1 + docCount / (1 + (df.get(term) ?? 0)));
  const tf = (terms: string[], term: string): number =>
    terms.filter((t) => t === term).length;

  return engrams
    .map((engram, i) => {
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
    })
    .filter((r) => r.score > 0)
    .sort((a, b) =>
      b.score === a.score ? a.engram.name.localeCompare(b.engram.name) : b.score - a.score
    );
}
