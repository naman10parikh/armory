// Build-time data access. Reads the generated catalog.json and the brain/
// markdown bodies directly from the monorepo root. Server-only (uses node:fs);
// never imported into a client component. Read-only — the site never writes
// to brain/ or catalog.json.
import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readCatalogText } from "./catalog-file";
import { rawCatalog } from "./rows";
import { normalizeComponent } from "./normalize";
import type { Catalog, Component, ComponentType } from "./types";

// The catalog + brain markdown are authored OUTSIDE site/ (repo root + the
// Obsidian vault). A Vercel build rooted at site/ can't reliably reach parent
// dirs, and ISR long-tail pages render inside a serverless function that only
// ships traced files. To work in BOTH local dev AND the deployed/serverless
// env, `pnpm prebuild` copies catalog.json + brain/ INTO site/, and we resolve
// the local copy first (present in prod), falling back to ../ (present in dev
// before prebuild runs). next.config.mjs traces the local copies into the
// function via outputFileTracingIncludes. Read-only — the site never writes.
const CWD = process.cwd();
const BRAIN_DIR = existsSync(join(CWD, "brain"))
  ? join(CWD, "brain")
  : join(CWD, "..", "brain");

let cached: Catalog | null = null;

const EMPTY_CATALOG: Catalog = {
  generated_at: new Date(0).toISOString(),
  counts: {
    total: 0,
    by_type: {
      mcps: 0,
      skills: 0,
      hooks: 0,
      subagents: 0,
      identity: 0,
      memory: 0,
      "claudemd-rules": 0,
      "clis-tools": 0,
      evals: 0,
      observability: 0,
      infrastructure: 0,
      workflows: 0,
    },
  },
  components: [],
};

/** Load the catalog once per build. Normalises every entry and degrades to an
 *  empty catalog if the file is missing or malformed so the UI renders empty
 *  states instead of crashing. */
export function getCatalog(): Catalog {
  if (cached) return cached;
  try {
    // One parse per process: the board (src/lib/rows.ts) already holds catalog.json.
    const parsed = (rawCatalog() ?? JSON.parse(readCatalogText())) as Partial<Catalog>;
    if (!parsed || !Array.isArray(parsed.components)) throw new Error("bad shape");
    const components = parsed.components
      .map(normalizeComponent)
      .filter((e): e is Component => e !== null);
    cached = {
      generated_at: typeof parsed.generated_at === "string"
        ? parsed.generated_at
        : new Date(0).toISOString(),
      counts: parsed.counts ?? EMPTY_CATALOG.counts,
      components,
    };
  } catch (err) {
    console.warn(
      "[catalog] could not read catalog.json, using empty catalog:",
      err instanceof Error ? err.message : String(err),
    );
    cached = EMPTY_CATALOG;
  }
  return cached;
}

export function getComponents(): Component[] {
  return getCatalog().components;
}

export function findComponent(type: string, slug: string): Component | undefined {
  return getComponents().find((e) => e.type === type && e.name === slug);
}

export function getComponentsByType(type: ComponentType): Component[] {
  return getComponents().filter((e) => e.type === type);
}

/** A name→type index so [[wikilink]] related-refs can resolve to detail routes. */
export function getNameIndex(): Map<string, ComponentType> {
  const index = new Map<string, ComponentType>();
  for (const e of getComponents()) index.set(e.name, e.type);
  return index;
}

/** Read the raw markdown BODY (frontmatter stripped) for an component, from
 *  brain/<path>. Read-only access to the brain vault. Returns "" if unreadable. */
export function readComponentBody(component: Component): string {
  try {
    const full = join(BRAIN_DIR, component.path);
    const raw = readFileSync(full, "utf8");
    return stripFrontmatter(raw);
  } catch (err) {
    console.warn(
      `[catalog] could not read brain body for ${component.name}:`,
      err instanceof Error ? err.message : String(err),
    );
    return "";
  }
}

function stripFrontmatter(raw: string): string {
  const m = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? raw.slice(m[0].length).trim() : raw.trim();
}
