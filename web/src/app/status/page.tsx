// /status — the freshness & coverage report for the index (a technical-program view).
// Data (the memoized catalog.json read + formatters) lives in ./stats.ts to keep this
// file under the 300-line cap. Server component, static — the 38MB parse happens once
// at build. Tokenised classes only (design/BRIEF.md §6).
import type { Metadata } from "next";
import Link from "next/link";
import { ContentWidth, DataTable, Td, Th, Tr } from "@/components/data-table";
import { ArrowLeftIcon } from "@/components/icons";
import { longDate, monthLabel, n, pct, stats } from "./stats";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Status · Armory",
  description:
    "Freshness and signal coverage for the Armory index — how many components are catalogued, how many carry each ranking signal, and when the crawl last confirmed them.",
};

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
      <div className="mt-2 font-mono text-[30px] font-semibold leading-none tracking-[-0.01em] tabular-nums text-ink-hi">
        {valueDateTime ? <time dateTime={valueDateTime}>{value}</time> : value}
      </div>
      <div className="mt-2 text-[13px] text-ink-muted">{sub}</div>
    </Card>
  );
}

// ---- the page --------------------------------------------------------------------------
export default function Status() {
  const s = stats();

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
        Coverage and freshness for every catalogued component
      </p>
      <p className="mt-3 max-w-[68ch] text-[13px] leading-[1.6] text-ink-muted">
        Read live from{" "}
        <code className="rounded border border-line bg-raise-1 px-1.5 py-0.5 font-mono text-[12px] text-ink-body">
          catalog.json
        </code>
        , the one version-controlled source every surface reads.
      </p>

      {/* Hero: one featured total, then three supporting stats — asymmetric, not a 4-card wall. */}
      <section className="mt-8">
        <Card className="flex flex-wrap items-baseline justify-between gap-7">
          <div>
            <Eyebrow>Components</Eyebrow>
            <data value={String(s.total)} className="mt-2 block font-mono text-[56px] font-semibold leading-none tracking-[-0.01em] tabular-nums text-ink-hi">
              {n(s.total)}
            </data>
          </div>
          <p className="m-0 max-w-[42ch] text-[15px] leading-[1.6] text-ink-body">
            Every catalogued building block — MCPs, skills, hooks, sub-agents, rules, evals,
            infrastructure, and the workflows that compose them — drawn from{" "}
            <strong className="font-semibold text-ink-hi">
              <data value={String(s.sources)}>{n(s.sources)}</data>
            </strong>{" "}
            distinct source repositories. New tools arrive only as additive pull requests.
          </p>
        </Card>

        <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <StatCard
            label="Coverage"
            value={n(s.anySignal)}
            sub={`${pct(s.anySignal, s.total)} of the index carries at least one signal`}
          />
          <StatCard
            label="Updated"
            value={s.validAsOf ? monthLabel(s.validAsOf) : "—"}
            valueDateTime={s.validAsOf ?? undefined}
            sub={`Last confirmed by the crawl · about ${s.monthsOld} month${s.monthsOld === 1 ? "" : "s"} ago`}
          />
          <StatCard label="Tested" value={n(s.tested)} sub="Installed and executed directly" />
        </div>
      </section>

      {/* Signal coverage */}
      <section className="mt-12">
        <Eyebrow>Signal Coverage</Eyebrow>
        <h2 className="mt-1.5 text-[22px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink-hi">
          What each component is scored on
        </h2>
        <p className="mt-2 max-w-[68ch] text-[15px] leading-[1.6] text-ink-body">
          Each signal is real or absent, never invented. A component is ranked on whatever it
          actually has, so most of the index is sparse by design. Coverage is the share of all{" "}
          <data value={String(s.total)}>{n(s.total)}</data> components that carry each one.
        </p>

        <div className="mt-4">
          <DataTable label="Signal Coverage" minWidthClass="min-w-[480px]">
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
              <Tr>
                <Td>
                  <span className="block font-medium text-ink-hi">Stars</span>
                  <span className="block text-[12px] text-ink-muted">
                    GitHub star count, never conflated with usage
                  </span>
                </Td>
                <Td align="right">
                  <data value={String(s.stars)} className="font-mono text-[13px] tabular-nums text-ink-hi">
                    {n(s.stars)}
                  </data>
                </Td>
                <Td align="right" className="font-mono text-[12px] tabular-nums text-ink-muted">
                  {pct(s.stars, s.total)}
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <span className="block font-medium text-ink-hi">Tested</span>
                  <span className="block text-[12px] text-ink-muted">Installed and executed directly</span>
                </Td>
                <Td align="right">
                  <data value={String(s.tested)} className="font-mono text-[13px] tabular-nums text-ink-hi">
                    {n(s.tested)}
                  </data>
                </Td>
                <Td align="right" className="font-mono text-[12px] tabular-nums text-ink-muted">
                  {pct(s.tested, s.total)}
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <span className="block font-medium text-ink-hi">Mentions</span>
                  <span className="block text-[12px] text-ink-muted">How often practitioners reference it</span>
                </Td>
                <Td align="right">
                  <data value={String(s.mentions)} className="font-mono text-[13px] tabular-nums text-ink-hi">
                    {n(s.mentions)}
                  </data>
                </Td>
                <Td align="right" className="font-mono text-[12px] tabular-nums text-ink-muted">
                  {pct(s.mentions, s.total)}
                </Td>
              </Tr>
            </tbody>
          </DataTable>
        </div>

        <p className="mt-3 max-w-[68ch] text-[13px] leading-[1.6] text-ink-muted">
          <data value={String(s.anySignal)}>{n(s.anySignal)}</data> components (
          {pct(s.anySignal, s.total)}) carry at least one signal; the remaining{" "}
          <data value={String(s.total - s.anySignal)}>{n(s.total - s.anySignal)}</data> are
          unranked rather than faked to the top.{" "}
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
          Valid as of {s.validAsOf ? monthLabel(s.validAsOf) : "—"}
        </h2>
        <p className="mt-2 max-w-[68ch] text-[15px] leading-[1.6] text-ink-body">
          When the crawl last confirmed each component, grouped by month. The base index was
          gathered in a single sweep
          {s.sweptFrom && s.sweptTo ? (
            <>
              {" "}
              (<time dateTime={s.sweptFrom}>{longDate(s.sweptFrom)}</time> →{" "}
              <time dateTime={s.sweptTo}>{longDate(s.sweptTo)}</time>)
            </>
          ) : null}
          , so nearly every record shares one timestamp — an honest picture of a one-shot crawl.
        </p>

        <div className="mt-4">
          <DataTable label="Freshness by Month" minWidthClass="min-w-[480px]">
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
                  <Td className={`text-[12px] ${m.key === "(none)" ? "text-ink-faint" : "text-ink-muted"}`}>
                    {m.key === "(none)" ? "Not Crawled" : "Confirmed"}
                  </Td>
                  <Td align="right">
                    <data value={String(m.count)} className="font-mono text-[13px] tabular-nums text-ink-hi">
                      {n(m.count)}
                    </data>
                  </Td>
                  <Td align="right" className="font-mono text-[12px] tabular-nums text-ink-muted">
                    {pct(m.count, s.total)}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </DataTable>
        </div>
      </section>

      {/* The honest note */}
      <section className="mt-8">
        <div className="rounded-2xl border border-accent-line bg-accent-quiet p-5">
          <Eyebrow>The Honest State</Eyebrow>
          <p className="mt-2 max-w-[74ch] text-[15px] leading-[1.7] text-ink-body">
            The base crawl is about {s.monthsOld} month{s.monthsOld === 1 ? "" : "s"} old —
            everything here was last confirmed in{" "}
            {s.validAsOf ? monthLabel(s.validAsOf) : "the initial sweep"}. Star counts drift,
            repos move, new tools ship every week. A proactive crawler keeps the index current by
            re-confirming existing components and pulling in new ones on a schedule; every row
            links to its source for direct verification.
          </p>
        </div>
      </section>
    </ContentWidth>
  );
}
