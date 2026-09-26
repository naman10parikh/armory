/*
  The home board — one promise line, live counters, search, then Top / Trending / New (CP143).

  No marketing hero: the page says what Armory is in one line (components, ranked where public
  evidence exists), counts that are true right now, and then the table. The three tabs are three static routes (/, /trending, /new) rather than client state, so each
  view is a URL an agent can fetch and a person can share.
*/
import Link from "next/link";
import { BoardTable } from "./board-table";
import { ContentWidth } from "./data-table";
import { SearchIcon } from "./icons";
import { CliNote, HarnessSelector } from "./install-snippet";
import { RefreshedAgo } from "./refreshed-ago";
import { int, shortDate, utcStamp } from "@/lib/format";
import { boardMeta, newRows, topRows, trendingRows, type BoardMeta } from "@/lib/rows";
import { toRowViews } from "@/lib/row-view";

export type BoardTab = "top" | "trending" | "new";

const TABS: readonly { tab: BoardTab; href: string; label: string }[] = [
  { tab: "top", href: "/", label: "Top" },
  { tab: "trending", href: "/trending", label: "Trending" },
  { tab: "new", href: "/new", label: "New" },
];

const ROWS = 20;

export function HomeBoard({ tab }: { tab: BoardTab }) {
  const meta = boardMeta();
  const now = Date.now();
  const rows = tab === "top" ? topRows(ROWS) : tab === "trending" ? trendingRows(ROWS) : newRows(ROWS);
  const views = toRowViews(rows);

  return (
    <div>
      <section className="border-b border-line-subtle">
        <ContentWidth className="pb-8 pt-10">
          <h1 className="max-w-[36ch] text-[27px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink-hi">
            <data value={String(meta.total)}>{int(meta.total)}</data> agent components, ranked where public
            evidence exists
          </h1>
          <Counters meta={meta} />

          <form action="/ask" method="get" role="search" className="mt-6 flex w-full max-w-[520px] items-center gap-2">
            <label htmlFor="home-search" className="sr-only">
              Search
            </label>
            <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-raise-1 px-3 transition-colors duration-150 ease-state focus-within:border-accent-line">
              <SearchIcon size={15} className="shrink-0 text-ink-muted" />
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder="browser automation"
                autoComplete="off"
                className="h-full w-full min-w-0 bg-transparent text-[14px] text-ink-hi outline-none placeholder:text-ink-faint"
              />
            </div>
            <button
              type="submit"
              className="h-10 shrink-0 cursor-pointer rounded-lg border border-accent-line bg-accent-quiet px-4 text-[14px] font-medium text-accent-hover transition-colors duration-150 ease-state hover:bg-accent-line"
            >
              Search
            </button>
          </form>
        </ContentWidth>
      </section>

      <section>
        <ContentWidth className="pb-16 pt-8">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-line-subtle">
            <nav aria-label="Board" className="-mb-px flex items-center gap-1">
              {TABS.map((t) => (
                <Link
                  key={t.tab}
                  href={t.href}
                  aria-current={t.tab === tab ? "page" : undefined}
                  className={`cursor-pointer border-b-2 px-3 pb-2.5 pt-1 text-[14px] font-medium transition-colors duration-150 ease-state ${
                    t.tab === tab
                      ? "border-accent text-ink-hi"
                      : "border-transparent text-ink-muted hover:text-ink-hi"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
            {/* One control for one setting: the nav owns this selector from lg up. */}
            <HarnessSelector className="mb-2 lg:hidden" />
            <CliNote className="mb-2.5" />
          </div>

          <p className="mb-4 mt-4 text-[13px] text-ink-muted">{lead(tab, meta)}</p>

          {views.length === 0 ? (
            <Empty tab={tab} meta={meta} />
          ) : (
            <BoardTable
              label={TABS.find((t) => t.tab === tab)?.label ?? "Top"}
              rows={views}
              now={now}
              extra={tab === "trending" ? "gained" : tab === "new" ? "listed" : null}
              fallbackDate={meta.generatedAt}
              trendingSince={meta.trendingSince}
              scoreSort={tab === "top" ? "descending" : "none"}
            />
          )}

          <p className="mt-4 max-w-[90ch] text-[13px] leading-relaxed text-ink-muted">
            {tab === "top" ? (
              <>
                Equal scores are ordered by the score before rounding, then by how many signals agree,
                the most recent commit and stars.{" "}
              </>
            ) : null}
            <FootLink href="/leaderboard">Leaderboard</FootLink> ranks all{" "}
            <data value={String(meta.ranked)}>{int(meta.ranked)}</data> scored components;{" "}
            <FootLink href="/formula">Formula</FootLink> shows the arithmetic.
          </p>
        </ContentWidth>
      </section>
    </div>
  );
}

function lead(tab: BoardTab, meta: BoardMeta): string {
  if (tab === "trending") {
    return meta.trendingSince
      ? `Most practitioner mentions gained since ${shortDate(meta.trendingSince)}, among components already listed then.`
      : "Most practitioner mentions gained over the last two weeks.";
  }
  if (tab === "new") return "Most recently added to the catalog first; the date is the day it was listed.";
  return "Highest score first, across component types";
}

function Counters({ meta }: { meta: BoardMeta }) {
  return (
    <p className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[14px] text-ink-muted">
      <span>
        <data value={String(meta.ranked)} className="font-semibold text-ink-hi">
          {int(meta.ranked)}
        </data>{" "}
        Ranked
      </span>
      {meta.addedThisWeek != null && (
        <Link href="/new" className="cursor-pointer transition-colors duration-150 ease-state hover:text-accent-hover">
          <data value={String(meta.addedThisWeek)} className="font-semibold text-ink-hi">
            +{int(meta.addedThisWeek)}
          </data>{" "}
          listed this week
        </Link>
      )}
      {meta.generatedAt && (
        <span>
          Updated{" "}
          <span className="font-semibold text-ink-hi">
            <RefreshedAgo iso={meta.generatedAt} initial={utcStamp(meta.generatedAt)} />
          </span>
        </span>
      )}
    </p>
  );
}

function Empty({ tab, meta }: { tab: BoardTab; meta: BoardMeta }) {
  const text =
    tab === "trending"
      ? `No component gained mentions in the last ${meta.trendingDays} days`
      : tab === "new"
        ? "No listing dates in this build"
        : "Indexing in progress";
  return (
    <div className="rounded-xl border border-line-subtle bg-raise-1 px-5 py-8">
      <p className="text-[14px] font-semibold text-ink-hi">{tab === "top" ? "Not Indexed" : "Nothing Here Yet"}</p>
      <p className="mt-1 text-[13px] text-ink-muted">{text}</p>
      <Link
        href={tab === "top" ? "/status" : "/"}
        className="mt-3 inline-block cursor-pointer text-[13px] font-medium text-accent-hover underline underline-offset-4"
      >
        {tab === "top" ? "Status" : "Top"}
      </Link>
    </div>
  );
}

function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="cursor-pointer font-medium text-accent-hover underline underline-offset-4">
      {children}
    </Link>
  );
}
