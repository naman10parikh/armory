// The 11 canonical harness components — the aggregation layer behind /c, /c/[component],
// /stack and /api/stack.
//
// Two mappings live here and nowhere else:
//
//   1. CANON — the canonical component → the normalized `component` values lib/rank.mjs
//      produces for the raw catalog folders it aggregates. Two are unions: Identity holds
//      `identity` + `rules` (a CLAUDE.md rule IS the self), Tools holds `cli` + `tool`.
//      Every one of the catalog's normalized values is claimed by exactly one canonical
//      component, so no row is orphaned and none is double-counted.
//
//   2. resolvePick — an armoryName from src/data/stack.json back to the LIVE scored row,
//      so the Pick block quotes the same Score the table below it does. stack.json holds
//      no number at all; a re-rank moves both together or neither.
//
// Rows come from the same engine as the home page, the leaderboard and /api/rank
// (lib/rank.mjs computeRows) — read once per process, cached.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
// @ts-expect-error — vendored plain-ESM engine (web/lib/rank.mjs, copied by scripts/copy-data.mjs)
import { computeRows } from "../../lib/rank.mjs";
import type { SignalValues } from "@/components/signals-row";
import stackJson from "@/data/stack.json";

/** A scored catalog row, narrowed to the fields these pages render. */
export interface CanonRow {
  name: string;
  /** RAW catalog type ("mcps", "clis-tools") — the /e/[type]/[slug] path segment. */
  type: string;
  /** NORMALIZED component ("mcp", "cli") — what /leaderboard?component= filters on. */
  component: string;
  domain: string;
  url: string | null;
  desc: string;
  signals: SignalValues;
  scores: { universal: number | null; evidence: number };
}

export interface Pick {
  name: string;
  why: string;
  /** Catalog row name, or null when the pick is not indexed yet. */
  armoryName: string | null;
  url: string;
}

export interface StackComponent {
  slug: string;
  label: string;
  oneLine: string;
  picks: Pick[];
}

interface StackFile {
  note: string;
  components: StackComponent[];
}

/** Canonical slug → the normalized `component` values it aggregates. */
export const CANON: Readonly<Record<string, readonly string[]>> = {
  identity: ["identity", "rules"],
  memory: ["memory"],
  skills: ["skill"],
  tools: ["cli", "tool"],
  hooks: ["hook"],
  subagents: ["subagent"],
  mcps: ["mcp"],
  dispatch: ["workflow"],
  evals: ["eval"],
  observability: ["observability"],
  sandbox: ["infra"],
};

/**
 * Cross-cutting properties. They are BADGES and FILTERS, never shelves — a harness is
 * self-improving or model-routed the way it is fast, not by holding a "self-improvement"
 * component. Rendered on /c so the absence of a twelfth and thirteenth card is explained
 * rather than looking like a gap.
 */
export const PROPERTIES: readonly { label: string; note: string }[] = [
  { label: "Self-Improvement", note: "Open-endedness — a property of a harness, not a shelf" },
  { label: "Model Routing", note: "Which model runs which step — a property, not a shelf" },
];

const STACK: StackFile = stackJson;

export const STACK_COMPONENTS: readonly StackComponent[] = STACK.components;
export const STACK_NOTE: string = STACK.note;

/** Canonical order, taken from stack.json so the data file owns the ordering. */
export const CANON_SLUGS: readonly string[] = STACK.components.map((c) => c.slug);

export function stackFor(slug: string): StackComponent | null {
  return STACK.components.find((c) => c.slug === slug) ?? null;
}

// ── Catalog ─────────────────────────────────────────────────────────────────

function catalogPath(): string {
  const local = join(process.cwd(), "catalog.json"); // vendored by `pnpm prebuild`
  return existsSync(local) ? local : join(process.cwd(), "..", "catalog.json");
}

interface RawRow {
  name?: string;
  type?: string | null;
  component?: string;
  domain?: string;
  url?: string | null;
  desc?: string;
  signals?: SignalValues;
  scores?: { universal: number | null; evidence: number };
}

let CACHE: CanonRow[] | null = null;

/** Every scored row, once per process. Empty (never thrown) when the catalog is absent. */
export function allRows(): CanonRow[] {
  if (CACHE) return CACHE;
  try {
    const cat = JSON.parse(readFileSync(catalogPath(), "utf-8")) as { components: unknown[] };
    const scored = computeRows(cat.components) as RawRow[];
    CACHE = scored.map((r) => ({
      name: typeof r.name === "string" ? r.name : "",
      type: typeof r.type === "string" ? r.type : "",
      component: typeof r.component === "string" ? r.component : "other",
      domain: typeof r.domain === "string" ? r.domain : "other",
      url: typeof r.url === "string" ? r.url : null,
      desc: typeof r.desc === "string" ? r.desc : "",
      signals: r.signals ?? { tested: null, mentions: null, stars: null, usage: null },
      scores: r.scores ?? { universal: null, evidence: 0 },
    }));
  } catch (err) {
    console.warn("[canon] catalog unavailable:", err instanceof Error ? err.message : String(err));
    CACHE = [];
  }
  return CACHE;
}

