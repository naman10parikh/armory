"use client";
// The Leaderboard — every open-source building block, one Score, sliceable by component, domain and
// vertical, sortable on any axis. Calls GET /api/rank (unchanged). Filter/sort/dir/rows state lives in
// the URL via next/navigation, so a link reproduces the exact view (design/BRIEF.md §2 "agent-first").
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ContentWidth, DataTable, Th } from "@/components/data-table";
import { HarnessSelector } from "@/components/install-snippet";
import { FilterChipGroup, type ChipFacet } from "@/components/filter-chips";
import { RankedRow, RankedRowSkeleton, type RankedRowData } from "@/components/ranked-row";

interface Facets {
  components: ChipFacet[];
  domains: ChipFacet[];
  verticals: ChipFacet[];
  total: number;
}
interface Result {
  items: RankedRowData[];
  total: number;
  facets: Facets;
}

// COPY.md §4B — sort axis → display label. "popular" and "stars" both sort by
// signals.stars in lib/rank.mjs (an existing engine quirk, out of this lane's
// scope — lib/rank.mjs is off-limits); the labels below are the copy contract
// applied faithfully regardless.
const SORTS: readonly { key: string; label: string }[] = [
  { key: "universal", label: "Score" },
  { key: "popular", label: "Usage" },
  { key: "tested", label: "Tested" },
  { key: "practitioner", label: "Mentions" },
  { key: "stars", label: "Stars" },
  { key: "name", label: "Name" },
];
const LIMITS = [50, 100, 150, 250, 500] as const;
const DEFAULT_SORT = "universal";
const DEFAULT_DIR: "asc" | "desc" = "desc";
const DEFAULT_LIMIT = 150;
const COLS = 8;

const parseDir = (v: string | null): "asc" | "desc" => (v === "asc" ? "asc" : "desc");
const parseLimit = (v: string | null): number => {
  const n = Number(v);
  return (LIMITS as readonly number[]).includes(n) ? n : DEFAULT_LIMIT;
};

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<LeaderboardShell />}>
      <LeaderboardContent />
    </Suspense>
  );
}

function LeaderboardShell() {
  return (
    <ContentWidth className="pb-16 pt-8">
      <h1 className="text-[24px] font-semibold leading-none tracking-[-0.01em] text-ink-hi">
        Leaderboard
      </h1>
      <p className="mt-3 text-[13px] text-ink-muted">Loading</p>
    </ContentWidth>
  );
}

function LeaderboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [component, setComponent] = useState(() => searchParams.get("component") || "");
  const [domain, setDomain] = useState(() => searchParams.get("domain") || "");
  const [vertical, setVertical] = useState(() => searchParams.get("vertical") || "");
  const [sort, setSort] = useState(() => searchParams.get("sort") || DEFAULT_SORT);
  const [dir, setDir] = useState<"asc" | "desc">(() => parseDir(searchParams.get("dir")));
  const [limit, setLimit] = useState(() => parseLimit(searchParams.get("limit")));

  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setErr("");
    const q = new URLSearchParams();
    if (component) q.set("component", component);
    if (domain) q.set("domain", domain);
    if (vertical) q.set("vertical", vertical);
    q.set("sort", sort);
    q.set("dir", dir);
    q.set("limit", String(limit));
    fetch("/api/rank?" + q.toString())
      .then((r) => r.json())
      .then((d: Result) => setData(d))
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, [component, domain, vertical, sort, dir, limit]);

  useEffect(() => {
    load();
  }, [load]);

  // Mirror filter/sort/dir/rows into the URL (never the default value, for a clean link) so this
  // exact view is reproducible and citable — design/BRIEF.md §1.5.
  useEffect(() => {
    const q = new URLSearchParams();
    if (component) q.set("component", component);
    if (domain) q.set("domain", domain);
    if (vertical) q.set("vertical", vertical);
    if (sort !== DEFAULT_SORT) q.set("sort", sort);
    if (dir !== DEFAULT_DIR) q.set("dir", dir);
    if (limit !== DEFAULT_LIMIT) q.set("limit", String(limit));
    const qs = q.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [component, domain, vertical, sort, dir, limit, pathname, router]);

  const csvHref = useMemo(() => {
    const q = new URLSearchParams();
    if (component) q.set("component", component);
    if (domain) q.set("domain", domain);
    if (vertical) q.set("vertical", vertical);
    q.set("sort", sort);
    q.set("dir", dir);
    return "/api/rank.csv?" + q.toString();
  }, [component, domain, vertical, sort, dir]);

  const resetFilters = useCallback(() => {
    setComponent("");
    setDomain("");
    setVertical("");
  }, []);

  const toggleUniversalSort = useCallback(() => {
    if (sort === "universal") setDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSort("universal");
      setDir("desc");
    }
  }, [sort]);

  return (
    <div>
      <section className="border-b border-line-subtle">
        <ContentWidth className="pb-6 pt-8">
          <h1 className="text-[24px] font-semibold leading-none tracking-[-0.01em] text-ink-hi">
            Leaderboard
          </h1>
          <p className="mt-2 text-[16px] leading-normal text-ink-body">
            Every component scored on four independent signals ·{" "}
            <a
              href="/formula"
              className="cursor-pointer font-medium text-accent-hover underline underline-offset-4"
            >
              Formula
            </a>
          </p>
        </ContentWidth>
      </section>

      <section>
        <ContentWidth className="pb-16 pt-6">
          {/* Toolbar — deliberately NOT sticky: the shared Th already sticks at top-0 (design/
              BRIEF.md §7), and a second sticky element at the same offset would overlap it. Th is
              foundation code shared by every page, so it isn't touched to add a compensating
              offset — see this lane's report. */}
          <div className="flex flex-col gap-3 border-b border-line-subtle pb-4">
            <FilterChipGroup
              label="Component"
              facets={data?.facets.components ?? []}
              selected={component}
              onSelect={setComponent}
            />
            <FilterChipGroup
              label="Domain"
              facets={data?.facets.domains ?? []}
              selected={domain}
              onSelect={setDomain}
            />
            <FilterChipGroup
              label="Vertical"
              facets={data?.facets.verticals ?? []}
              selected={vertical}
              onSelect={setVertical}
            />

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="inline-flex items-center gap-2 text-[12px]">
                <span className="font-semibold uppercase tracking-[0.08em] text-ink-muted">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="cursor-pointer rounded-lg border border-line bg-raise-1 px-2.5 py-1.5 text-[12px] text-ink-hi transition-colors duration-150 ease-state hover:border-accent-line"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => setDir((d) => (d === "desc" ? "asc" : "desc"))}
                className="cursor-pointer rounded-lg border border-line bg-raise-1 px-2.5 py-1.5 text-[12px] font-medium text-ink-body transition-colors duration-150 ease-state hover:border-accent-line hover:text-accent-hover"
              >
                {dir === "desc" ? "Descending" : "Ascending"}
              </button>

              <label className="inline-flex items-center gap-2 text-[12px]">
                <span className="font-semibold uppercase tracking-[0.08em] text-ink-muted">Rows</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="cursor-pointer rounded-lg border border-line bg-raise-1 px-2.5 py-1.5 text-[12px] text-ink-hi transition-colors duration-150 ease-state hover:border-accent-line"
                >
                  {LIMITS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>

              <a
                href={csvHref}
                className="cursor-pointer rounded-lg border border-line bg-raise-1 px-2.5 py-1.5 text-[12px] font-medium text-ink-body transition-colors duration-150 ease-state hover:border-accent-line hover:text-accent-hover"
              >
                Export
              </a>

              <HarnessSelector />

              <span className="ml-auto text-[12.5px] tabular-nums text-ink-muted">
                {data ? (
                  <>
                    <data value={String(data.total)} className="font-medium text-ink-body">
                      {data.total.toLocaleString("en-US")}
                    </data>{" "}
                    Results ·{" "}
                    <data value={String(data.facets.total)}>{data.facets.total.toLocaleString("en-US")}</data>{" "}
                    Total
                  </>
                ) : (
                  "Loading"
                )}
              </span>
            </div>
          </div>

          {err && (
            <div className="mt-4 rounded-xl border border-line bg-raise-1 px-4 py-3 text-[13px]">
              <p className="font-semibold text-danger">Load Failed</p>
              <p className="mt-1 text-ink-muted">{err}</p>
              <button
                type="button"
                onClick={load}
                className="mt-2 cursor-pointer font-medium text-accent-hover underline underline-offset-4"
              >
                Retry
              </button>
            </div>
          )}

          <div className="mt-4">
            <DataTable label="Leaderboard" minWidthClass="min-w-[1180px]">
              <thead>
                <tr>
                  <Th align="right" className="w-[56px]">
                    Rank
                  </Th>
                  <Th
                    align="right"
                    className="w-[76px]"
                    sort={sort === "universal" ? (dir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <button
                      type="button"
                      onClick={toggleUniversalSort}
                      className="inline-flex cursor-pointer items-center gap-1 text-inherit"
                    >
                      Score
                      {sort === "universal" && (
                        <span aria-hidden className="text-accent">
                          {dir === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </button>
                  </Th>
                  <Th className="w-[220px]">Component</Th>
                  <Th className="w-auto">Description</Th>
                  <Th className="w-[276px]">Signals</Th>
                  <Th className="w-[104px]">Type</Th>
                  <Th className="w-[124px]">Domain</Th>
                  <Th className="w-[300px]">Install</Th>
                </tr>
              </thead>
              <tbody>
                {!data && loading && <RankedRowSkeleton cols={COLS} rows={8} />}

                {data && data.items.length === 0 && (
                  <tr>
                    <td colSpan={COLS} className="px-3 py-10 text-center">
                      <p className="text-[14px] font-semibold text-ink-hi">No Results</p>
                      <p className="mt-1 text-[12px] text-ink-muted">No components match this filter</p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-3 cursor-pointer text-[12px] font-medium text-accent-hover underline underline-offset-4"
                      >
                        Reset Filters
                      </button>
                    </td>
                  </tr>
                )}

                {data?.items.map((row, i) => (
                  <RankedRow key={`${row.component}/${row.name}/${i}`} row={row} rank={i + 1} />
                ))}
              </tbody>
            </DataTable>
          </div>
        </ContentWidth>
      </section>
    </div>
  );
}
