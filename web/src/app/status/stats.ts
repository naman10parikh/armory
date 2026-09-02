// Data layer for /status, split out of page.tsx to keep the page under the
// 300-line file cap. Reads the vendored catalog.json the same way /api/rank does
// (join(process.cwd(), "catalog.json")) and reports, honestly: how many
// components are indexed, how many carry each ranking signal (stars · a
// measured test · community mentions), and when the crawl last confirmed
// everything. Server-only, memoized so the 38MB parse happens once.
import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

interface Comp {
  stars?: number | null;
  eval_score?: number | null;
  mentions?: number | null;
  verified_at?: string | null;
  source_repo?: string | null;
}

export interface Stats {
  total: number;
  sources: number;
  stars: number;
  tested: number;
  mentions: number;
  anySignal: number;
  months: { key: string; count: number }[];
  validAsOf: string | null; // year-month of the newest crawl, e.g. "2026-05"
  sweptFrom: string | null; // full min date, e.g. "2026-05-26"
  sweptTo: string | null; // full max date
  monthsOld: number; // age of the newest crawl, in whole months
}

let CACHE: Stats | null = null;

export function stats(): Stats {
  if (CACHE) return CACHE;
  const path = join(process.cwd(), "catalog.json"); // vendored to the site root by prebuild
  const cat = JSON.parse(readFileSync(path, "utf-8")) as { components?: Comp[] };
  const comps = cat.components ?? [];

  const sources = new Set<string>();
  const ym = new Map<string, number>();
  let stars = 0;
  let tested = 0;
  let mentions = 0;
  let anySignal = 0;
  let min = "9999-99-99";
  let max = "0000-00-00";

  for (const c of comps) {
    const hasStars = typeof c.stars === "number" && c.stars > 0;
    const hasTested = typeof c.eval_score === "number";
    const hasMentions = typeof c.mentions === "number" && c.mentions > 0;
    if (hasStars) stars++;
    if (hasTested) tested++;
    if (hasMentions) mentions++;
    if (hasStars || hasTested || hasMentions) anySignal++;
    if (typeof c.source_repo === "string" && c.source_repo) sources.add(c.source_repo);

    const key = c.verified_at ? String(c.verified_at).slice(0, 7) : "(none)";
    ym.set(key, (ym.get(key) ?? 0) + 1);
    if (c.verified_at) {
      const d = String(c.verified_at);
      if (d < min) min = d;
      if (d > max) max = d;
    }
  }

  // year-months ascending, with the undated bucket pinned last
  const months = Array.from(ym.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => {
      if (a.key === "(none)") return 1;
      if (b.key === "(none)") return -1;
      return a.key < b.key ? -1 : 1;
    });

  const sweptTo = max !== "0000-00-00" ? max : null;
  const sweptFrom = min !== "9999-99-99" ? min : null;
  const validAsOf = sweptTo ? sweptTo.slice(0, 7) : null;

  let monthsOld = 0;
  if (sweptTo) {
    const newest = new Date(sweptTo + "T00:00:00Z").getTime();
    const ageMs = Date.now() - newest;
    monthsOld = Math.max(1, Math.round(ageMs / (1000 * 60 * 60 * 24 * 30.44)));
  }

  CACHE = {
    total: comps.length,
    sources: sources.size,
    stars,
    tested,
    mentions,
    anySignal,
    months,
    validAsOf,
    sweptFrom,
    sweptTo,
    monthsOld,
  };
  return CACHE;
}

// ---- small formatters, shared by the page ------------------------------------------------
export const n = (v: number): string => v.toLocaleString("en-US");

export const pct = (part: number, whole: number): string => {
  if (!whole) return "0%";
  const p = (100 * part) / whole;
  return (p < 1 ? p.toFixed(2) : p.toFixed(1)) + "%";
};

export function monthLabel(key: string): string {
  if (key === "(none)") return "No Date";
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function longDate(d: string | null): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
