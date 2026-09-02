// Home — design/BRIEF.md Decision 1: the table IS the hero.
//
// A ~180px band (wordmark, one lead line, search, counts) and then the top-20
// ranked rows, above the fold. No 100dvh hero, no decorative graph, none of the
// neuroscience vocabulary, and no animated numbers — the old animated counter published a
// false headline figure for 1.2s to every screenshot, scraper and agent.
//
// Rows are computed at build time with the SAME engine the leaderboard, /formula
// and the API use (lib/rank.mjs), so the home page can never disagree with them.
import Link from "next/link";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
// @ts-expect-error — vendored plain-ESM engine (web/lib/rank.mjs, copied by scripts/copy-data.mjs)
import { computeRows } from "../../lib/rank.mjs";
import { CATEGORIES } from "@/lib/types";
import { ContentWidth, DataTable, Td, Th, Tr, clampWords } from "@/components/data-table";
import { ScoreBadge } from "@/components/score-badge";
import { SignalsRow, type SignalValues } from "@/components/signals-row";
import { HarnessSelector, InstallSnippet } from "@/components/install-snippet";
import { SearchIcon } from "@/components/icons";

export const runtime = "nodejs";

const TOP_N = 20;

interface EngineRow {
  name: string;
  component: string;
  domain: string;
  url: string | null;
  desc: string;
  signals: SignalValues;
  scores: { universal: number | null; evidence: number };
}

/** An engine row zipped back to its raw catalog `type`, which is the detail route segment. */
interface HomeRow extends EngineRow {
  type: string;
}

function catalogPath(): string {
  const local = join(process.cwd(), "catalog.json"); // vendored by `pnpm prebuild`
  return existsSync(local) ? local : join(process.cwd(), "..", "catalog.json");
}

function load(): { rows: HomeRow[]; indexedAt: string } {
  try {
    const cat = JSON.parse(readFileSync(catalogPath(), "utf-8")) as {
      components: { type?: string }[];
      generated_at?: string;
    };
    // computeRows is a 1:1 .map over cat.components, so index i pairs the scored
    // row with its raw entry — the only place the route `type` survives.
    const scored = computeRows(cat.components) as EngineRow[];
    const rows = scored.map((row, i) => ({
      ...row,
      type: typeof cat.components[i]?.type === "string" ? (cat.components[i].type as string) : "",
    }));
    const at = cat.generated_at;
    return { rows, indexedAt: typeof at === "string" && at > "2000" ? at : "" };
  } catch (err) {
    console.warn("[home] catalog unavailable:", err instanceof Error ? err.message : String(err));
    return { rows: [], indexedAt: "" };
  }
}

const num = (v: number | null | undefined): number => (typeof v === "number" ? v : -1);

/** Same ordering as the leaderboard's default sort: score, then corroboration, then stars, then name. */
function topRanked(rows: HomeRow[]): HomeRow[] {
  return rows
    .filter((r) => r.scores.universal != null)
    .sort(
      (a, b) =>
        num(b.scores.universal) - num(a.scores.universal) ||
        b.scores.evidence - a.scores.evidence ||
        num(b.signals.stars) - num(a.signals.stars) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, TOP_N);
}

