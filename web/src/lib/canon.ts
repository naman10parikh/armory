// The 11 canonical harness components — the aggregation layer behind /c, /c/[component],
// /stack and /api/stack.
//
// Two mappings live here:
//
//   1. CANON (read from stack.json) — the canonical component → the normalized `component` values lib/rank.mjs
//      produces for the raw catalog folders it aggregates. Two are unions: Identity holds
//      `identity` + `rules` (a CLAUDE.md rule IS the self), Tools holds `cli` + `tool`.
//      Every one of the catalog's normalized values is claimed by exactly one canonical
//      component, so no row is orphaned and none is double-counted. Sandbox, Tools and Dispatch
//      list only the rows filed there that do their job (lib/rank.mjs SHELF_FIT); filedFor has all.
//
//   2. resolvePick — an armoryName from src/data/stack.json back to the LIVE scored row,
//      so the Pick block quotes the same Score the table below it does. stack.json holds
//      no number at all; a re-rank moves both together or neither.
//
// Rows come from the same engine as the home page, the leaderboard and /api/rank
// (lib/rank.mjs computeRows) — read once per process, cached.
import { allBoardRows, fitPurpose, foldSameRepo, type BoardRow } from "@/lib/rows";
import stackJson from "@/data/stack.json";

/** A scored catalog row — the shared board row (src/lib/rows.ts). */
export type CanonRow = BoardRow;

export interface Pick {
  name: string;
  why: string;
  /** Why it is listed though rows above it score higher. Shown only while it is not its shelf's top row. */
  reason?: string;
  /** Catalog row name, or null when the pick is not indexed yet. */
  armoryName: string | null;
  url: string;
}

export interface StackComponent {
  slug: string;
  label: string;
  oneLine: string;
  aggregates: string[];
  picks: Pick[];
}

/** One account slot on the capability plane: not open-source code, so never ranked. */
export interface PlaneSlot {
  slot: string;
  pick: string;
  access: string;
}

interface StackFile {
  note: string;
  asOf: string;
  regenerate: string;
  provisioning: string;
  components: StackComponent[];
  plane: PlaneSlot[];
}

/**
 * Canonical slug → the normalized `component` values it aggregates. Held in stack.json beside the
 * picks, so scripts/stack-evidence.mjs re-derives /stack from the same map the site renders.
 */
export const CANON: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  (stackJson.components as { slug: string; aggregates: string[] }[]).map((c) => [c.slug, c.aggregates]),
);

/**
 * Cross-cutting properties. They are BADGES and FILTERS, never shelves — a harness is
 * self-improving or model-routed the way it is fast, not by holding a "self-improvement"
 * component. Rendered on /c so the absence of a twelfth and thirteenth card is explained
 * rather than looking like a gap.
 */
export const PROPERTIES: readonly { label: string; note: string }[] = [
  { label: "Self-Improvement", note: "Improves itself between runs" },
  { label: "Model Routing", note: "Which model runs which step" },
];

const STACK: StackFile = stackJson;

export const STACK_COMPONENTS: readonly StackComponent[] = STACK.components;
export const STACK_NOTE: string = STACK.note;
/** The date the picks were set (CP138) and the command that re-derives their evidence (CP138 T45). */
export const STACK_AS_OF: string = STACK.asOf;
export const STACK_REGENERATE: string = STACK.regenerate;
export const PLANE: readonly PlaneSlot[] = STACK.plane;
export const PROVISIONING: string = STACK.provisioning;

/** Canonical order, taken from stack.json so the data file owns the ordering. */
export const CANON_SLUGS: readonly string[] = STACK.components.map((c) => c.slug);

export function stackFor(slug: string): StackComponent | null {
  return STACK.components.find((c) => c.slug === slug) ?? null;
}

// ── Catalog ─────────────────────────────────────────────────────────────────

/** Every scored row, once per process (src/lib/rows.ts). Empty, never thrown, without a catalog. */
export function allRows(): CanonRow[] {
  return allBoardRows();
}

/** The engine's default order (score before rounding, then signals, then freshness, then stars). */
function byRank(a: CanonRow, b: CanonRow): number {
  return a.order - b.order;
}

// ── Aggregation ─────────────────────────────────────────────────────────────

export interface CanonStats {
  slug: string;
  /** Rows the shelf lists: every row filed under it, or, when `fit` is set, the ones that do its job. */
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
  /**
   * Set when the shelf lists only the rows made for its job (lib/rank.mjs SHELF_FIT): the job, how many
   * rows are filed under its components, how many of those it leaves out, and a /browse view that has them.
   */
  fit: { purpose: string; filed: number; leftOut: number; browse: string } | null;
}

/** Every row filed under a canonical shelf's components, whether or not it does the shelf's job. */
export function filedFor(slug: string): CanonRow[] {
  const members = CANON[slug];
  if (!members) return [];
  return allRows()
    .filter((r) => members.includes(r.component))
    .sort(byRank);
}

