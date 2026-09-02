import { Td, Tr, clampWords } from "./data-table";
import { ScoreBadge } from "./score-badge";
import { SignalsRow, type SignalValues } from "./signals-row";
import { InstallSnippet } from "./install-snippet";

/*
  One ranked-component row — Rank · Score · Component · Description · Signals ·
  Type · Domain · Install. Identical shape on the Leaderboard and on Ask's
  default "Top Ranked" table (design/BRIEF.md — Ask's empty state renders "the
  same DataTable"), so it lives here once rather than twice.
*/

export interface RankedRowData {
  name: string;
  component: string;
  domain: string;
  url: string | null;
  universal: number | null;
  signals: SignalValues;
  desc: string;
}

/** Count of independent, non-null signals — identical to lib/rank.mjs's `scores.evidence`
 *  (same four axes, same null-check). Derived here because /api/rank's flat JSON response
 *  doesn't carry `evidence` on its own; the two counts are mathematically the same. */
export function evidenceOf(signals: SignalValues): number {
  return [signals.tested, signals.mentions, signals.stars, signals.usage].filter((v) => v != null).length;
}

export function RankedRow({ row, rank }: { row: RankedRowData; rank: number }) {
  return (
    <Tr>
      <Td align="right" className="font-mono text-[12px] text-ink-faint">
        <data value={String(rank)}>{rank}</data>
      </Td>
      <Td align="right">
        <ScoreBadge score={row.universal} evidence={evidenceOf(row.signals)} />
      </Td>
      <Td truncate className="font-medium text-ink-hi">
        {row.url ? (
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer transition-colors duration-150 ease-state hover:text-accent-hover"
          >
            {row.name}
          </a>
        ) : (
          row.name
        )}
      </Td>
      <Td truncate className="text-[12px] text-ink-muted">
        {clampWords(row.desc, 72)}
      </Td>
      <Td>
        <SignalsRow signals={row.signals} />
      </Td>
      <Td className="text-[12px] text-ink-muted">{row.component}</Td>
      <Td className="whitespace-nowrap text-[12px] text-ink-muted">{row.domain}</Td>
      <Td>
        <InstallSnippet name={row.name} />
      </Td>
    </Tr>
  );
}

/** Skeleton at final row height (40px, matching Td) — no layout shift once data lands.
 *  `cols` must match the real table's column count (8 for the RankedRow shape above). */
export function RankedRowSkeleton({ cols = 8, rows = 8 }: { cols?: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} aria-hidden className="h-10 border-b border-line-subtle">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-3 py-2">
              <span className="block h-3 w-full max-w-[160px] animate-pulse rounded bg-raise-3" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
