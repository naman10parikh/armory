// Data layer for /status, split out of page.tsx to keep the page under the
// 300-line file cap. Reads the vendored catalog the same way /api/rank does and
// reports: how many components are indexed, how many carry each ranking signal
// and how many are ranked, both counted by the engine (lib/rank.mjs) so this page
// agrees with the home page and /formula (CP138 T51), and when the crawl last
// confirmed each row. Server-only, memoized so the parse happens once.
import "server-only";
import { readCatalogText } from "@/lib/catalog-file";
// @ts-expect-error — vendored plain-ESM engine (web/lib/rank.mjs, copied by scripts/copy-data.mjs)
import { computeRows } from "../../../lib/rank.mjs";

interface Comp {
  verified_at?: unknown;
  source_repo?: string | null;
}

export type SignalKey = "stars" | "tested" | "mentions" | "forks" | "usage";

interface Month {
  key: string; // "2026-05", or "(none)" for a row with no date
  count: number;
}

export interface Stats {
  total: number;
  sources: number;
  signals: Record<SignalKey, number>; // rows holding each signal, as the engine scores it
  ranked: number; // rows the engine ranks: at least one signal
  months: Month[];
  base: Month | null; // the month most rows were last confirmed in: the base crawl
  newest: Month | null; // the newest month anything was confirmed in
  sweptFrom: string | null; // full min date, e.g. "2026-05-26"
  sweptTo: string | null; // full max date
}

const SIGNALS: readonly SignalKey[] = ["stars", "tested", "mentions", "forks", "usage"];
// A confirmation date is a real date or nothing: some rows carry a verified_at that is not a date,
// and it printed as "Invalid Date" marked Confirmed (CP138 T51).
const DATE = /^\d{4}-\d{2}-\d{2}/;

let CACHE: Stats | null = null;

export function stats(): Stats {
  if (CACHE) return CACHE;
  const cat = JSON.parse(readCatalogText()) as { components?: Comp[] }; // vendored by prebuild
  const comps = cat.components ?? [];
  const rows = computeRows(comps) as { signals: Record<SignalKey, number | null>; scores: { universal: number | null } }[];
  const signals = Object.fromEntries(
    SIGNALS.map((k) => [k, rows.filter((r) => r.signals[k] != null).length]),
  ) as Record<SignalKey, number>;
  const ranked = rows.filter((r) => r.scores.universal != null).length;

  const sources = new Set<string>();
  const ym = new Map<string, number>();
  let min = "9999-99-99";
  let max = "0000-00-00";

  for (const c of comps) {
    if (typeof c.source_repo === "string" && c.source_repo) sources.add(c.source_repo);

    const d = typeof c.verified_at === "string" && DATE.test(c.verified_at) ? c.verified_at : null;
    const key = d ? d.slice(0, 7) : "(none)";
    ym.set(key, (ym.get(key) ?? 0) + 1);
    if (d) {
      if (d < min) min = d;
      if (d > max) max = d;
    }
  }

  // year-months ascending, with the undated bucket pinned last
  const months: Month[] = Array.from(ym.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => {
      if (a.key === "(none)") return 1;
      if (b.key === "(none)") return -1;
      return a.key < b.key ? -1 : 1;
    });

  const sweptTo = max !== "0000-00-00" ? max : null;
  const sweptFrom = min !== "9999-99-99" ? min : null;
  const dated = months.filter((m) => m.key !== "(none)");
  const base = dated.reduce<Month | null>((best, m) => (!best || m.count > best.count ? m : best), null);
  const newest = dated.length ? dated[dated.length - 1] : null;

  CACHE = {
    total: comps.length,
    sources: sources.size,
    signals,
    ranked,
    months,
    base,
    newest,
    sweptFrom,
    sweptTo,
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
