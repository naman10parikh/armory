// Shared catalog access + ranking for the component CLI.
// Codes to the catalog.json contract (see CONTRIBUTING.md). Kept small on
// purpose — Simplicity First. The MCP package has its own ~15-line copy of
// loadCatalog rather than a cross-package import.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gunzipSync } from "node:zlib";
import { fetchFile } from "./fetch.js";

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

// Resolve the folder that holds the catalog. Override with ENGRAM_ROOT (used by tests to point at a
// fixture); otherwise the clone this CLI was built in, else the copy packed with it.
export function resolveRoot(): string {
  const override = process.env.ENGRAM_ROOT;
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

// ~15-line catalog loader: read catalog.json, or the gzipped copy an installed package carries.
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

// Read a component's markdown body. `path` is relative to brain/. An installed package carries no brain/,
// so outside a clone the body is read from the public repository instead.
export function readComponentBody(component: Component, root = resolveRoot()): string {
  const file = join(root, "brain", component.path);
  if (existsSync(file)) return readFileSync(file, "utf8");
  if (existsSync(join(root, "brain"))) throw new Error(`component body not found at ${file}`);
  const armory = { owner: "naman10parikh", repo: "armory", ref: "main", path: "", isFile: true };
  return fetchFile(armory, `brain/${component.path}`);
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

export interface RankedComponent {
  component: Component;
  score: number;
}

// BM25-ish keyword ranking over name + description + tags.
// IDF rewards rarer terms; weighted TF rewards matches in higher-signal fields.
// Deterministic — ties broken by name for stable output.
export function rankComponents(components: Component[], query: string): RankedComponent[] {
  const qTerms = [...new Set(tokenize(query))];
  if (qTerms.length === 0) return [];

  const docCount = components.length || 1;
  // Document frequency per query term (how many components mention it anywhere).
  const df = new Map<string, number>();
  const docTokens = components.map((e) => {
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

  const ranked = components.map((component, i) => {
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
  });

  return ranked
    .filter((r) => r.score > 0)
    .sort((a, b) =>
      b.score === a.score ? a.component.name.localeCompare(b.component.name) : b.score - a.score
    );
}

// Pull the install/invoke snippet out of a component body. We return the prose
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