const num = (v: number | null | undefined): number => (typeof v === "number" ? v : -1);

/** Leaderboard default sort: score, then corroboration, then stars, then name. */
function byRank(a: CanonRow, b: CanonRow): number {
  return (
    num(b.scores.universal) - num(a.scores.universal) ||
    b.scores.evidence - a.scores.evidence ||
    num(b.signals.stars) - num(a.signals.stars) ||
    a.name.localeCompare(b.name)
  );
}

// ── Aggregation ─────────────────────────────────────────────────────────────

export interface CanonStats {
  slug: string;
  /** Rows the catalog holds for this component. */
  indexed: number;
  /** Rows carrying at least one measured signal. */
  ranked: number;
  /** ranked / indexed, 0–100, one decimal. */
  rankedPct: number;
  /** Highest Score on the shelf, or null when nothing here is ranked. */
  topScore: number | null;
  /**
   * The member the Leaderboard link targets. /api/rank filters one normalized value at a
   * time, so a union component links its LARGEST member and says so on the page.
   */
  leaderboardComponent: string;
  /** Members carrying rows, largest first — so a union component can name what it merges. */
  members: { component: string; count: number }[];
}

/** Every row on a canonical shelf, best first. Unknown slug → empty. */
export function rowsFor(slug: string): CanonRow[] {
  const members = CANON[slug];
  if (!members) return [];
  return allRows()
    .filter((r) => members.includes(r.component))
    .sort(byRank);
}

export function statsFor(slug: string, rows?: CanonRow[]): CanonStats {
  const list = rows ?? rowsFor(slug);
  const ranked = list.filter((r) => r.scores.universal != null);
  const counts = new Map<string, number>();
  for (const r of list) counts.set(r.component, (counts.get(r.component) ?? 0) + 1);
  const members = [...counts]
    .map(([component, count]) => ({ component, count }))
    .sort((a, b) => b.count - a.count || a.component.localeCompare(b.component));

  return {
    slug,
    indexed: list.length,
    ranked: ranked.length,
    rankedPct: list.length ? Math.round((1000 * ranked.length) / list.length) / 10 : 0,
    topScore: ranked.length ? (ranked[0].scores.universal as number) : null,
    leaderboardComponent: members[0]?.component ?? (CANON[slug]?.[0] ?? ""),
    members,
  };
}

/** Top N ranked rows on a shelf (unranked rows are never padded in). */
export function topRankedFor(slug: string, limit: number, rows?: CanonRow[]): CanonRow[] {
  return (rows ?? rowsFor(slug)).filter((r) => r.scores.universal != null).slice(0, limit);
}

// ── Picks ───────────────────────────────────────────────────────────────────

export interface ResolvedPick extends Pick {
  /** The live catalog row, or null when armoryName is null or no longer resolves. */
  row: CanonRow | null;
  /** Internal detail route, or null when there is no row to link to. */
  href: string | null;
}

/**
 * armoryName → the live row. Names are not unique across types (`playwright-cli` is both
 * a CLI and a skill; `langfuse` is both observability and a skill), so a candidate on the
 * asking component's own shelf wins; otherwise the highest-scoring candidate does. A name
 * that resolves to nothing returns null and renders as Not Indexed — never a faked row.
 */
export function resolvePick(pick: Pick, slug: string): ResolvedPick {
  if (!pick.armoryName) return { ...pick, row: null, href: null };
  const members = CANON[slug] ?? [];
  const candidates = allRows().filter((r) => r.name === pick.armoryName);
  if (candidates.length === 0) return { ...pick, row: null, href: null };
  const onShelf = candidates.filter((r) => members.includes(r.component));
  const row = (onShelf.length ? onShelf : candidates).sort(byRank)[0];
  const href = row.type
    ? `/e/${encodeURIComponent(row.type)}/${encodeURIComponent(row.name)}`
    : null;
  return { ...pick, row, href };
}

export function resolvedPicksFor(slug: string): ResolvedPick[] {
  const entry = stackFor(slug);
  if (!entry) return [];
  return entry.picks.map((p) => resolvePick(p, slug));
}
