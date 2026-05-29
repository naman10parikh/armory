"use client";

import { useState } from "react";
import type { GraphData } from "@/lib/graph";
import { CATEGORIES, TYPE_HUE, type ComponentType } from "@/lib/types";
import { SynapseGraph } from "@/components/synapse-graph";
import { SearchIcon } from "@/components/icons";

/*
  The full synapse-graph surface. The graph data is already SAMPLED on the server
  (bounded node count), so this stays smooth at any catalog size. Search dims
  non-matching nodes live; the legend maps node colour → category.
*/
export function GraphClient({
  data,
  presentTypes,
}: {
  data: GraphData;
  presentTypes: ComponentType[];
}) {
  const [query, setQuery] = useState("");

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-16 pt-28">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
            the brain, mapped
          </span>
          <h1 className="mt-2 font-serif text-[clamp(2.25rem,5vw,3.5rem)] leading-none tracking-[-0.02em] text-ink-hi">
            Synapse graph.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ink-body">
            Each node is an component; each edge is a{" "}
            <span className="font-mono text-accent-hover">related[]</span>{" "}
            synapse. Hover to light up a neighbourhood. Click to recall it.
          </p>
        </div>

        <div className="relative w-full max-w-xs rounded-xl bg-raise-1 p-1 ring-1 ring-line-subtle">
          <div className="relative flex items-center rounded-lg bg-raise-2">
            <span className="pointer-events-none absolute left-3 text-ink-muted">
              <SearchIcon size={16} />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="dim to a term…"
              aria-label="Filter the graph"
              className="w-full cursor-text bg-transparent py-2.5 pl-10 pr-3 font-mono text-sm text-ink-hi placeholder:text-ink-muted focus:outline-none"
            />
          </div>
        </div>
      </header>

      {/* The canvas */}
      <div className="relative overflow-hidden rounded-2xl bg-raise-1 p-1.5 ring-1 ring-line-subtle">
        <div className="rounded-[calc(1.25rem-0.375rem)] bg-base/40">
          {data.nodes.length > 0 ? (
            <SynapseGraph
              data={data}
              query={query}
              className="h-[68vh] min-h-[480px] w-full"
            />
          ) : (
            <div className="flex h-[68vh] min-h-[480px] items-center justify-center text-sm text-ink-muted">
              The graph forms as components are indexed.
            </div>
          )}
        </div>
      </div>

      {/* Legend + perf line */}
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {CATEGORIES.filter((c) => presentTypes.includes(c.type)).map((c) => (
            <span
              key={c.type}
              className="inline-flex items-center gap-1.5 text-[11px] text-ink-muted"
            >
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: TYPE_HUE[c.type] }}
              />
              {c.label}
            </span>
          ))}
        </div>
        <p className="font-mono text-[11px] text-ink-muted">
          {data.sampled ? (
            <>
              showing{" "}
              <span className="tabular-nums text-ink-body">
                {data.nodes.length}
              </span>{" "}
              of{" "}
              <span className="tabular-nums text-ink-body">
                {data.totalNodes}
              </span>{" "}
              components · top by synapse degree
            </>
          ) : (
            <>
              <span className="tabular-nums text-ink-body">
                {data.nodes.length}
              </span>{" "}
              components · {data.edges.length} synapses
            </>
          )}
        </p>
      </div>
    </div>
  );
}
