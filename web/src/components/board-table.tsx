/*
  The ranked table — the home tabs, the leaderboard, the shelves and Ask all draw rows with this, so
  a reader who learned one table has learned them all (CP143).

  Rank · Score · Component · [Gained | Listed] · What it does · Evidence · Last commit · Install

  - Score: three decimals from the exact score (four where neighbours would tie), else "Unranked".
  - Evidence: the signals in words. Last commit: a <time datetime> on every row, with Stale after two
    years; a row with no commit date shows when it was listed instead, so every row still has a date.
  - Install: the full command, wrapped, never cut. Component names wrap at their hyphens.
  - Our own repositories carry an Ours label. A repository listed twice prints once.
  Below 640px each row stacks into a block (globals.css, .board-table), so a phone never scrolls
  sideways. No hooks here, so both server pages and the client Ask page can render it.
*/
import Link from "next/link";
import { DataTable, Th, clampWords } from "./data-table";
import { InstallSnippet } from "./install-snippet";
import { ScoreBadge } from "./score-badge";
import { SignalsRow, type SignalValues } from "./signals-row";
import { ago, int, shortDate } from "@/lib/format";

export interface RowView {
  key: string;
  rank: number | null;
  name: string;
  /** Internal detail route when the row has a type, else its source. */
  href: string | null;
  external: boolean;
  /** "mcp · github-vcs" */
  meta: string;
  desc: string;
  universal: number | null;
  exact: number | null;
  /** The printed score (ranked lists pass the 3–4 decimal text). */
  scoreText: string | null;
  evidence: number;
  signals: SignalValues;
  pushedAt: string | null;
  stale: boolean;
  listedAt: string | null;
  gained: number | null;
  ours: boolean;
  /** The feed that contributed the row, shown as a quiet provenance line. */
  contributedBy: string | null;
  /** The same repository's other listings, folded into this line. */
  alsoListedAs: { name: string; href: string | null }[];
}

export type ExtraColumn = "gained" | "listed" | null;

const CELL = "border-b border-line-subtle px-3 py-2.5 align-top";

