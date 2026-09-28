// Components — the catalog organised by the harness itself.
//
// Eleven canonical components (energy's HARNESS-CHECKLIST-2026, mapped in the CP137
// amendment) and the Browser shelf (CP147), each a card carrying its live counts and its Pick.
// Twelve cards fill 4, 3, 2 and 1 columns evenly, so no row is left with an empty cell (CP138 T23).
// The two cross-cutting properties take the full row below as badges, not component cards,
// because a harness IS self-improving the way it is fast; it does not hold a "self-improvement"
// component.
//
// Counts come from lib/rank.mjs computeRows via src/lib/canon.ts — the same engine the
// home page, the leaderboard and /api/rank use — so this page can never disagree with them.
import type { Metadata } from "next";
import Link from "next/link";
import { ContentWidth } from "@/components/data-table";
import {
  CANON_SLUGS,
  PROPERTIES,
  allRows,
  resolvedPicksFor,
  rowsFor,
  stackFor,
  statsFor,
} from "@/lib/canon";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Components · Armory",
  description: "The catalog organized by the 11 components of an agent harness, and a Browser shelf.",
};

export default function ComponentsPage() {
  const total = allRows().length;

  const cards = CANON_SLUGS.map((slug) => {
    const entry = stackFor(slug);
    const rows = rowsFor(slug);
    const stats = statsFor(slug, rows);
    const picks = resolvedPicksFor(slug);
    return {
      slug,
      label: entry?.label ?? slug,
      oneLine: entry?.oneLine ?? "",
      stats,
      topPick: picks[0] ?? null,
    };
  });

  return (
    <div>
      <section className="border-b border-line-subtle">
        <ContentWidth className="pb-6 pt-8">
          <h1 className="text-[27px] font-semibold leading-none tracking-[-0.01em] text-ink-hi">
            Components
          </h1>
          {/* Labels, one word per thing (CP147): "Listed", as on every card below; Stack is in the nav.
              The Browser shelf (PR #46) sits beside the eleven harness components, so the count says Shelves. */}
          <p className="mt-3 text-[14px] leading-normal text-ink-muted">
            <data value={String(cards.length)} className="font-semibold tabular-nums text-ink-hi">
              {cards.length}
            </data>{" "}
            Shelves ·{" "}
            <data value={String(total)} className="font-semibold tabular-nums text-ink-hi">
              {total.toLocaleString("en-US")}
            </data>{" "}
            Listed
          </p>
        </ContentWidth>
      </section>

      <section>
        <ContentWidth className="pb-16 pt-6">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/c/${c.slug}`}
                  className="flex h-full cursor-pointer flex-col gap-3 rounded-xl border border-line-subtle bg-raise-1 p-4 transition-colors duration-150 ease-state hover:border-accent-line hover:bg-raise-2"
                >
                  <div>
                    <h2 className="text-[15px] font-semibold leading-none text-ink-hi">{c.label}</h2>
                    <p className="mt-1.5 text-[12.5px] leading-normal text-ink-muted">{c.oneLine}</p>
                  </div>

                  <dl className="mt-auto flex flex-wrap items-baseline gap-x-5 gap-y-2 font-sans text-[12px] tabular-nums">
                    <CardStat label="Listed">
                      <data value={String(c.stats.indexed)}>
                        {c.stats.indexed.toLocaleString("en-US")}
                      </data>
                    </CardStat>
                    <CardStat label="Ranked">
                      <data value={String(c.stats.rankedPct)}>{c.stats.rankedPct.toFixed(1)}%</data>
                    </CardStat>
                    <CardStat label="Top Score">
                      {c.stats.topScore == null ? (
                        <span className="text-score-none">&mdash;</span>
                      ) : (
                        <data value={String(c.stats.topScore)}>{c.stats.topScore.toFixed(1)}</data>
                      )}
                    </CardStat>
                  </dl>

                  <div className="border-t border-line-subtle pt-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                      Pick
                    </span>{" "}
                    <span className="font-sans text-[12px] text-ink-body">
                      {c.topPick ? c.topPick.row?.title || c.topPick.name : "—"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}

            {/* Cross-cutting: badges, never shelves. Stated so the missing component cards read as a
                deliberate boundary rather than a gap in the taxonomy. */}
            <li className="flex flex-col gap-3 rounded-xl border border-dashed border-line p-4 sm:col-span-full">
              <div>
                <h2 className="text-[15px] font-semibold leading-none text-ink-hi">Properties</h2>
                <p className="mt-1.5 text-[12.5px] leading-normal text-ink-muted">
                  Qualities of the whole harness, not components
                </p>
              </div>
              <ul className="flex flex-col gap-2.5">
                {PROPERTIES.map((p) => (
                  <li key={p.label}>
                    <span className="inline-flex items-center rounded-md border border-line px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                      {p.label}
                    </span>
                    <p className="mt-1 text-[12.5px] text-ink-muted">{p.note}</p>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </ContentWidth>
      </section>
    </div>
  );
}

/** Compact label + value pair inside a card. Values stay machine-readable. */
function CardStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
        {label}
      </dt>
      <dd className="text-ink-body">{children}</dd>
    </div>
  );
}
