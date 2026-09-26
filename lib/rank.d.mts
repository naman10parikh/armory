// Types for the portable ranking engine (lib/rank.mjs), so TypeScript callers (CLI, MCP) resolve it.
export interface RankRow {
  name: string;
  component: string;
  domain: string;
  url?: string | null;
  license?: string | null;
  /** The feed that contributed the row ("Sentinel" for a `sentinel-feed` tag), else null. */
  contributor: string | null;
  universal: number | null;
  /** the Universal before rounding, four decimals; the default order sorts on it first */
  exact: number | null;
  stars: number | null;
  tested: number | null;
  mentions: number | null;
  desc: string;
}
export interface Facets {
  components: { key: string; count: number }[];
  domains: { key: string; count: number }[];
  total: number;
}
export interface RankResult {
  items: RankRow[];
  total: number;
  sort: string;
  dir: string;
  component: string | null;
  domain: string | null;
  /** Set when the component lists only rows made for its job (SHELF_FIT): the job, rows filed, rows left out. */
  fit: { purpose: string; filed: number; left_out: number } | null;
  facets: Facets;
}
export interface RankQuery {
  component?: string | null;
  domain?: string | null;
  sort?: string;
  dir?: "desc" | "asc";
  limit?: number;
}
export interface ShelfRule {
  purpose: string;
  allow: string[];
  deny?: string[];
  must: RegExp;
  not?: RegExp;
}
export const SHELF_FIT: Record<string, ShelfRule>;
/** Rows listed on the shelf of their job, not their type's: "type/name" to component. The type, and so the address, stays. */
export const SHELF_MOVES: Record<string, string>;
/** The site's shelves (web/src/data/stack.json slugs) and the components each lists. */
export const SHELVES: Record<string, string[]>;
/** The components a --component value lists: a shelf name lists its shelf, a component key only its own rows. */
export function componentsOf(name: string): string[];
export function fitsShelf(row: { name?: string; type?: string | null; component?: string | null; description?: string | null }): boolean;
export function rows(): unknown[];
export function leaderboard(query?: RankQuery): RankResult;
export function facets(): Facets;
