// Types for the portable ranking engine (lib/rank.mjs), so TypeScript callers (CLI, MCP) resolve it.
export interface RankRow {
  name: string;
  component: string;
  domain: string;
  url?: string | null;
  license?: string | null;
  universal: number | null;
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
  facets: Facets;
}
export interface RankQuery {
  component?: string | null;
  domain?: string | null;
  sort?: string;
  dir?: "desc" | "asc";
  limit?: number;
}
export function rows(): unknown[];
export function leaderboard(query?: RankQuery): RankResult;
export function facets(): Facets;
