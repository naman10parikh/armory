// One canonical harness component — its Pick, then its ranked rows.
//
// Eleven static routes (generateStaticParams + dynamicParams=false), so an unknown slug
// 404s rather than rendering an empty shelf. Rows and counts come from lib/rank.mjs
// computeRows via src/lib/canon.ts — the same engine the home page, the leaderboard and
// /api/rank use — and the Pick's Score is resolved from that same pass, so the block at
// the top and the table beneath it can never quote different numbers.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentWidth } from "@/components/data-table";
import { CliNote, HarnessSelector } from "@/components/install-snippet";
import { PickList, ShelfStats, ShelfTable } from "@/components/component-page";
import { CANON_SLUGS, PLANE, resolvedPicksFor, rowsFor, stackFor, statsFor, topRankedFor } from "@/lib/canon";

export const runtime = "nodejs";
export const dynamicParams = false;

const TOP_N = 20;

interface RouteParams {
  component: string;
}

export function generateStaticParams(): RouteParams[] {
  return CANON_SLUGS.map((component) => ({ component }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { component } = await params;
  const entry = stackFor(component);
  if (!entry) return { title: "Not Found · Armory" };
  return { title: `${entry.label} · Armory`, description: entry.oneLine };
}

// The capability-plane slot a shelf's pick needs an account on (CP138 T41): the /stack "Accounts the agent
// acts through" line, shown on the shelf it serves.
const PLANE_SLOT: Readonly<Record<string, string>> = {
  sandbox: "Sandbox",
  memory: "Memory store",
  mcps: "Connectors",
  tools: "Web / browser",
};

export default async function ComponentPage({ params }: { params: Promise<RouteParams> }) {
  const { component } = await params;
  const entry = stackFor(component);
  if (!entry) notFound();

  const rows = rowsFor(component);
  const stats = statsFor(component, rows);
  const top = topRankedFor(component, TOP_N, rows);
  const picks = resolvedPicksFor(component);
  const isUnion = stats.members.length > 1;
  const plane = PLANE.find((p) => p.slot === PLANE_SLOT[component]) ?? null;

  return (
    <div>
      <section className="border-b border-line-subtle">
        <ContentWidth className="pb-6 pt-8">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div>
              <nav aria-label="Breadcrumb" className="text-[13px]">
                <Link
                  href="/c"
                  className="cursor-pointer font-medium text-ink-muted transition-colors duration-150 ease-state hover:text-accent-hover"
                >
                  Components
                </Link>
              </nav>
              <h1 className="mt-2 text-[24px] font-semibold leading-none tracking-[-0.01em] text-ink-hi">
                {entry.label}
              </h1>
              <p className="mt-2 text-[16px] leading-normal text-ink-body">{entry.oneLine}</p>
            </div>
            <ShelfStats stats={stats} />
          </div>

          {isUnion && (
            <p className="mt-4 text-[12.5px] text-ink-muted">
              Merges{" "}
              {stats.members.map((m, i) => (
                <span key={m.component}>
                  {i > 0 && " · "}
                  <span className="font-sans text-ink-body">{m.component}</span>{" "}
                  <data value={String(m.count)} className="tabular-nums">
                    {m.count.toLocaleString("en-US")}
                  </data>
                </span>
              ))}
            </p>
          )}

          {/* Sandbox, Tools and Dispatch list only the rows made for their job (lib/rank.mjs SHELF_FIT). */}
          {stats.fit && (
            <p className="mt-4 text-[12.5px] text-ink-muted">
              Lists only rows made to {stats.fit.purpose}:{" "}
              <data value={String(stats.indexed)} className="tabular-nums">
                {stats.indexed.toLocaleString("en-US")}
              </data>{" "}
              of the{" "}
              <data value={String(stats.fit.filed)} className="tabular-nums">
                {stats.fit.filed.toLocaleString("en-US")}
              </data>{" "}
              filed under {entry.label}.{" "}
              <Link
                href={stats.fit.browse}
                className="cursor-pointer font-medium text-accent-hover underline underline-offset-4"
              >
                Browse
              </Link>{" "}
              lists all of them.
            </p>
          )}
        </ContentWidth>
      </section>

      <section className="border-b border-line-subtle">
        <ContentWidth className="pb-6 pt-6">
          <h2 className="text-[18px] font-semibold leading-none text-ink-hi">Pick</h2>
          {picks.length > 1 && (
            <p className="mt-2 text-[13px] text-ink-muted">The pick and its runners-up, in score order</p>
          )}
          <div className="mt-3">
            <PickList picks={picks} />
          </div>
          {plane && (
            <p className="mt-3 text-[13px] leading-snug text-ink-muted">
              Deploy access · <span className="font-medium text-ink-body">{plane.pick}</span>: {plane.access}.{" "}
              <Link
                href="/stack"
                className="cursor-pointer text-accent-hover underline underline-offset-4"
              >
                Every account
              </Link>
            </p>
          )}
        </ContentWidth>
      </section>

      <section>
        <ContentWidth className="pb-16 pt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <h2 className="text-[18px] font-semibold leading-none text-ink-hi">Top Ranked</h2>
            {/* One control for one setting: the nav owns this selector from lg up. */}
            <HarnessSelector className="lg:hidden" />
            <CliNote />
          </div>

          <ShelfTable label={`${entry.label} · Top Ranked`} rows={top} />

          <p className="mt-4 text-[13px] text-ink-muted">
            <Link
              href={`/leaderboard?component=${encodeURIComponent(stats.leaderboardComponent)}`}
              className="cursor-pointer font-medium text-accent-hover underline underline-offset-4"
            >
              Leaderboard
            </Link>{" "}
            {isUnion ? (
              // The link opens one member's filter, not the whole component (CP138 T51), so say which.
              <>
                ranks the <span className="font-sans text-ink-body">{stats.leaderboardComponent}</span> rows, the
                largest part of this component (
                <data value={String(stats.members[0].count)} className="tabular-nums">
                  {stats.members[0].count.toLocaleString("en-US")}
                </data>{" "}
                of{" "}
                <data value={String(stats.indexed)} className="tabular-nums">
                  {stats.indexed.toLocaleString("en-US")}
                </data>
                )
              </>
            ) : (
              <>
                ranks all{" "}
                <data value={String(stats.ranked)} className="tabular-nums">
                  {stats.ranked.toLocaleString("en-US")}
                </data>{" "}
                scored rows
              </>
            )}
            .{" "}
            <Link
              href="/formula"
              className="cursor-pointer font-medium text-accent-hover underline underline-offset-4"
            >
              Formula
            </Link>{" "}
            shows the calculation.
          </p>
        </ContentWidth>
      </section>
    </div>
  );
}
