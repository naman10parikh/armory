// /status — the freshness & coverage report for the index (a technical-program view).
// Data (the memoized catalog.json read + formatters) lives in ./stats.ts to keep this
// file under the 300-line cap. Server component, static — the 38MB parse happens once
// at build. Tokenised classes only (design/BRIEF.md §6).
import type { Metadata } from "next";
import Link from "next/link";
import { ContentWidth, DataTable, Td, Th, Tr } from "@/components/data-table";
import { ArrowLeftIcon } from "@/components/icons";
import { githubReadText } from "@/lib/format";
import { boardMeta } from "@/lib/rows";
import { longDate, monthLabel, n, pct, stats, type SignalKey } from "./stats";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Status · Armory",
  description:
    "Freshness and signal coverage for the Armory index — how many components are cataloged, how many carry each ranking signal, and when the crawl last confirmed them.",
};

// The signals in the coverage table, as the engine scores them (lib/rank.mjs), with what each one is.
const SIGNAL_ROWS: readonly { key: SignalKey; label: string; note: string }[] = [
  { key: "stars", label: "Stars", note: "GitHub star count" },
  { key: "tested", label: "Tested", note: "Installed and executed directly" },
  { key: "mentions", label: "Mentions", note: "How often practitioners reference it" },
  { key: "forks", label: "Forks", note: "GitHub fork count" },
  { key: "usage", label: "Usage", note: "Registry install count" },
];

