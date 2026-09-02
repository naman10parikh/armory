"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Component, ComponentType } from "@/lib/types";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/types";
import { filterAndRank } from "@/lib/search";
import { ComponentCard, type ComponentScore } from "@/components/component-card";
import { EmptyState } from "@/components/empty-state";
import { ContentWidth } from "@/components/data-table";
import { SearchIcon, TypeIcon } from "@/components/icons";

const PAGE = 24; // cards rendered per "page" — never emit thousands of DOM nodes.

/*
  Interactive browse: client-side ranking + a facet rail + windowed pagination.
  PERFORMANCE: results are sliced to `visible` cards and grown by an
  IntersectionObserver sentinel ("load more"), so the DOM holds at most ~PAGE×N
  cards regardless of catalog size (thousands of components stay smooth). Search is
  debounced so each keystroke doesn't re-rank the whole list synchronously.

  Filter + query state lives in the URL (design/BRIEF.md rule #2) — `?type=` is a
  comma-separated list of the active facets, `?q=` the search text — so this exact
  view is reproducible and citable by a link.
*/
export function BrowseClient({
  components,
  countsByType,
  scores,
  initialTypes,
  initialQuery,
}: {
  components: Component[];
  countsByType: Record<ComponentType, number>;
  scores: Record<string, ComponentScore>;
  initialTypes: ComponentType[];
  initialQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [activeTypes, setActiveTypes] = useState<Set<ComponentType>>(() => new Set(initialTypes));
  const [visible, setVisible] = useState(PAGE);

  // Debounce the typed query (120ms) so ranking doesn't run on every keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => setQuery(input), 120);
    return () => window.clearTimeout(id);
  }, [input]);

  const results = useMemo(
    () => filterAndRank(components, query, activeTypes),
    [components, query, activeTypes],
  );

  // Reset the window whenever the result set changes.
  useEffect(() => setVisible(PAGE), [query, activeTypes]);

  // Reflect query + facet state into the URL. Skips the redundant replace on first
  // paint — the URL already matches the server-provided initial state.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeTypes.size > 0) params.set("type", [...activeTypes].join(","));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [query, activeTypes, pathname, router]);

  const shown = results.slice(0, visible);
  const hasMore = visible < results.length;

  // Auto-grow the window when the sentinel scrolls into view.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting)
          setVisible((v) => Math.min(v + PAGE, results.length));
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, results.length]);

  function toggleType(type: ComponentType) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function resetFilters() {
    setInput("");
    setActiveTypes(new Set());
  }

  const catalogEmpty = components.length === 0;

  return (
    <ContentWidth className="pb-24 pt-8">
      <header className="mb-6">
        <h1 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink-hi">Browse</h1>
        <p className="mt-2 max-w-xl text-[16px] leading-[1.5] text-ink-body">
          Search and filter by type across the catalog
        </p>
      </header>

      {/* Search */}
      <div className="mb-6 flex h-11 max-w-xl items-center gap-2 rounded-lg border border-line bg-raise-1 px-3.5 transition-colors duration-150 ease-state focus-within:border-accent-line">
        <SearchIcon size={16} className="shrink-0 text-ink-muted" />
        <label htmlFor="browse-search" className="sr-only">
          Search
        </label>
        <input
          id="browse-search"
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="playwright"
          autoComplete="off"
          className="h-full w-full cursor-text bg-transparent font-mono text-[14px] text-ink-hi outline-none placeholder:text-ink-faint"
        />
        <kbd className="pointer-events-none hidden shrink-0 items-center gap-1 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-muted sm:flex">
          ⌘K
        </kbd>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
        {/* Facet rail */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">Type</span>
            {activeTypes.size > 0 && (
              <button
                type="button"
                onClick={() => setActiveTypes(new Set())}
                className="cursor-pointer text-[11px] font-medium text-accent-hover transition-colors duration-150 ease-state hover:text-accent"
              >
                Reset
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-row flex-wrap gap-1.5 lg:flex-col lg:gap-1">
            {CATEGORIES.map((cat) => {
              const count = countsByType[cat.type] ?? 0;
              const active = activeTypes.has(cat.type);
              return (
                <button
                  key={cat.type}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleType(cat.type)}
                  className={`group flex min-h-[36px] cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[13px] transition-colors duration-150 ease-state lg:w-full ${
                    active
                      ? "border-accent-line bg-accent-quiet text-accent-hover"
                      : "border-transparent text-ink-body hover:bg-raise-1 hover:text-ink-hi"
                  }`}
                >
                  <TypeIcon type={cat.type} size={14} className={active ? "text-accent" : "text-ink-muted"} />
                  <span className="flex-1">{cat.label}</span>
                  <data value={String(count)} className="font-mono text-[11px] tabular-nums text-ink-muted">
                    {count}
                  </data>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Results */}
        <div>
          <p className="mb-4 font-mono text-[13px] text-ink-muted" aria-live="polite">
            <data value={String(results.length)} className="text-ink-hi">
              {results.length.toLocaleString("en-US")}
            </data>{" "}
            Results ·{" "}
            <data value={String(components.length)}>{components.length.toLocaleString("en-US")}</data> Total
            {activeTypes.size > 0 && (
              <>
                {" "}
                in{" "}
                <span className="text-accent-hover">
                  {[...activeTypes].map((t) => CATEGORY_LABEL[t]).join(", ")}
                </span>
              </>
            )}
            {query && (
              <>
                {" "}
                for <span className="text-ink-body">&ldquo;{query}&rdquo;</span>
              </>
            )}
          </p>

          {catalogEmpty ? (
            <EmptyState
              label="Not Indexed"
              hint="Indexing in progress"
              action={{ label: "Status", href: "/status" }}
            />
          ) : results.length === 0 ? (
            <EmptyState
              label="No Results"
              hint="No component matches this search or filter"
              suggestions={["MCP", "Memory", "Eval", "Browser"]}
              onSuggest={(t) => {
                setInput(t);
                setActiveTypes(new Set());
              }}
              action={{ label: "Reset Filters", onClick: resetFilters }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
                {shown.map((component) => (
                  <ComponentCard
                    key={`${component.type}/${component.name}`}
                    component={component}
                    score={scores[`${component.type}/${component.name}`] ?? null}
                  />
                ))}
              </div>
              {hasMore && (
                <div ref={sentinelRef} className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => Math.min(v + PAGE, results.length))}
                    className="cursor-pointer rounded-full border border-line px-5 py-2.5 text-[13px] font-medium text-ink-body transition-colors duration-150 ease-state hover:border-accent-line hover:text-accent-hover"
                  >
                    Load More · {(results.length - visible).toLocaleString("en-US")} Remaining
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ContentWidth>
  );
}
