// The Leaderboard — every component, one Score, sliceable by component, domain and vertical, sortable
// on any axis. Rendered on the SERVER (CP143 upgrade 10): the old page fetched /api/rank after load,
// so the HTML an agent read held zero rows and the word "Loading". Filters, sort and page are links,
// so every view is a URL, and the engine that answers GET /api/rank answers this page too.
import type { Metadata } from "next";
import Link from "next/link";
import { BoardTable } from "@/components/board-table";
import { ContentWidth } from "@/components/data-table";
import { HarnessSelector } from "@/components/install-snippet";
import { LinkChipGroup, type ChipLink } from "@/components/link-chips";
import { int } from "@/lib/format";
import { boardFacets, boardMeta, leaderboardPage, type Facet } from "@/lib/rows";
import { toRowViews } from "@/lib/row-view";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Leaderboard · Armory",
  description: "Every agent component scored on its public signals, filterable by component, domain and vertical.",
};

// COPY.md §4B — sort axis → label.
const SORTS: readonly { key: string; label: string }[] = [
  { key: "universal", label: "Score" },
  { key: "popular", label: "Usage" },
  { key: "tested", label: "Tested" },
  { key: "practitioner", label: "Mentions" },
  { key: "stars", label: "Stars" },
  { key: "name", label: "Name" },
];
const LIMITS = [50, 100, 250] as const;
const DEFAULT_LIMIT = 100;

type Params = Record<string, string | string[] | undefined>;

interface View {
  component: string;
  domain: string;
  vertical: string;
  sort: string;
  dir: "asc" | "desc";
  limit: number;
  page: number;
}

const first = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] ?? "" : v ?? "");