/** Every row on a canonical shelf, best first: the rows filed there that do its job. Unknown slug → empty. */
export function rowsFor(slug: string): CanonRow[] {
  return filedFor(slug).filter((r) => r.fits);
}

export function statsFor(slug: string, rows?: CanonRow[]): CanonStats {
  const list = rows ?? rowsFor(slug);
  const ranked = list.filter((r) => r.universal != null);
  const counts = new Map<string, number>();
  for (const r of list) counts.set(r.component, (counts.get(r.component) ?? 0) + 1);
  const members = [...counts]
    .map(([component, count]) => ({ component, count }))
    .sort((a, b) => b.count - a.count || a.component.localeCompare(b.component));

  const purpose = (CANON[slug] ?? []).map(fitPurpose).find((p) => p != null) ?? null;
  const filed = purpose ? filedFor(slug) : [];
  // Browse the types of the rows left out. A row moved onto the shelf from another type always fits, so its
  // type (all of MCP Servers, for one moved row) never widens the link (lib/rank.mjs SHELF_MOVES).
  const types = [...new Set(filed.filter((r) => !r.fits).map((r) => r.type))].join(",");

  return {
    slug,
    indexed: list.length,
    ranked: ranked.length,
    rankedPct: list.length ? Math.round((1000 * ranked.length) / list.length) / 10 : 0,
    topScore: ranked.length ? (ranked[0].universal as number) : null,
    leaderboardComponent: members[0]?.component ?? (CANON[slug]?.[0] ?? ""),
    members,
    fit: purpose
      ? { purpose, filed: filed.length, leftOut: filed.length - list.length, browse: `/browse?type=${encodeURIComponent(types)}` }
      : null,
  };
}

/** Top N ranked rows on a shelf (unranked rows are never padded in). */
export function topRankedFor(slug: string, limit: number, rows?: CanonRow[]): CanonRow[] {
  return (rows ?? rowsFor(slug)).filter((r) => r.universal != null).slice(0, limit);
}

// ── Picks ───────────────────────────────────────────────────────────────────

export interface ResolvedPick extends Pick {
  /** The live catalog row, or null when armoryName is null or no longer resolves. */
  row: CanonRow | null;
  /** Internal detail route, or null when there is no row to link to. */
  href: string | null;
  /** Its rank among the shelf's ranked rows, numbered as the shelf table numbers them; null when unranked. */
  rank: number | null;
  /** True for the one pick (stack.json lists it first); the rest are runners-up. */
  isThePick: boolean;
}

/**
 * armoryName → the live row. Names are not unique across types (`playwright-cli` is both
 * a CLI and a skill; `langfuse` is both observability and a skill), so a candidate on the
 * asking component's own shelf wins; otherwise the highest-scoring candidate does. A name
 * that resolves to nothing returns null and renders as Not Indexed — never a faked row.
 */
export function resolvePick(pick: Pick, slug: string, isThePick = false): ResolvedPick {
  const none = { ...pick, row: null, href: null, rank: null, isThePick };
  if (!pick.armoryName) return none;
  const members = CANON[slug] ?? [];
  const candidates = allRows().filter((r) => r.name === pick.armoryName);
  if (candidates.length === 0) return none;
  const onShelf = candidates.filter((r) => members.includes(r.component) && r.fits);
  const row = (onShelf.length ? onShelf : candidates).sort(byRank)[0];
  const href = row.type
    ? `/e/${encodeURIComponent(row.type)}/${encodeURIComponent(row.name)}`
    : null;
  const rank = onShelf.length ? (shelfRanks(slug).get(`${row.type}/${row.name}`) ?? null) : null;
  return { ...pick, row, href, rank, isThePick };
}

const RANKS = new Map<string, Map<string, number>>();

/**
 * Each ranked row's number on a shelf, keyed type/name, as ShelfTable prints it: a repository listed
 * twice counted once, rows with the same score sharing a rank. Rows load once per process, so this does.
 */
function shelfRanks(slug: string): Map<string, number> {
  const cached = RANKS.get(slug);
  if (cached) return cached;
  const ranks = new Map<string, number>();
  for (const r of foldSameRepo(topRankedFor(slug, Number.MAX_SAFE_INTEGER))) {
    ranks.set(`${r.type}/${r.name}`, r.rank);
    for (const a of r.alsoListedAs) ranks.set(`${a.type}/${a.name}`, r.rank);
  }
  RANKS.set(slug, ranks);
  return ranks;
}

/** A shelf's picks in stack.json order: the pick first, then its runners-up. */
export function resolvedPicksFor(slug: string): ResolvedPick[] {
  const entry = stackFor(slug);
  if (!entry) return [];
  return entry.picks.map((p, i) => resolvePick(p, slug, i === 0));
}

/** The same picks in score order, best first; a pick with no rank goes last. */
export function picksInScoreOrder(picks: readonly ResolvedPick[]): ResolvedPick[] {
  return [...picks].sort((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER));
}