export function BoardTable({
  label,
  rows,
  now,
  extra = null,
  fallbackDate = null,
  trendingSince = null,
  scoreSort = "descending",
}: {
  label: string;
  rows: readonly RowView[];
  /** Reference time for "3 days ago" — the render time on the server, Date.now() in the browser. */
  now: number;
  extra?: ExtraColumn;
  /** Date shown for a row with neither a commit nor a listing date (the catalog's own date). */
  fallbackDate?: string | null;
  trendingSince?: string | null;
  scoreSort?: "ascending" | "descending" | "none";
}) {
  return (
    <DataTable label={label} minWidthClass="min-w-[1100px]" fixed className="board-table">
      <thead>
        <tr>
          <Th align="right" className="w-[52px]">
            Rank
          </Th>
          <Th align="right" className="w-[86px]" sort={scoreSort}>
            Score
          </Th>
          <Th className="w-[210px]">Component</Th>
          {extra === "gained" && <Th className="w-[128px]">Gained</Th>}
          {extra === "listed" && <Th className="w-[112px]">Listed</Th>}
          <Th className="w-auto">What it does</Th>
          <Th className="w-[190px]">Evidence</Th>
          <Th className="w-[118px]">Last commit</Th>
          <Th className="w-[280px]">Install</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="transition-colors duration-150 ease-state hover:bg-raise-2">
            <td data-col="rank" className={`${CELL} text-right text-[12px] text-ink-faint`}>
              {row.rank != null && <data value={String(row.rank)}>{row.rank}</data>}
            </td>
            <td data-col="score" className={`${CELL} text-right`}>
              <ScoreBadge
                score={row.universal}
                evidence={row.evidence}
                display={row.scoreText}
                value={row.exact}
              />
            </td>
            <td data-col="name" className={CELL}>
              <NameCell row={row} />
            </td>
            {extra === "gained" && (
              <td data-col="gained" className={`${CELL} text-[12.5px] text-ink-body`}>
                {row.gained != null && (
                  <>
                    <data value={String(row.gained)} className="font-semibold text-ink-hi">
                      +{int(row.gained)}
                    </data>{" "}
                    {row.gained === 1 ? "mention" : "mentions"}
                    {trendingSince && (
                      <span className="block text-[11.5px] text-ink-faint">
                        since <time dateTime={trendingSince}>{shortDate(trendingSince)}</time>
                      </span>
                    )}
                  </>
                )}
              </td>
            )}
            {extra === "listed" && (
              <td data-col="listed" className={`${CELL} text-[12.5px] text-ink-body`}>
                {row.listedAt && <time dateTime={row.listedAt}>{shortDate(row.listedAt)}</time>}
              </td>
            )}
            <td data-col="desc" className={`${CELL} text-[12.5px] leading-snug text-ink-muted`}>
              {clampWords(row.desc, 150) || <span className="text-ink-faint">No description</span>}
            </td>
            <td data-col="evidence" className={CELL}>
              <SignalsRow signals={row.signals} />
            </td>
            <td data-col="when" className={CELL}>
              <LastCommit row={row} now={now} fallbackDate={fallbackDate} />
            </td>
            <td data-col="install" className={CELL}>
              <InstallSnippet name={row.name} />
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}

function NameCell({ row }: { row: RowView }) {
  const cls =
    "cursor-pointer break-words font-medium text-ink-hi transition-colors duration-150 ease-state hover:text-accent-hover";
  return (
    <>
      <span className="text-[13.5px] leading-snug">
        {row.href == null ? (
          <span className="break-words font-medium text-ink-hi">{row.name}</span>
        ) : row.external ? (
          <a href={row.href} target="_blank" rel="noreferrer noopener" className={cls}>
            {row.name}
          </a>
        ) : (
          <Link href={row.href} className={cls}>
            {row.name}
          </Link>
        )}
        {row.ours && <OursTag />}
      </span>
      <span className="mt-0.5 block text-[12px] text-ink-muted">{row.meta}</span>
      {row.contributedBy && (
        <span className="mt-0.5 block text-[11.5px] text-ink-faint">Contributed by {row.contributedBy}</span>
      )}
      {row.alsoListedAs.length > 0 && (
        <span className="mt-0.5 block text-[11.5px] text-ink-faint">
          also listed as{" "}
          {row.alsoListedAs.map((t, i) => (
            <span key={t.name}>
              {i > 0 && ", "}
              {t.href ? (
                <Link href={t.href} className="cursor-pointer underline underline-offset-2 hover:text-accent-hover">
                  {t.name}
                </Link>
              ) : (
                t.name
              )}
            </span>
          ))}
        </span>
      )}
    </>
  );
}

/** Our own repositories are marked, never hidden and never boosted. */
export function OursTag() {
  return (
    <span className="ml-1.5 inline-block whitespace-nowrap rounded border border-accent-line px-1 align-[1px] text-[11px] font-medium leading-[16px] text-accent-hover">
      Ours
    </span>
  );
}

export function StaleTag() {
  return (
    <span className="ml-1.5 inline-block whitespace-nowrap rounded border border-line px-1 align-[1px] text-[11px] font-medium leading-[16px] text-warn">
      Stale
    </span>
  );
}

function LastCommit({
  row,
  now,
  fallbackDate,
}: {
  row: RowView;
  now: number;
  fallbackDate: string | null;
}) {
  if (row.pushedAt) {
    return (
      <span className="text-[12.5px] text-ink-body">
        <time dateTime={row.pushedAt}>{ago(row.pushedAt, now)}</time>
        {row.stale && <StaleTag />}
      </span>
    );
  }
  const listed = row.listedAt ?? fallbackDate;
  return (
    <span className="text-[12px] leading-snug text-ink-faint">
      No commit date
      {listed && (
        <span className="block">
          listed <time dateTime={listed}>{shortDate(listed)}</time>
        </span>
      )}
    </span>
  );
}