function parse(sp: Params): View {
  const sort = first(sp.sort);
  const limit = Number(first(sp.limit));
  const page = Math.floor(Number(first(sp.page)));
  return {
    component: first(sp.component),
    domain: first(sp.domain),
    vertical: first(sp.vertical),
    sort: SORTS.some((s) => s.key === sort) ? sort : "universal",
    dir: first(sp.dir) === "asc" ? "asc" : "desc",
    limit: (LIMITS as readonly number[]).includes(limit) ? limit : DEFAULT_LIMIT,
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}

/** The URL for this view with some fields changed. Defaults are left out, so links stay short. */
function hrefFor(v: View, change: Partial<View>): string {
  const next = { ...v, ...change };
  const q = new URLSearchParams();
  if (next.component) q.set("component", next.component);
  if (next.domain) q.set("domain", next.domain);
  if (next.vertical) q.set("vertical", next.vertical);
  if (next.sort !== "universal") q.set("sort", next.sort);
  if (next.dir !== "desc") q.set("dir", next.dir);
  if (next.limit !== DEFAULT_LIMIT) q.set("limit", String(next.limit));
  if (next.page > 1) q.set("page", String(next.page));
  const qs = q.toString();
  return qs ? `/leaderboard?${qs}` : "/leaderboard";
}

function chips(v: View, field: "component" | "domain" | "vertical", facets: readonly Facet[]): ChipLink[] {
  return [
    { key: "", label: "All", href: hrefFor(v, { [field]: "", page: 1 }), active: v[field] === "" },
    ...facets.map((f) => ({
      key: f.key,
      label: f.key,
      count: f.count,
      href: hrefFor(v, { [field]: f.key, page: 1 }),
      active: v[field] === f.key,
    })),
  ];
}

const BUTTON =
  "cursor-pointer rounded-lg border border-line bg-raise-1 px-2.5 py-1.5 font-medium text-ink-body transition-colors duration-150 ease-state hover:border-accent-line hover:text-accent-hover";

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<Params> }) {
  const v = parse(await searchParams);
  const facets = boardFacets();
  const meta = boardMeta();
  const { rows, total } = leaderboardPage({
    component: v.component || null,
    domain: v.domain || null,
    vertical: v.vertical || null,
    sort: v.sort,
    dir: v.dir,
    offset: (v.page - 1) * v.limit,
    limit: v.limit,
  });
  const pages = Math.max(1, Math.ceil(total / v.limit));
  const csv = `/api/rank.csv?${new URLSearchParams({
    ...(v.component ? { component: v.component } : {}),
    ...(v.domain ? { domain: v.domain } : {}),
    sort: v.sort,
    dir: v.dir,
  }).toString()}`;

  return (
    <div>
      <section className="border-b border-line-subtle">
        <ContentWidth className="pb-6 pt-10">
          <h1 className="text-[27px] font-semibold leading-none tracking-[-0.01em] text-ink-hi">Leaderboard</h1>
          <p className="mt-3 text-[16px] leading-normal text-ink-body">
            Every component scored on its public signals ·{" "}
            <Link href="/formula" className="cursor-pointer font-medium text-accent-hover underline underline-offset-4">
              Formula
            </Link>
          </p>
        </ContentWidth>
      </section>

      <section>
        <ContentWidth className="pb-16 pt-6">
          <div className="flex flex-col gap-3 border-b border-line-subtle pb-4">
            <LinkChipGroup label="Component" chips={chips(v, "component", facets.components)} />
            <LinkChipGroup label="Domain" chips={chips(v, "domain", facets.domains)} />
            <LinkChipGroup label="Vertical" chips={chips(v, "vertical", facets.verticals)} />
            <LinkChipGroup
              label="Sort"
              chips={SORTS.map((s) => ({
                key: s.key,
                label: s.label,
                href: hrefFor(v, { sort: s.key, page: 1 }),
                active: v.sort === s.key,
              }))}
            />
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[12.5px]">
              <Link href={hrefFor(v, { dir: v.dir === "desc" ? "asc" : "desc", page: 1 })} scroll={false} className={BUTTON}>
                {v.dir === "desc" ? "Highest first" : "Lowest first"}
              </Link>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">Rows</span>
                {LIMITS.map((n) => (
                  <Link
                    key={n}
                    href={hrefFor(v, { limit: n, page: 1 })}
                    scroll={false}
                    aria-current={v.limit === n ? "true" : undefined}
                    className={`cursor-pointer rounded-md px-2 py-1 font-medium transition-colors duration-150 ease-state ${
                      v.limit === n ? "bg-accent-quiet text-accent-hover" : "text-ink-body hover:text-ink-hi"
                    }`}
                  >
                    {n}
                  </Link>
                ))}
              </span>
              <a href={csv} className={BUTTON}>
                Export
              </a>
              <HarnessSelector className="lg:hidden" />
              <span className="ml-auto text-ink-muted">
                <data value={String(total)} className="font-semibold text-ink-hi">
                  {int(total)}
                </data>{" "}
                results · <data value={String(meta.total)}>{int(meta.total)}</data> in the catalog
              </span>
            </div>
          </div>

          <div className="mt-4">
            {rows.length === 0 ? (
              <div className="rounded-xl border border-line-subtle bg-raise-1 px-5 py-8">
                <p className="text-[14px] font-semibold text-ink-hi">No Results</p>
                <p className="mt-1 text-[13px] text-ink-muted">No component matches this filter</p>
                <Link
                  href="/leaderboard"
                  className="mt-3 inline-block cursor-pointer text-[13px] font-medium text-accent-hover underline underline-offset-4"
                >
                  Reset Filters
                </Link>
              </div>
            ) : (
              <BoardTable
                label="Leaderboard"
                rows={toRowViews(rows)}
                now={Date.now()}
                fallbackDate={meta.generatedAt}
                scoreSort={v.sort === "universal" ? (v.dir === "asc" ? "ascending" : "descending") : "none"}
              />
            )}
          </div>

          <nav aria-label="Pages" className="mt-5 flex flex-wrap items-center gap-3 text-[13px] text-ink-muted">
            {v.page > 1 && (
              <Link href={hrefFor(v, { page: v.page - 1 })} className={BUTTON}>
                Previous
              </Link>
            )}
            <span>
              Page <data value={String(v.page)}>{int(v.page)}</data> of{" "}
              <data value={String(pages)}>{int(pages)}</data>
            </span>
            {v.page < pages && (
              <Link href={hrefFor(v, { page: v.page + 1 })} className={BUTTON}>
                Next
              </Link>
            )}
            <span className="ml-auto">
              Equal scores are ordered by the score before rounding, then signals, the latest commit and stars.
            </span>
          </nav>
        </ContentWidth>
      </section>
    </div>
  );
}
