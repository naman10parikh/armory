// Browse — search and filter the whole catalog by type, one page of cards at a time.
//
// Rendered on the SERVER and paginated (CP143 upgrade 10). The old page shipped all 65,000 components
// and their scores to the browser to filter there: 52 MB of HTML and 13 seconds before anything was
// usable. Now the server filters, ranks and slices, and the page carries 24 cards. Query, types and
// page live in the URL, so a view is reproducible and citable.
import type { Metadata } from "next";
import Link from "next/link";
import { ComponentCard } from "@/components/component-card";
import { ContentWidth } from "@/components/data-table";
import { SearchIcon, TypeIcon } from "@/components/icons";
import { getCatalog } from "@/lib/catalog";
import { int } from "@/lib/format";
import { findRow } from "@/lib/rows";
import { filterAndRank } from "@/lib/search";
import { CATEGORIES, CATEGORY_LABEL, type Component, type ComponentType } from "@/lib/types";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Browse · Armory",
  description: "Search and filter agent-harness components by type.",
};

const PAGE = 24;
const VALID_TYPES = new Set<string>(CATEGORIES.map((c) => c.type));
const BUTTON =
  "cursor-pointer rounded-lg border border-line px-3 py-1.5 font-medium text-ink-body transition-colors duration-150 ease-state hover:border-accent-line hover:text-accent-hover";

type Params = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] ?? "" : v ?? "");

/** Comma-separated `?type=` → the valid subset. */
function parseTypes(raw: string): ComponentType[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t): t is ComponentType => VALID_TYPES.has(t));
}

function hrefFor(q: string, types: readonly string[], page: number): string {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (types.length) p.set("type", types.join(","));
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/browse?${s}` : "/browse";
}

/** With no query the catalog reads best-first, in the same order as the leaderboard. */
const orderOf = (c: Component): number => findRow(c.type, c.name)?.order ?? Number.MAX_SAFE_INTEGER;

export default async function BrowsePage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const types = parseTypes(first(sp.type));
  const asked = Math.floor(Number(first(sp.page)));

  const { components, counts } = getCatalog();
  const matched = filterAndRank(components, q, new Set(types));
  const results = q ? matched : [...matched].sort((a, b) => orderOf(a) - orderOf(b));
  const pages = Math.max(1, Math.ceil(results.length / PAGE));
  const page = Number.isFinite(asked) ? Math.min(Math.max(1, asked), pages) : 1;
  const shown = results.slice((page - 1) * PAGE, page * PAGE);
  const toggle = (t: ComponentType) => (types.includes(t) ? types.filter((x) => x !== t) : [...types, t]);

  return (
    <ContentWidth className="pb-24 pt-10">
      <header className="mb-6">
        <h1 className="text-[27px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink-hi">Browse</h1>
        <p className="mt-2 max-w-xl text-[16px] leading-[1.5] text-ink-body">
          Search and filter by type across the catalog
        </p>
      </header>

      <form action="/browse" method="get" role="search" className="mb-6 flex max-w-xl items-center gap-2">
        {types.length > 0 && <input type="hidden" name="type" value={types.join(",")} />}
        <label htmlFor="browse-search" className="sr-only">
          Search
        </label>
        <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-raise-1 px-3.5 transition-colors duration-150 ease-state focus-within:border-accent-line">
          <SearchIcon size={16} className="shrink-0 text-ink-muted" />
          <input
            id="browse-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="playwright"
            autoComplete="off"
            className="h-full w-full min-w-0 bg-transparent text-[14px] text-ink-hi outline-none placeholder:text-ink-faint"
          />
        </div>
        <button
          type="submit"
          className="h-11 shrink-0 cursor-pointer rounded-lg border border-accent-line bg-accent-quiet px-4 text-[14px] font-medium text-accent-hover transition-colors duration-150 ease-state hover:bg-accent-line"
        >
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[210px_1fr]">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">Type</span>
            {types.length > 0 && (
              <Link href={hrefFor(q, [], 1)} className="cursor-pointer text-[12px] font-medium text-accent-hover">
                Reset
              </Link>
            )}
          </div>
          <div className="mt-3 flex flex-row flex-wrap gap-1.5 lg:flex-col lg:gap-1">
            {CATEGORIES.map((cat) => {
              const active = types.includes(cat.type);
              const count = counts.by_type[cat.type] ?? 0;
              return (
                <Link
                  key={cat.type}
                  href={hrefFor(q, toggle(cat.type), 1)}
                  aria-current={active ? "true" : undefined}
                  className={`flex min-h-[36px] cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[13px] transition-colors duration-150 ease-state lg:w-full ${
                    active
                      ? "border-accent-line bg-accent-quiet text-accent-hover"
                      : "border-transparent text-ink-body hover:bg-raise-1 hover:text-ink-hi"
                  }`}
                >
                  <TypeIcon type={cat.type} size={14} className={active ? "text-accent" : "text-ink-muted"} />
                  <span className="flex-1">{cat.label}</span>
                  <data value={String(count)} className="text-[12px] text-ink-muted">
                    {int(count)}
                  </data>
                </Link>
              );
            })}
          </div>
        </aside>

        <div>
          <p className="mb-4 text-[13px] text-ink-muted" aria-live="polite">
            <data value={String(results.length)} className="font-semibold text-ink-hi">
              {int(results.length)}
            </data>{" "}
            results
            {types.length > 0 && <> in {types.map((t) => CATEGORY_LABEL[t]).join(", ")}</>}
            {q && <> for &ldquo;{q}&rdquo;</>} · page <data value={String(page)}>{int(page)}</data> of{" "}
            <data value={String(pages)}>{int(pages)}</data>
          </p>

          {shown.length === 0 ? (
            <div className="rounded-xl border border-line-subtle bg-raise-1 px-5 py-8">
              <p className="text-[14px] font-semibold text-ink-hi">No Results</p>
              <p className="mt-1 text-[13px] text-ink-muted">No component matches this search or filter</p>
              <Link
                href="/browse"
                className="mt-3 inline-block cursor-pointer text-[13px] font-medium text-accent-hover underline underline-offset-4"
              >
                Reset Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
              {shown.map((c) => {
                const row = findRow(c.type, c.name);
                return (
                  <ComponentCard
                    key={`${c.type}/${c.name}`}
                    component={c}
                    score={row ? { universal: row.universal, evidence: row.evidence, signals: row.signals } : null}
                  />
                );
              })}
            </div>
          )}

          {pages > 1 && (
            <nav aria-label="Pages" className="mt-8 flex flex-wrap items-center gap-3 text-[13px] text-ink-muted">
              {page > 1 && (
                <Link href={hrefFor(q, types, page - 1)} className={BUTTON}>
                  Previous
                </Link>
              )}
              <span>
                Page {int(page)} of {int(pages)}
              </span>
              {page < pages && (
                <Link href={hrefFor(q, types, page + 1)} className={BUTTON}>
                  Next
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </ContentWidth>
  );
}