export default function HomePage() {
  const { rows, indexedAt } = load();
  const total = rows.length;
  const ranked = rows.filter((r) => r.scores.universal != null).length;
  const top = topRanked(rows);

  return (
    <div>
      {/* ── Band: wordmark, lead, search, counts. Nothing animates. ───────── */}
      <section className="border-b border-line-subtle">
        <ContentWidth className="pb-6 pt-20">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div>
              <h1 className="font-wordmark text-[32px] leading-none tracking-[-0.01em] text-ink-hi">
                Armory
              </h1>
              <p className="mt-2 text-[16px] leading-normal text-ink-body">
                Ranked catalog of{" "}
                <data value={String(total)} className="tabular-nums text-ink-hi">
                  {total.toLocaleString("en-US")}
                </data>{" "}
                open-source agent components
              </p>
            </div>

            <nav aria-label="Sections" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px]">
              <BandLink href="/leaderboard">Leaderboard</BandLink>
              <BandLink href="/formula">Formula</BandLink>
              <BandLink href="/ask">Ask</BandLink>
              <BandLink href="/graph">Timeline</BandLink>
            </nav>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            <form action="/ask" method="get" role="search" className="flex w-full max-w-[440px] items-center gap-2">
              <label htmlFor="home-search" className="sr-only">
                Search
              </label>
              <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-line bg-raise-1 px-3 transition-colors duration-150 ease-state focus-within:border-accent-line">
                <SearchIcon size={15} className="shrink-0 text-ink-muted" />
                <input
                  id="home-search"
                  name="q"
                  type="search"
                  placeholder="browser automation"
                  autoComplete="off"
                  className="h-full w-full bg-transparent text-[14px] text-ink-hi outline-none placeholder:text-ink-faint"
                />
              </div>
              <button
                type="submit"
                className="h-9 shrink-0 cursor-pointer rounded-lg border border-accent-line bg-accent-quiet px-3.5 text-[13px] font-medium text-accent-hover transition-colors duration-150 ease-state hover:bg-accent-line"
              >
                Search
              </button>
            </form>

            <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
              <Stat label="Ranked">
                <data value={String(ranked)}>{ranked.toLocaleString("en-US")}</data>
              </Stat>
              <Stat label="Categories">
                <data value={String(CATEGORIES.length)}>{CATEGORIES.length}</data>
              </Stat>
              {indexedAt && (
                <Stat label="Indexed">
                  <time dateTime={indexedAt}>{indexedAt.slice(0, 10)}</time>
                </Stat>
              )}
            </dl>
          </div>
        </ContentWidth>
      </section>

      {/* ── The table. It opens useful; nothing is two clicks away. ───────── */}
      <section>
        <ContentWidth className="pb-16 pt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <h2 className="text-[18px] font-semibold leading-none text-ink-hi">Top Ranked</h2>
            <HarnessSelector />
          </div>

          {top.length === 0 ? (
            <div className="rounded-xl border border-line-subtle bg-raise-1 px-5 py-8">
              <p className="text-[14px] font-semibold text-ink-hi">Not Indexed</p>
              <p className="mt-1 text-[13px] text-ink-muted">Indexing in progress</p>
              <Link
                href="/status"
                className="mt-3 inline-block cursor-pointer text-[13px] font-medium text-accent-hover underline underline-offset-4"
              >
                Status
              </Link>
            </div>
          ) : (
            <DataTable label="Top Ranked" minWidthClass="min-w-[1180px]">
              <thead>
                <tr>
                  <Th align="right" className="w-[56px]">
                    Rank
                  </Th>
                  <Th align="right" className="w-[76px]" sort="descending">
                    Score
                  </Th>
                  <Th className="w-[220px]">Component</Th>
                  <Th className="w-auto">Description</Th>
                  <Th className="w-[276px]">Signals</Th>
                  <Th className="w-[104px]">Type</Th>
                  <Th className="w-[124px]">Domain</Th>
                  <Th className="w-[300px]">Install</Th>
                </tr>
              </thead>
              <tbody>
                {top.map((row, i) => (
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
                    <Td className="whitespace-nowrap text-[12px] text-ink-muted">
                      {row.domain}
                    </Td>
                    <Td>
                      <InstallSnippet name={row.name} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </DataTable>
          )}

          <p className="mt-4 text-[13px] text-ink-muted">
            <Link
              href="/leaderboard"
              className="cursor-pointer font-medium text-accent-hover underline underline-offset-4"
            >
              Leaderboard
            </Link>{" "}
            ranks all{" "}
            <data value={String(ranked)} className="tabular-nums">
              {ranked.toLocaleString("en-US")}
            </data>{" "}
            scored components.{" "}
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

function BandLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="cursor-pointer font-medium text-ink-body transition-colors duration-150 ease-state hover:text-accent-hover"
    >
      {children}
    </Link>
  );
}

/** Label over a final, machine-readable value. Never animated. */
function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{label}</dt>
      <dd className="mt-1 font-mono text-[18px] leading-none tabular-nums text-ink-hi">{children}</dd>
    </div>
  );
}
