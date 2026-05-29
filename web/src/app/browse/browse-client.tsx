"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Component, ComponentType } from "@/lib/types";
import { CATEGORIES, CATEGORY_LABEL, WEDGE_TYPES } from "@/lib/types";
import { filterAndRank } from "@/lib/search";
import { ComponentCard } from "@/components/component-card";
import { EmptyState } from "@/components/empty-state";
import { SearchIcon, TypeIcon } from "@/components/icons";

const PAGE = 24; // cards rendered per "page" — never emit thousands of DOM nodes.

/*
  Interactive browse: client-side ranking + a facet rail + windowed pagination.
  PERFORMANCE: results are sliced to `visible` cards and grown by an
  IntersectionObserver sentinel ("load more"), so the DOM holds at most ~PAGE×N
  cards regardless of catalog size (thousands of components stay smooth). Search is
  debounced so each keystroke doesn't re-rank the whole list synchronously.
*/
export function BrowseClient({
  components,
  countsByType,
  initialType,
}: {
  components: Component[];
  countsByType: Record<ComponentType, number>;
  initialType: ComponentType | null;
}) {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<ComponentType>>(() =>
    initialType ? new Set([initialType]) : new Set(),
  );
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

  const catalogEmpty = components.length === 0;

  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-24 pt-28">
      <header className="mb-8">
        <h1 className="font-serif text-[clamp(2.5rem,5vw,3.75rem)] leading-none tracking-[-0.02em] text-ink-hi">
          Browse the brain.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-ink-body">
          Ranked over name, description, and tags. Filter by region. Everything is
          keyboard-accessible and recallable by an agent.
        </p>
      </header>

      {/* Double-Bezel search bar (sticky under the floating nav) */}
      <div className="sticky top-20 z-20 mb-6 rounded-2xl bg-raise-1/80 p-1.5 ring-1 ring-line-subtle backdrop-blur-xl">
        <div className="relative flex items-center rounded-[calc(1.25rem-0.375rem)] bg-raise-2 shadow-[inset_0_1px_0_oklch(100%_0_0/0.06)]">
          <span className="pointer-events-none absolute left-4 text-ink-muted">
            <SearchIcon size={18} />
          </span>
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="browser automation mcp…"
            aria-label="Search components"
            className="w-full cursor-text bg-transparent py-3.5 pl-11 pr-24 font-mono text-base text-ink-hi placeholder:text-ink-muted focus:outline-none"
          />
          <kbd className="pointer-events-none absolute right-4 hidden items-center gap-1 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-ink-muted sm:flex">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
        {/* Facet rail */}
        <aside className="lg:sticky lg:top-44 lg:self-start">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
              Regions
            </span>
            {activeTypes.size > 0 && (
              <button
                type="button"
                onClick={() => setActiveTypes(new Set())}
                className="cursor-pointer text-[11px] text-ink-muted transition-colors hover:text-accent-hover"
              >
                clear
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-row flex-wrap gap-1.5 lg:flex-col lg:gap-0 lg:divide-y lg:divide-line-subtle">
            {CATEGORIES.map((cat) => {
              const count = countsByType[cat.type] ?? 0;
              const active = activeTypes.has(cat.type);
              const wedge = WEDGE_TYPES.has(cat.type);
              return (
                <button
                  key={cat.type}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleType(cat.type)}
                  className={`group flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors lg:rounded-none ${
                    active
                      ? "text-accent-hover"
                      : "text-ink-body hover:text-ink-hi"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                      active
                        ? "bg-accent"
                        : "bg-line-strong group-hover:bg-ink-muted"
                    }`}
                  />
                  <TypeIcon
                    type={cat.type}
                    size={14}
                    className={
                      active || wedge ? "text-accent" : "text-ink-muted"
                    }
                  />
                  <span className="flex-1">{cat.label}</span>
                  <span className="tabular-nums text-[11px] text-ink-muted">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Results */}
        <div>
          <p
            className="mb-4 font-mono text-[13px] text-ink-muted"
            aria-live="polite"
          >
            <span className="tabular-nums text-ink-hi">{results.length}</span>{" "}
            result{results.length === 1 ? "" : "s"}
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
                for <span className="text-ink-body">“{query}”</span>
              </>
            )}
          </p>

          {catalogEmpty ? (
            <EmptyState
              title="The brain is still forming."
              hint="No components indexed yet. As components land in brain/components/, they appear here automatically."
            />
          ) : results.length === 0 ? (
            <EmptyState
              title="No component recalled."
              hint="Try broader terms, or clear the region filters."
              suggestions={["mcp", "memory", "eval", "browser"]}
              onSuggest={(t) => {
                setInput(t);
                setActiveTypes(new Set());
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
                {shown.map((component) => (
                  <ComponentCard
                    key={`${component.type}/${component.name}`}
                    component={component}
                  />
                ))}
              </div>
              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="mt-8 flex justify-center"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setVisible((v) => Math.min(v + PAGE, results.length))
                    }
                    className="cursor-pointer rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-body transition-colors hover:border-accent-line hover:text-accent-hover"
                  >
                    Load more · {results.length - visible} remaining
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