// ---- small building blocks --------------------------------------------------------------
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{children}</p>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-raise-1 p-5 ${className}`}>{children}</div>;
}

function StatCard({
  label,
  value,
  valueDateTime,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  valueDateTime?: string;
  sub: React.ReactNode;
}) {
  return (
    <Card>
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-2 font-sans text-[30px] font-semibold leading-none tracking-[-0.01em] tabular-nums text-ink-hi">
        {valueDateTime ? <time dateTime={valueDateTime}>{value}</time> : value}
      </div>
      <div className="mt-2 text-[13px] text-ink-muted">{sub}</div>
    </Card>
  );
}

// ---- the page --------------------------------------------------------------------------
export default function Status() {
  const s = stats();
  const meta = boardMeta();

  return (
    <ContentWidth className="pb-24 pt-8">
      <Link
        href="/leaderboard"
        className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-accent-hover transition-colors duration-150 ease-state hover:text-accent"
      >
        <ArrowLeftIcon size={14} />
        Leaderboard
      </Link>

      <h1 className="mt-3 text-[32px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink-hi">Status</h1>
      <p className="mt-2 max-w-[64ch] text-[16px] leading-[1.5] text-ink-body">
        Coverage and freshness of the catalog
      </p>
      <p className="mt-3 max-w-[68ch] text-[13px] leading-[1.6] text-ink-muted">
        Read from{" "}
        <code className="rounded border border-line bg-raise-1 px-1.5 py-0.5 font-sans text-[12px] text-ink-body">
          catalog.json
        </code>
        , the source every page uses.
      </p>

      {/* Hero: one featured total, then three supporting stats — asymmetric, not a 4-card wall. */}
      <section className="mt-8">
        <Card className="flex flex-wrap items-baseline justify-between gap-7">
          <div>
            <Eyebrow>Components</Eyebrow>
            <data value={String(s.total)} className="mt-2 block font-sans text-[56px] font-semibold leading-none tracking-[-0.01em] tabular-nums text-ink-hi">
              {n(s.total)}
            </data>
          </div>
          <p className="m-0 max-w-[42ch] text-[15px] leading-[1.6] text-ink-body">
            MCPs, skills, hooks, sub-agents, rules, evals, infrastructure and workflows, from{" "}
            <strong className="font-semibold text-ink-hi">
              <data value={String(s.sources)}>{n(s.sources)}</data>
            </strong>{" "}
            distinct source repositories.
          </p>
        </Card>

        <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <StatCard
            label="Coverage"
            value={n(s.ranked)}
            sub={`${pct(s.ranked, s.total)} of the catalog carries at least one signal`}
          />
          <StatCard
            label="Base Crawl"
            value={s.base ? monthLabel(s.base.key) : "—"}
            valueDateTime={s.base?.key}
            sub={
              s.newest
                ? `Newest confirmation ${monthLabel(s.newest.key)} (${n(s.newest.count)} rows)`
                : "No confirmation dates"
            }
          />
          <StatCard label="Tested" value={n(s.signals.tested)} sub="Installed and executed directly" />
          {meta.githubRead && (
            <StatCard
              label="GitHub Figures"
              value={githubReadText(meta.githubRead)}
              valueDateTime={meta.githubRead.since ?? meta.githubRead.latest}
              sub="Most repositories' stars, forks and last commit were read from GitHub on this date or later; a repository may have changed since"
            />
          )}
        </div>
      </section>

      {/* Signal coverage */}
      <section className="mt-12">
        <Eyebrow>Signal Coverage</Eyebrow>
        <h2 className="mt-1.5 text-[22px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink-hi">
          What each component is scored on
        </h2>
        <p className="mt-2 max-w-[68ch] text-[15px] leading-[1.6] text-ink-body">
          A component is ranked on the signals it has; most have none yet. Coverage is the share of all{" "}
          <data value={String(s.total)}>{n(s.total)}</data> components that carry each one.
        </p>

        <div className="mt-4">
          <DataTable label="Signal Coverage" minWidthClass="min-w-[480px]" className="card-table">
            <thead>
              <tr>
                <Th>Signal</Th>
                <Th align="right" className="w-[120px]">
                  Count
                </Th>
                <Th align="right" className="w-[100px]">
                  Share
                </Th>
              </tr>
            </thead>
            <tbody>
              {SIGNAL_ROWS.map((row) => (
                <Tr key={row.key}>
                  <Td>
                    <span className="block font-medium text-ink-hi">{row.label}</span>
                    <span className="block text-[12px] text-ink-muted">{row.note}</span>
                  </Td>
                  <Td align="right" label="Count">
                    <data value={String(s.signals[row.key])} className="font-sans text-[13px] tabular-nums text-ink-hi">
                      {n(s.signals[row.key])}
                    </data>
                  </Td>
                  <Td align="right" label="Share" className="font-sans text-[12px] tabular-nums text-ink-muted">
                    {pct(s.signals[row.key], s.total)}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </DataTable>
        </div>

        <p className="mt-3 max-w-[68ch] text-[13px] leading-[1.6] text-ink-muted">
          <data value={String(s.ranked)}>{n(s.ranked)}</data> components (
          {pct(s.ranked, s.total)}) carry at least one signal; the remaining{" "}
          <data value={String(s.total - s.ranked)}>{n(s.total - s.ranked)}</data> are unranked.{" "}
          <Link
            href="/formula"
            className="cursor-pointer font-medium text-accent-hover underline underline-offset-4"
          >
            Formula
          </Link>
        </p>
      </section>

      {/* Freshness */}
      <section className="mt-12">
        <Eyebrow>Freshness</Eyebrow>
        <h2 className="mt-1.5 text-[22px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink-hi">
          Last Confirmed by Month
        </h2>
        <p className="mt-2 max-w-[68ch] text-[15px] leading-[1.6] text-ink-body">
          {/* The dates run from the base crawl to the newest nightly confirmation, so they are a range,
              not one sweep (CP138 T51: the page said "a single sweep" up to September). */}
          When the crawl last confirmed each component, grouped by month
          {s.sweptFrom && s.sweptTo ? (
            <>
              , from <time dateTime={s.sweptFrom}>{longDate(s.sweptFrom)}</time> to{" "}
              <time dateTime={s.sweptTo}>{longDate(s.sweptTo)}</time>
            </>
          ) : null}
          .
        </p>

        <div className="mt-4">
          <DataTable label="Freshness by Month" minWidthClass="min-w-[480px]" className="card-table">
            <thead>
              <tr>
                <Th>Period</Th>
                <Th className="w-[140px]">Status</Th>
                <Th align="right" className="w-[120px]">
                  Count
                </Th>
                <Th align="right" className="w-[100px]">
                  Share
                </Th>
              </tr>
            </thead>
            <tbody>
              {s.months.map((m) => (
                <Tr key={m.key}>
                  <Td className="font-medium text-ink-hi">
                    {m.key === "(none)" ? "No Date" : <time dateTime={m.key}>{monthLabel(m.key)}</time>}
                  </Td>
                  <Td label="Status" className={`text-[12px] ${m.key === "(none)" ? "text-ink-faint" : "text-ink-muted"}`}>
                    {m.key === "(none)" ? "Not Crawled" : "Confirmed"}
                  </Td>
                  <Td align="right" label="Count">
                    <data value={String(m.count)} className="font-sans text-[13px] tabular-nums text-ink-hi">
                      {n(m.count)}
                    </data>
                  </Td>
                  <Td align="right" label="Share" className="font-sans text-[12px] tabular-nums text-ink-muted">
                    {pct(m.count, s.total)}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </DataTable>
        </div>

        {/* The home page's "listed this week" counts the day a row entered the catalog; this table counts
            the day its source was confirmed. Both are right; this says why they differ (CP138 T23). */}
        {meta.addedThisWeek != null && meta.addedThisWeekConfirmedEarlier != null && (
          <p className="mt-3 max-w-[68ch] text-[13px] leading-[1.6] text-ink-muted">
            <data value={String(meta.addedThisWeek)}>{n(meta.addedThisWeek)}</data> components entered the
            catalog in the last week, the home page&apos;s &ldquo;listed this week&rdquo;.{" "}
            <data value={String(meta.addedThisWeekConfirmedEarlier)}>{n(meta.addedThisWeekConfirmedEarlier)}</data>{" "}
            of them are counted above under an earlier month, because a component keeps the date its source was
            last confirmed, not the day it was added.
          </p>
        )}
      </section>

      {/* Crawl age: when the base crawl ran, from the table above (CP138 T51) */}
      <section className="mt-8">
        <div className="rounded-2xl border border-accent-line bg-accent-quiet p-5">
          <Eyebrow>Crawl Age</Eyebrow>
          <p className="mt-2 max-w-[74ch] text-[15px] leading-[1.7] text-ink-body">
            {s.base
              ? `The base crawl ran in ${monthLabel(s.base.key)}; ${pct(s.base.count, s.total)} of rows were last confirmed then. `
              : ""}
            Star counts drift, repos move, new tools ship every week. New components arrive nightly; the
            table shows when each row was last confirmed. Every row links to its source.
          </p>
        </div>
      </section>
    </ContentWidth>
  );
}
