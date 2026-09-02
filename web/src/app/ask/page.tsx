"use client";
// Ask — the conversational front door to the catalog. Type a request in plain English ("browser
// automation") and POST it to /api/ask (unchanged), which returns ranked components. Degrades to
// keyword matches when no Gemini key is set. The query lives in the URL (`?q=`) both ways: the home
// search box GETs here with it, and typing here keeps the URL in sync. The empty state is never a
// void — it shows the top-ranked rows (GET /api/rank?limit=12) in the same DataTable as Leaderboard.
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ContentWidth, DataTable, Th } from "@/components/data-table";
import { HarnessSelector } from "@/components/install-snippet";
import { RankedRow, RankedRowSkeleton, type RankedRowData } from "@/components/ranked-row";
import { AskResultCard, InterpretedChip, KeywordChip, type AskResultItem } from "@/components/ask-result-card";

interface Interpreted {
  keywords: string[];
  component?: string;
  domain?: string;
  vertical?: string;
}
interface AskResponse {
  ok: boolean;
  reason?: string;
  interpreted: Interpreted;
  summary: string;
  items: AskResultItem[];
}

// COPY.md §4D — five short, Title-Case example queries (replaces the old full-sentence prompts).
const EXAMPLES = [
  "Browser Automation",
  "Excel + Finance",
  "Test Generation",
  "Agent Memory",
  "Sandbox Deploy",
] as const;
const TOP_N = 12;
const COLS = 8;

export default function AskPage() {
  return (
    <Suspense fallback={<AskShell />}>
      <AskContent />
    </Suspense>
  );
}

function AskShell() {
  return (
    <ContentWidth className="pb-16 pt-8">
      <h1 className="text-[24px] font-semibold leading-none tracking-[-0.01em] text-ink-hi">Ask</h1>
      <p className="mt-3 text-[13px] text-ink-muted">Loading</p>
    </ContentWidth>
  );
}

function AskContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(() => searchParams.get("q") || "");
  const [data, setData] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [topRanked, setTopRanked] = useState<RankedRowData[] | null>(null);
  const [topErr, setTopErr] = useState("");

  // The default view — always fetched, cheap, and needed the instant there's no active query.
  useEffect(() => {
    fetch(`/api/rank?limit=${TOP_N}`)
      .then((r) => r.json())
      .then((d: { items: RankedRowData[] }) => setTopRanked(d.items))
      .catch((e) => setTopErr(String(e)));
  }, []);

  const ask = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      setQ(trimmed);
      router.replace(trimmed ? `${pathname}?q=${encodeURIComponent(trimmed)}` : pathname, {
        scroll: false,
      });
      if (!trimmed) {
        setData(null);
        return;
      }
      setLoading(true);
      setErr("");
      fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ q: trimmed }),
      })
        .then((r) => r.json())
        .then((d: AskResponse) => setData(d))
        .catch((e) => setErr(String(e)))
        .finally(() => setLoading(false));
    },
    [pathname, router],
  );

  // Run the URL's initial `q` once — the home search box GETs /ask?q=… (design/BRIEF.md §note).
  const ranOnce = useRef(false);
  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;
    if (q) ask(q);
  }, [q, ask]);

  const reset = useCallback(() => {
    setQ("");
    setData(null);
    setErr("");
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const degraded = data?.reason === "no_key" || data?.reason === "gemini_error";
  const items = data?.items ?? [];
  const ranked = items.filter((i) => i.universal != null).length;
  const topScore = items.reduce((m, i) => (i.universal != null && i.universal > m ? i.universal : m), 0);

  return (
    <div>
      <section className="border-b border-line-subtle">
        <ContentWidth className="pb-6 pt-8">
          <h1 className="text-[24px] font-semibold leading-none tracking-[-0.01em] text-ink-hi">Ask</h1>
          <p className="mt-2 text-[16px] leading-normal text-ink-body">
            Describe a task, get ranked components
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(q);
            }}
            role="search"
            className="mt-5 flex flex-wrap gap-2.5"
          >
            <label htmlFor="ask-q" className="sr-only">
              Search
            </label>
            <input
              id="ask-q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="browser automation"
              autoComplete="off"
              className="h-11 flex-1 basis-[420px] rounded-xl border border-line bg-raise-1 px-4 text-[15px] text-ink-hi outline-none transition-colors duration-150 ease-state placeholder:text-ink-faint focus:border-accent-line"
            />
            <button
              type="submit"
              disabled={loading || !q.trim()}
              className={`h-11 shrink-0 whitespace-nowrap rounded-xl px-5 text-[14px] font-semibold transition-colors duration-150 ease-state ${
                loading || !q.trim()
                  ? "cursor-default bg-accent-line text-ink-faint"
                  : "cursor-pointer bg-accent text-canvas hover:bg-accent-hover"
              }`}
            >
              {loading ? "Searching" : "Ask"}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => ask(ex)}
                className="cursor-pointer whitespace-nowrap rounded-full border border-line-subtle bg-raise-1 px-2.5 py-1 text-[12px] text-ink-body transition-colors duration-150 ease-state hover:border-line hover:text-ink-hi"
              >
                {ex}
              </button>
            ))}
            <HarnessSelector className="ml-auto" />
          </div>
        </ContentWidth>
      </section>

      <section>
        <ContentWidth className="pb-16 pt-6">
          {err && (
            <div className="mb-4 rounded-xl border border-line bg-raise-1 px-4 py-3 text-[13px]">
              <p className="font-semibold text-danger">Load Failed</p>
              <p className="mt-1 text-ink-muted">{err}</p>
              <button
                type="button"
                onClick={() => ask(q)}
                className="mt-2 cursor-pointer font-medium text-accent-hover underline underline-offset-4"
              >
                Retry
              </button>
            </div>
          )}

          {loading && (
            <div>
              <p className="text-[13px] text-ink-muted">Searching</p>
              <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    aria-hidden
                    className="h-[132px] animate-pulse rounded-xl border border-line-subtle bg-raise-1"
                  />
                ))}
              </div>
            </div>
          )}

          {!loading && data && (
            <div>
              {!degraded && data.summary && (
                <p className="text-[18px] font-semibold leading-snug tracking-[-0.005em] text-ink-hi">
                  {data.summary}
                </p>
              )}

              {items.length > 0 && (
                <div className={`text-[12.5px] tabular-nums text-ink-muted ${degraded ? "" : "mt-2"}`}>
                  <data value={String(items.length)} className="font-medium text-ink-body">
                    {items.length}
                  </data>{" "}
                  Results ·{" "}
                  <data value={String(ranked)} className="font-medium text-ink-body">
                    {ranked}
                  </data>{" "}
                  Scored
                  {ranked > 0 && (
                    <>
                      {" "}
                      · Top Score{" "}
                      <data value={String(topScore)} className="font-medium text-ink-body">
                        {topScore.toFixed(1)}
                      </data>
                    </>
                  )}
                </div>
              )}

              {(data.interpreted.component ||
                data.interpreted.domain ||
                data.interpreted.vertical ||
                data.interpreted.keywords.length > 0) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {data.interpreted.component && <InterpretedChip>{data.interpreted.component}</InterpretedChip>}
                  {data.interpreted.vertical && <InterpretedChip>{data.interpreted.vertical}</InterpretedChip>}
                  {data.interpreted.domain && <InterpretedChip>{data.interpreted.domain}</InterpretedChip>}
                  {data.interpreted.keywords.map((k) => (
                    <KeywordChip key={k}>{k}</KeywordChip>
                  ))}
                </div>
              )}

              {degraded && (
                <p className="mt-3 text-[12px] text-ink-muted">
                  Keyword Mode — conversational search unavailable
                </p>
              )}

              <div className="mt-5">
                {items.length === 0 ? (
                  <div className="rounded-xl border border-line-subtle bg-raise-1 px-5 py-8">
                    <p className="text-[14px] font-semibold text-ink-hi">No Results</p>
                    <p className="mt-1 text-[13px] text-ink-muted">Broaden the query</p>
                    <button
                      type="button"
                      onClick={reset}
                      className="mt-3 cursor-pointer text-[13px] font-medium text-accent-hover underline underline-offset-4"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-3">
                    {items.map((item, i) => (
                      <AskResultCard key={item.name + i} item={item} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && !data && (
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[18px] font-semibold leading-none text-ink-hi">Top Ranked</h2>
              </div>

              {topErr ? (
                <div className="rounded-xl border border-line bg-raise-1 px-4 py-3 text-[13px]">
                  <p className="font-semibold text-danger">Load Failed</p>
                  <p className="mt-1 text-ink-muted">{topErr}</p>
                </div>
              ) : (
                <DataTable label="Top Ranked" minWidthClass="min-w-[1180px]">
                  <thead>
                    <tr>
                      <Th align="right" className="w-[56px]">
                        Rank
                      </Th>
                      <Th align="right" className="w-[76px]">
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
                    {topRanked === null && <RankedRowSkeleton cols={COLS} rows={6} />}
                    {topRanked?.map((row, i) => (
                      <RankedRow key={`${row.component}/${row.name}/${i}`} row={row} rank={i + 1} />
                    ))}
                  </tbody>
                </DataTable>
              )}
            </div>
          )}
        </ContentWidth>
      </section>
    </div>
  );
}
