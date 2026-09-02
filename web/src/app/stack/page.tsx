// Stack — one pick per component, in the order an agent is assembled.
//
// The same src/data/stack.json the eleven component pages read, rendered as eleven rows:
// component → pick → why → install. Score and Signals resolve live from lib/rank.mjs, so
// this page and /c/<component> quote one number, not two. A pick with no catalog row says
// Not Indexed and links its source rather than borrowing someone else's row.
//
// Machine twin: GET /api/stack returns the same eleven picks as JSON.
import type { Metadata } from "next";
import Link from "next/link";
import { ContentWidth, DataTable, Td, Th, Tr } from "@/components/data-table";
import { HarnessSelector, InstallSnippet } from "@/components/install-snippet";
import { NotIndexedTag, PickName } from "@/components/component-page";
import { ScoreBadge } from "@/components/score-badge";
import { CANON_SLUGS, resolvedPicksFor, stackFor } from "@/lib/canon";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Stack · Armory",
  description: "One pick per harness component, end to end.",
};

export default function StackPage() {
  const rows = CANON_SLUGS.map((slug) => {
    const entry = stackFor(slug);
    const pick = resolvedPicksFor(slug)[0] ?? null;
    return { slug, label: entry?.label ?? slug, oneLine: entry?.oneLine ?? "", pick };
  });

  const indexed = rows.filter((r) => r.pick?.row).length;

  return (
    <div>
      <section className="border-b border-line-subtle">
        <ContentWidth className="pb-6 pt-8">
          <h1 className="text-[24px] font-semibold leading-none tracking-[-0.01em] text-ink-hi">
            Stack
          </h1>
          <p className="mt-2 text-[16px] leading-normal text-ink-body">
            One pick per component to build an agent end to end ·{" "}
            <data value={String(indexed)} className="tabular-nums text-ink-hi">
              {indexed}
            </data>{" "}
            of{" "}
            <data value={String(rows.length)} className="tabular-nums text-ink-hi">
              {rows.length}
            </data>{" "}
            indexed ·{" "}
            <Link
              href="/c"
              className="cursor-pointer font-medium text-accent-hover underline underline-offset-4"
            >
              Components
            </Link>
          </p>
        </ContentWidth>
      </section>

      <section>
        <ContentWidth className="pb-16 pt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <h2 className="text-[18px] font-semibold leading-none text-ink-hi">Picks</h2>
            {/* One control for one setting: the nav owns this selector from lg up. */}
            <HarnessSelector className="lg:hidden" />
          </div>

          <DataTable label="Stack" minWidthClass="min-w-[1080px]">
            <thead>
              <tr>
                <Th className="w-[160px]">Component</Th>
                <Th align="right" className="w-[76px]" sort="none">
                  Score
                </Th>
                <Th className="w-[220px]">Pick</Th>
                <Th className="w-auto">Reason</Th>
                <Th className="w-[300px]">Install</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Tr key={r.slug}>
                  <Td className="font-medium text-ink-hi">
                    <Link
                      href={`/c/${r.slug}`}
                      className="cursor-pointer transition-colors duration-150 ease-state hover:text-accent-hover"
                    >
                      {r.label}
                    </Link>
                  </Td>
                  <Td align="right">
                    {r.pick?.row ? (
                      <ScoreBadge
                        score={r.pick.row.scores.universal}
                        evidence={r.pick.row.scores.evidence}
                      />
                    ) : (
                      <span className="font-mono text-[13px] leading-none text-score-none">
                        &mdash;
                      </span>
                    )}
                  </Td>
                  <Td truncate>
                    {r.pick ? <PickName pick={r.pick} /> : <span className="text-ink-faint">—</span>}
                  </Td>
                  <Td className="text-[12px] text-ink-muted">{r.pick?.why ?? ""}</Td>
                  <Td>
                    {r.pick?.row ? (
                      <InstallSnippet name={r.pick.row.name} />
                    ) : r.pick ? (
                      <span className="inline-flex flex-wrap items-center gap-2">
                        <NotIndexedTag />
                        <a
                          href={r.pick.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="cursor-pointer break-all font-mono text-[11px] text-accent-hover underline underline-offset-4"
                        >
                          {r.pick.url}
                        </a>
                      </span>
                    ) : null}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </DataTable>

          <p className="mt-4 text-[13px] text-ink-muted">
            <Link
              href="/c"
              className="cursor-pointer font-medium text-accent-hover underline underline-offset-4"
            >
              Components
            </Link>{" "}
            lists up to three picks per component and its top-ranked rows.{" "}
            <a
              href="/api/stack"
              className="cursor-pointer font-medium text-accent-hover underline underline-offset-4"
            >
              API
            </a>{" "}
            returns the same picks as JSON.
          </p>
        </ContentWidth>
      </section>
    </div>
  );
}
