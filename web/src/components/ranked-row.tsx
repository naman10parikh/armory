import type { RowView } from "./board-table";
import type { SignalValues } from "./signals-row";
import { isOurs, rankedScoreTexts, tiedRank } from "@/lib/format";

/*
  GET /api/rank items → the ranked table's row views, for the one page that still ranks in the
  browser (Ask's default view). Server pages build the same shape from src/lib/rows.ts, so the two
  cannot draw a row differently: both render components/board-table.tsx.
*/

/** One flat item from GET /api/rank (lib/rank.mjs flat()). */
export interface RankedRowData {
  name: string;
  /** Set by the /api/rank route when the catalog gives the row a title (the slug alone would not do). */
  title?: string;
  type?: string | null;
  component: string;
  domain: string;
  url: string | null;
  universal: number | null;
  exact?: number | null;
  evidence?: number;
  signals: SignalValues;
  desc: string;
  pushed_at?: string | null;
  stale?: boolean;
  /** The feed that contributed the row ("Sentinel" for a `sentinel-feed` tag), from lib/rank.mjs. */
  contributor?: string | null;
  /** Set by the /api/rank route (src/lib/installable.ts): whether `armory install` places it. */
  installable?: boolean;
}

/** Count of independent, non-null signals — the engine's `scores.evidence`, for items without it. */
export function evidenceOf(signals: SignalValues): number {
  return [signals.tested, signals.mentions, signals.stars, signals.usage, signals.forks].filter((v) => v != null)
    .length;
}

export function apiRowViews(items: readonly RankedRowData[], firstRank = 1): RowView[] {
  const exacts = items.map((it) => (it.universal == null ? null : it.exact ?? it.universal));
  const texts = rankedScoreTexts(exacts);
  // GET /api/rank lists in score order, so equal exact scores share a rank (format.ts tiedRank).
  const ranks: number[] = [];
  exacts.forEach((e, i) => ranks.push(tiedRank(i > 0 ? { rank: ranks[i - 1], exact: exacts[i - 1] } : undefined, e, firstRank + i)));
  return items.map((it, i) => ({
    key: `${it.type ?? it.component}/${it.name}/${i}`,
    rank: ranks[i],
    name: it.name,
    title: it.title,
    href: it.type ? `/e/${encodeURIComponent(it.type)}/${encodeURIComponent(it.name)}` : it.url,
    external: !it.type && it.url != null,
    meta: [it.component, it.domain].filter(Boolean).join(" · "),
    desc: it.desc,
    universal: it.universal,
    exact: it.exact ?? it.universal,
    scoreText: texts[i],
    evidence: it.evidence ?? evidenceOf(it.signals),
    signals: it.signals,
    pushedAt: it.pushed_at ?? null,
    stale: it.stale ?? false,
    listedAt: null,
    gained: null,
    ours: isOurs(it.url),
    contributedBy: it.contributor ?? null,
    alsoListedAs: [],
    installable: it.installable ?? false,
    source: it.url,
  }));
}

/** Skeleton at final row height — no layout shift once data lands. */
export function RankedRowSkeleton({ cols = 7, rows = 8 }: { cols?: number; rows?: number }) {
  return (
    <div aria-hidden className="w-full">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex h-14 items-center gap-6 border-b border-line-subtle px-3">
          {Array.from({ length: cols }).map((__, c) => (
            <span key={c} className="block h-3 w-full max-w-[160px] animate-pulse rounded bg-raise-3" />
          ))}
        </div>
      ))}
    </div>
  );
}
