// Shared blocks for the component pages (/c, /c/[component], /stack).
//
// Extracted so the three routes render one Pick block and one shelf table rather than
// three that drift. Foundation components only (DataTable/Th/Td/Tr, ScoreBadge,
// SignalsRow, InstallSnippet); tokenised classes only — no inline var(--…) objects, no
// oklch() literals. Every number ships as a final <data value>; nothing animates.
import Link from "next/link";
import { DataTable, Td, Th, Tr, clampWords } from "@/components/data-table";
import { InstallSnippet } from "@/components/install-snippet";
import { ScoreBadge } from "@/components/score-badge";
import { SignalsRow } from "@/components/signals-row";
import type { CanonRow, CanonStats, ResolvedPick } from "@/lib/canon";

const int = (n: number): string => n.toLocaleString("en-US");

/** Label over a final, machine-readable value. Mirrors the home band's Stat. */
export function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-[18px] leading-none tabular-nums text-ink-hi">
        {children}
      </dd>
    </div>
  );
}

/** Indexed · Ranked · Top Score. Percentages and scores are <data>, never prose. */
export function ShelfStats({ stats }: { stats: CanonStats }) {
  return (
    <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
      <Stat label="Indexed">
        <data value={String(stats.indexed)}>{int(stats.indexed)}</data>
      </Stat>
      <Stat label="Ranked">
        <data value={String(stats.rankedPct)}>{stats.rankedPct.toFixed(1)}%</data>
      </Stat>
      <Stat label="Top Score">
        {stats.topScore == null ? (
          <span className="text-score-none">&mdash;</span>
        ) : (
          <data value={String(stats.topScore)}>{stats.topScore.toFixed(1)}</data>
        )}
      </Stat>
    </dl>
  );
}

/** A pick with no catalog row. Real text in the DOM, not a tooltip. */
export function NotIndexedTag() {
  return (
    <span className="inline-flex items-center rounded-md border border-line px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
      Not Indexed
    </span>
  );
}

/** The pick's name — an internal detail link when it resolves, else the source. */
export function PickName({ pick }: { pick: ResolvedPick }) {
  const className =
    "cursor-pointer font-medium text-ink-hi transition-colors duration-150 ease-state hover:text-accent-hover";
  if (pick.href) {
    return (
      <Link href={pick.href} className={className}>
        {pick.name}
      </Link>
    );
  }
  return (
    <a href={pick.url} target="_blank" rel="noreferrer noopener" className={className}>
      {pick.name}
    </a>
  );
}

/**
 * The Pick block: 1–3 recommended components for a shelf. Score and Signals are read
 * LIVE from the catalog (src/data/stack.json stores no number), so a re-rank moves the
 * pick and the table below it together. An unindexed pick states so and links its source.
 */
export function PickList({ picks }: { picks: ResolvedPick[] }) {
  if (picks.length === 0) {
    return (
      <div className="rounded-xl border border-line-subtle bg-raise-1 px-5 py-6">
        <p className="text-[14px] font-semibold text-ink-hi">No Pick</p>
        <p className="mt-1 text-[13px] text-ink-muted">Not recorded in stack.json</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {picks.map((pick) => (
        <li
          key={pick.name}
          className="flex min-w-0 flex-col gap-2.5 rounded-xl border border-line-subtle bg-raise-1 p-4 transition-colors duration-150 ease-state hover:border-line"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="min-w-0 break-words text-[14px] leading-tight">
              <PickName pick={pick} />
            </span>
            {pick.row ? (
              <ScoreBadge score={pick.row.scores.universal} evidence={pick.row.scores.evidence} />
            ) : (
              <NotIndexedTag />
            )}
          </div>

          <p className="text-[12.5px] leading-normal text-ink-muted">{pick.why}</p>

          {pick.row ? (
            <>
              <SignalsRow signals={pick.row.signals} />
              <div className="min-w-0">
                <InstallSnippet name={pick.row.name} />
              </div>
            </>
          ) : (
            <a
              href={pick.url}
              target="_blank"
              rel="noreferrer noopener"
              className="cursor-pointer break-all font-mono text-[11px] text-accent-hover underline underline-offset-4"
            >
              {pick.url}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * The shelf's ranked rows. Same eight columns as the home page and the leaderboard, in
 * the same order, so a reader who learned one table has learned all three.
 */
export function ShelfTable({ label, rows }: { label: string; rows: CanonRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-line-subtle bg-raise-1 px-5 py-8">
        <p className="text-[14px] font-semibold text-ink-hi">Not Indexed</p>
        <p className="mt-1 text-[13px] text-ink-muted">No component here carries a measured signal</p>
        <Link
          href="/status"
          className="mt-3 inline-block cursor-pointer text-[13px] font-medium text-accent-hover underline underline-offset-4"
        >
          Status
        </Link>
      </div>
    );
  }

  return (
    <DataTable label={label} minWidthClass="min-w-[1180px]" fixed>
      <thead>
        <tr>
          <Th align="right" className="w-[56px]">
            Rank
          </Th>
          <Th align="right" className="w-[76px]" sort="descending">
            Score
          </Th>
          <Th className="w-[200px]">Component</Th>
          <Th className="w-auto">Description</Th>
          <Th className="w-[300px]">Signals</Th>
          <Th className="w-[76px]">Type</Th>
          <Th className="w-[108px]">Domain</Th>
          <Th className="w-[280px]">Install</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <Tr key={`${row.type}/${row.name}`}>
            <Td align="right" className="font-mono text-[12px] text-ink-faint">
              <data value={String(i + 1)}>{i + 1}</data>
            </Td>
            <Td align="right">
              <ScoreBadge score={row.scores.universal} evidence={row.scores.evidence} />
            </Td>
            <Td truncate className="font-medium text-ink-hi">
              {row.type ? (
                <Link
                  href={`/e/${encodeURIComponent(row.type)}/${encodeURIComponent(row.name)}`}
                  className="cursor-pointer transition-colors duration-150 ease-state hover:text-accent-hover"
                >
                  {row.name}
                </Link>
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
        ))}
      </tbody>
    </DataTable>
  );
}
