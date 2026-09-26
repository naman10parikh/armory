// The board — every catalog row scored ONCE per process, in the engine's default order, with what
// the catalog's history adds (when a row was listed, mentions gained). The home tabs, the
// leaderboard, the shelves, /stack, /browse and the detail pages all read from here, so none of them
// parses the 55 MB catalog on its own and none can quote a different number or order.
import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
// @ts-expect-error — vendored plain-ESM engine (web/lib/rank.mjs, copied by scripts/copy-data.mjs)
import { SHELF_FIT, SHELF_MOVES, computeRows, facetsOf, orderByScore, rankRows } from "../../lib/rank.mjs";
import type { SignalValues } from "@/components/signals-row";
import { readCatalogText } from "./catalog-file";
import { contributorOf, isOurs, tiedRank, titleOf } from "./format";
import { isInstallable } from "./installable";

export interface BoardRow {
  name: string;
  /** The catalog's `title`, when the slug alone would not do (format.ts titleOf); pages print `title || name`. */
  title?: string;
  /** RAW catalog type ("mcps", "clis-tools") — the /e/[type]/[slug] path segment. */
  type: string;
  /** NORMALIZED component ("mcp", "cli") — what /leaderboard?component= filters on. */
  component: string;
  /** False when the row is filed under a component whose job it does not do (lib/rank.mjs SHELF_FIT): no shelf lists it. */
  fits: boolean;
  domain: string;
  vertical: string | null;
  url: string | null;
  /** The full catalog description; display code clamps it at a word boundary. */
  desc: string;
  license: string;
  signals: SignalValues;
  universal: number | null;
  /** The Universal before rounding, four decimals — the first tiebreak. */
  exact: number | null;
  evidence: number;
  pushedAt: string | null;
  stale: boolean;
  /** When it entered the catalog (git history), else the date it was crawled. */
  listedAt: string | null;
  /** True when listedAt came from the catalog's history rather than the crawl date. */
  listedKnown: boolean;
  /** Mentions gained over the trending window; null when none. */
  gained: number | null;
  ours: boolean;
  /** The feed that contributed the row ("Sentinel" for a `sentinel-feed` tag), else null. */
  contributedBy: string | null;
  /** The catalog's tags, for what the row is for (src/lib/alternatives.ts). */
  tags: string[];
  /** True when `armory install <name>` places something (src/lib/installable.ts). */
  installable: boolean;
  /** Position in the engine's default order (0 = first). Sorting a subset by it keeps that order. */
  order: number;
}

/** A row as a ranked list shows it: the same repository listed twice folds into one line. */
export interface ListedRow extends BoardRow {
  /** 1-based place in the list it was drawn from, so page 2 starts at 101 and a folded twin's number is skipped. */
  rank: number;
  alsoListedAs: { name: string; title?: string; type: string }[];
}

export interface BoardMeta {
  generatedAt: string | null;
  total: number;
  ranked: number;
  /** Rows listed in the seven days before the catalog was generated; null without history. */
  addedThisWeek: number | null;
  /** Of those, the rows whose source was last confirmed before the week began (/status explains why). */
  addedThisWeekConfirmedEarlier: number | null;
  /** When the GitHub figures were read (catalog.json github_read): 90% on or after `since`, the newest on `latest`. */
  githubRead: { since: string | null; latest: string } | null;
  trendingDays: number;
  trendingSince: string | null;
  historyAvailable: boolean;
}

export interface Facet {
  key: string;
  count: number;
}

export interface Facets {
  components: Facet[];
  domains: Facet[];
  verticals: Facet[];
  total: number;
}

interface RawComponent {
  name?: string;
  title?: unknown;
  type?: string;
  description?: string;
  license?: string;
  verified_at?: string;
  path?: string;
  tags?: unknown;
}

interface EngineRow {
  name: string;
  type: string | null;
  component: string;
  fits: boolean;
  domain: string;
  vertical: string | null;
  url: string | null;
  license?: string;
  pushed_at: string | null;
  stale: boolean;
  signals: SignalValues;
  scores: { universal: number | null; exact: number | null; evidence: number };
}

interface Changes {
  available?: boolean;
  trending_days?: number;
  trending_since?: string | null;
  listed?: Record<string, string>;
  gained?: Record<string, number>;
}

/** The parsed catalog.json, shared with src/lib/catalog.ts so a process parses it once. */
export interface RawCatalog {
  generated_at?: string;
  counts?: unknown;
  github_read?: { since?: string | null; latest?: string | null };
  components: unknown[];
}

interface State {
  raw: RawCatalog | null;
  rows: BoardRow[];
  ordered: BoardRow[];
  byKey: Map<string, BoardRow>;
  engine: EngineRow[];
  meta: BoardMeta;
  facets: Facets;
}

const DAY = 86_400_000;

function readChanges(): Changes {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), "changes.json"), "utf-8")) as Changes;
  } catch (err) {
    console.warn("[rows] changes.json unavailable:", err instanceof Error ? err.message : String(err));
    return {};
  }
}

