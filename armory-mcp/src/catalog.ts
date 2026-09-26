// Local catalog access + ranking for the Component MCP server. Intentionally a
// small standalone copy of the CLI's helper (Simplicity First — no shared
// package to version across two surfaces). Codes to the catalog.json contract.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gunzipSync } from "node:zlib";

export interface Component {
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
  components: Component[];
}

const HERE = dirname(fileURLToPath(import.meta.url));
// In a clone, dist/ sits two levels under the repository root, which holds catalog.json, lib/rank.mjs and
// brain/. An installed package has none of those there, so it carries its own copies of the catalog and the
// engine in vendor/, written at pack time (scripts/vendor-for-pack.mjs; CP138 T50).
const CLONE = resolve(HERE, "..", "..");
const VENDOR = resolve(HERE, "..", "vendor");
const hasCatalog = (dir: string): boolean =>
  existsSync(join(dir, "catalog.json")) || existsSync(join(dir, "catalog.json.gz"));

export function resolveRoot(): string {
  const override = process.env.ARMORY_ROOT;
  if (override) return resolve(override);
  if (hasCatalog(CLONE)) return CLONE;
  if (hasCatalog(VENDOR)) return VENDOR;
  return CLONE;
}

/** The ranking engine's file URL: the clone's lib/rank.mjs, else the copy packed in vendor/. */
export function engineUrl(): string {
  const cloned = join(CLONE, "lib", "rank.mjs");
  return pathToFileURL(existsSync(cloned) ? cloned : join(VENDOR, "lib", "rank.mjs")).href;
}

// ~15-line catalog loader: catalog.json, or the gzipped copy an installed package carries.
export function loadCatalog(root = resolveRoot()): Catalog {
  const file = join(root, "catalog.json");
  const gz = `${file}.gz`;
  if (!existsSync(file) && !existsSync(gz)) {
    throw new Error(`catalog.json not found at ${file} — run \`pnpm catalog\` first.`);
  }
  const text = existsSync(file) ? readFileSync(file, "utf8") : gunzipSync(readFileSync(gz)).toString("utf8");
  const parsed = JSON.parse(text) as Catalog;
  if (!Array.isArray(parsed.components)) {
    throw new Error(`catalog.json at ${file} is malformed (missing components array).`);
  }
  return parsed;
}

export function readComponentBody(component: Component, root = resolveRoot()): string {
  const file = join(root, "brain", component.path);
  if (!existsSync(file)) throw new Error(`component body not found at ${file}`);
  return readFileSync(file, "utf8");
}

/**
 * The body from the clone when it has one, else from the public repository: an installed package carries
 * the catalog but not brain/'s 65,000 notes.
 */
export async function fetchComponentBody(component: Component, root = resolveRoot()): Promise<string> {
  if (existsSync(join(root, "brain"))) return readComponentBody(component, root);
  const url = `https://raw.githubusercontent.com/naman10parikh/armory/main/brain/${component.path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`component body not found at ${url} (HTTP ${res.status})`);
  return res.text();
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

const WEIGHTS = { name: 3, tags: 2, description: 1 } as const;

export interface RankedComponent {
  component: Component;
  score: number;
}

// BM25-ish keyword ranking — IDF for rarity, weighted TF for field signal.
export function rankComponents(components: Component[], query: string): RankedComponent[] {
  const qTerms = [...new Set(tokenize(query))];
  if (qTerms.length === 0) return [];

  const docCount = components.length || 1;
  const df = new Map<string, number>();
  const docTokens = components.map((e) => {
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

  return components
    .map((component, i) => {
      const { name, tags, desc } = docTokens[i];
      let score = 0;
      for (const term of qTerms) {
        const weighted =
          WEIGHTS.name * tf(name, term) +
          WEIGHTS.tags * tf(tags, term) +
          WEIGHTS.description * tf(desc, term);
        if (weighted > 0) score += idf(term) * weighted;
      }
      return { component, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) =>
      b.score === a.score ? a.component.name.localeCompare(b.component.name) : b.score - a.score
    );
}