const EMPTY: State = {
  raw: null,
  rows: [],
  ordered: [],
  byKey: new Map(),
  engine: [],
  meta: {
    generatedAt: null,
    total: 0,
    ranked: 0,
    addedThisWeek: null,
    addedThisWeekConfirmedEarlier: null,
    githubRead: null,
    trendingDays: 14,
    trendingSince: null,
    historyAvailable: false,
  },
  facets: { components: [], domains: [], verticals: [], total: 0 },
};

let STATE: State | null = null;

function load(): State {
  if (STATE) return STATE;
  try {
    const cat = JSON.parse(readCatalogText()) as {
      components: RawComponent[];
      generated_at?: string;
      github_read?: { since?: string | null; latest?: string | null };
    };
    const changes = readChanges();
    const listed = changes.available ? changes.listed ?? {} : {};
    const gainedMap = changes.available ? changes.gained ?? {} : {};

    const engine = computeRows(cat.components) as EngineRow[];
    const position = new Map<EngineRow, number>();
    (orderByScore(engine) as EngineRow[]).forEach((r, i) => position.set(r, i));

    const rows: BoardRow[] = engine.map((e, i) => {
      const raw = cat.components[i] ?? {};
      const type = typeof raw.type === "string" ? raw.type : e.type ?? "";
      const git = typeof raw.path === "string" ? listed[raw.path] : undefined;
      const crawled = typeof raw.verified_at === "string" && raw.verified_at ? raw.verified_at : null;
      const gained = gainedMap[`${type}/${e.name}`];
      return {
        name: e.name,
        title: titleOf(raw),
        type,
        component: e.component,
        fits: e.fits,
        domain: e.domain,
        vertical: e.vertical,
        url: e.url,
        desc: typeof raw.description === "string" ? raw.description : "",
        license: typeof raw.license === "string" ? raw.license : "",
        signals: e.signals,
        universal: e.scores.universal,
        exact: e.scores.exact,
        evidence: e.scores.evidence,
        pushedAt: e.pushed_at,
        stale: e.stale,
        listedAt: git ?? crawled,
        listedKnown: Boolean(git),
        gained: typeof gained === "number" && gained > 0 ? gained : null,
        ours: isOurs(e.url),
        contributedBy: contributorOf(Array.isArray(raw.tags) ? raw.tags : null),
        tags: Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === "string") : [],
        installable: isInstallable(type, e.name, e.url),
        order: position.get(e) ?? Number.MAX_SAFE_INTEGER,
      };
    });

    const ordered = [...rows].sort((a, b) => a.order - b.order);
    const byKey = new Map<string, BoardRow>();
    for (const r of rows) if (!byKey.has(`${r.type}/${r.name}`)) byKey.set(`${r.type}/${r.name}`, r);

    const generatedAt = typeof cat.generated_at === "string" ? cat.generated_at : null;
    const weekAgo = generatedAt ? new Date(Date.parse(generatedAt) - 7 * DAY).toISOString().slice(0, 10) : null;
    const f = facetsOf(engine) as Facets;
    // A row keeps the date its source was last confirmed (verified_at) when it enters the catalog.
    const confirmedAt = new Map(rows.map((r, i) => {
      const v = cat.components[i]?.verified_at;
      return [r, typeof v === "string" ? v : ""] as const;
    }));
    const thisWeek = changes.available && weekAgo ? rows.filter((r) => r.listedKnown && r.listedAt != null && r.listedAt >= weekAgo) : null;
    const read = cat.github_read;

    STATE = {
      raw: cat as RawCatalog,
      rows,
      ordered,
      byKey,
      engine,
      meta: {
        generatedAt,
        total: rows.length,
        ranked: rows.filter((r) => r.universal != null).length,
        addedThisWeek: thisWeek ? thisWeek.length : null,
        addedThisWeekConfirmedEarlier: thisWeek && weekAgo
          ? thisWeek.filter((r) => (confirmedAt.get(r) ?? "") < weekAgo).length
          : null,
        githubRead: read?.latest ? { since: read.since ?? null, latest: read.latest } : null,
        trendingDays: typeof changes.trending_days === "number" ? changes.trending_days : 14,
        trendingSince: changes.available ? changes.trending_since ?? null : null,
        historyAvailable: Boolean(changes.available),
      },
      facets: { components: f.components, domains: f.domains, verticals: f.verticals, total: f.total },
    };
  } catch (err) {
    console.warn("[rows] catalog unavailable:", err instanceof Error ? err.message : String(err));
    STATE = EMPTY;
  }
  return STATE;
}

/** The parsed catalog (null when it could not be read). */
export function rawCatalog(): RawCatalog | null {
  return load().raw;
}

export function boardMeta(): BoardMeta {
  return load().meta;
}

export function boardFacets(): Facets {
  return load().facets;
}

/** Every row, catalog order. */
export function allBoardRows(): BoardRow[] {
  return load().rows;
}

/** Every row in the engine's default order (ranked first, then the unranked). */
export function orderedRows(): BoardRow[] {
  return load().ordered;
}

export function findRow(type: string, name: string): BoardRow | undefined {
  return load().byKey.get(`${type}/${name}`);
}

/**
 * The same repository listed twice (a renamed repo crawled under both names) prints one line with
 * "also listed as". Only rows that agree on the exact score, stars, forks AND last push fold, so two
 * different projects never do; in the default order such twins are always adjacent. Two different
 * projects with the same exact score share a rank (format.ts tiedRank).
 */
export function foldSameRepo(rows: readonly BoardRow[], firstRank = 1): ListedRow[] {
  const out: ListedRow[] = [];
  rows.forEach((r, i) => {
    const prev = out[out.length - 1];
    const twin =
      prev != null &&
      r.signals.stars != null &&
      prev.signals.stars === r.signals.stars &&
      prev.signals.forks === r.signals.forks &&
      r.pushedAt != null &&
      prev.pushedAt === r.pushedAt &&
      prev.exact === r.exact;
    if (twin) prev.alsoListedAs.push({ name: r.name, title: r.title, type: r.type });
    else out.push({ ...r, rank: tiedRank(prev, r.exact, firstRank + i), alsoListedAs: [] });
  });
  return out;
}

/** Rows that are not folded, numbered from `firstRank`. */
const numbered = (rows: readonly BoardRow[], firstRank = 1): ListedRow[] =>
  rows.map((r, i) => ({ ...r, rank: firstRank + i, alsoListedAs: [] }));

/** The Top tab: the highest scores, in the default order. */
export function topRows(n: number): ListedRow[] {
  return foldSameRepo(load().ordered.filter((r) => r.universal != null).slice(0, n + 10)).slice(0, n);
}

/** The Trending tab: most mentions gained over the window, then the default order. */
export function trendingRows(n: number): ListedRow[] {
  const rising = load().rows.filter((r) => r.gained != null);
  rising.sort((a, b) => (b.gained ?? 0) - (a.gained ?? 0) || a.order - b.order);
  return numbered(rising.slice(0, n));
}

/** Rows with a known listing date, most recent first, then the default order within a day. */
function newest(): BoardRow[] {
  const dated = load().rows.filter((r) => r.listedKnown && r.listedAt != null);
  dated.sort((a, b) => (b.listedAt ?? "").localeCompare(a.listedAt ?? "") || a.order - b.order);
  return dated;
}

/** The New tab: `n` rows from `offset`, numbered from offset + 1 so page two starts at 21. */
export function newRows(n: number, offset = 0): ListedRow[] {
  return numbered(newest().slice(offset, offset + n), offset + 1);
}

/** How many rows the New tab can page through: every row with a known listing date. */
export function newCount(): number {
  return load().rows.filter((r) => r.listedKnown && r.listedAt != null).length;
}

export interface LeaderboardQuery {
  component: string | null;
  domain: string | null;
  vertical: string | null;
  sort: string;
  dir: "asc" | "desc";
  offset: number;
  limit: number;
}

/** What a component lists only (lib/rank.mjs SHELF_FIT): its purpose, the rows filed under it, and how many it leaves out. */
export interface ShelfFit {
  purpose: string;
  filed: number;
  left_out: number;
}

/** The job a component's rows must do to be listed under it, or null when it lists every row filed there. */
export function fitPurpose(component: string): string | null {
  return (SHELF_FIT as Record<string, { purpose: string } | undefined>)[component]?.purpose ?? null;
}

/** True when lib/rank.mjs SHELF_MOVES lists the row on another shelf than its type's, which its page then names. */
export function isMoved(type: string, name: string): boolean {
  return (SHELF_MOVES as Record<string, string | undefined>)[`${type}/${name}`] != null;
}

/** A leaderboard page: the engine filters and sorts (so it matches GET /api/rank), the board adds dates. */
export function leaderboardPage(q: LeaderboardQuery): {
  rows: ListedRow[];
  total: number;
  fit: ShelfFit | null;
  /** The components the component filter lists (lib/rank.mjs componentsOf): the chips to light. */
  components: string[] | null;
} {
  const state = load();
  const result = rankRows(state.engine, {
    component: q.component,
    domain: q.domain,
    vertical: q.vertical,
    sort: q.sort,
    dir: q.dir,
    limit: q.offset + q.limit,
  }) as { items: { name: string; type: string | null }[]; total: number; fit: ShelfFit | null; components: string[] | null };
  const rows = result.items
    .slice(q.offset)
    .map((it) => state.byKey.get(`${it.type ?? ""}/${it.name}`))
    .filter((r): r is BoardRow => r != null);
  const folded = q.sort === "universal" && q.dir === "desc";
  return {
    rows: folded ? foldSameRepo(rows, q.offset + 1) : numbered(rows, q.offset + 1),
    total: result.total,
    fit: result.fit,
    components: result.components,
  };
}
