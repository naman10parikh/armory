import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import {
  findComponent,
  getComponents,
  getNameIndex,
  readComponentBody,
} from "@/lib/catalog";
import type { Component } from "@/lib/types";
import { CliChip, MaturityBadge, TagChip, TypePill } from "@/components/badges";
import { OursTag, StaleTag } from "@/components/board-table";
import { ComponentCard } from "@/components/component-card";
import { ContentWidth } from "@/components/data-table";
import { ScoreBadge } from "@/components/score-badge";
import { SignalsRow, type SignalValues } from "@/components/signals-row";
import { HarnessSelector } from "@/components/install-snippet";
import { InstallStrip } from "@/components/install-strip";
import { ArrowLeftIcon, ExternalIcon, TypeIcon } from "@/components/icons";
import { CANON, rowsFor, stackFor } from "@/lib/canon";
import { ago, contributorOf, shortDate } from "@/lib/format";
import { findRow } from "@/lib/rows";
import { detailHref } from "@/lib/row-view";

const EMPTY_SIGNALS: SignalValues = { tested: null, mentions: null, stars: null, forks: null, usage: null };

interface RouteParams {
  type: string;
  slug: string;
}

// PERFORMANCE: do NOT statically pre-render every component — the catalog holds
// 18,000+ components and pre-rendering all of them hangs the build. Pre-render only
// a small cap (the top 50 by synapse degree + stars); the long tail is served
// on-demand via ISR (`dynamicParams = true`).
const PRERENDER_CAP = 50;
export const dynamicParams = true;
export const revalidate = 3600; // re-validate on-demand pages hourly

export function generateStaticParams(): RouteParams[] {
  const components = getComponents();
  const degree = new Map<string, number>();
  for (const e of components)
    for (const r of e.related)
      degree.set(r, (degree.get(r) ?? 0) + 1);

  return [...components]
    .sort((a, b) => {
      const da = (degree.get(a.name) ?? 0) + (a.stars ?? 0) / 1000;
      const db = (degree.get(b.name) ?? 0) + (b.stars ?? 0) / 1000;
      return db - da;
    })
    .slice(0, PRERENDER_CAP)
    .map((e) => ({ type: e.type, slug: e.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { type, slug } = await params;
  const component = findComponent(type, slug);
  if (!component) return { title: "Not Found · Armory" };
  return {
    title: `${component.name} · Armory`,
    description: component.description,
  };
}

export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { type, slug } = await params;
  const component = findComponent(type, slug);
  if (!component) notFound();

  const body = readComponentBody(component);
  const html = body
    ? await marked.parse(body, { async: true, gfm: true, breaks: false })
    : "";

  const allComponents = getComponents();
  const nameIndex = getNameIndex();
  const relatedComponents: Component[] = component.related
    .map((r) => allComponents.find((e) => e.name === r))
    .filter((e): e is Component => Boolean(e));
  const unresolvedRelated = component.related.filter((r) => !nameIndex.has(r));

  // The same board row every list shows (src/lib/rows.ts): score, signals, dates, Ours.
  const row = findRow(type, slug) ?? null;
  const score = row?.universal ?? null;
  const evidence = row?.evidence ?? 0;
  const signals = row?.signals ?? EMPTY_SIGNALS;
  const domain = row?.domain ?? null;
  const vertical = row?.vertical ?? null;
  const now = Date.now();
  const contributedBy = contributorOf(component.tags);

  // Alternatives: the best-scored rows on the same canonical shelf, so a reader who landed on the
  // wrong tool sees the right one in one click (CP143 brief, the detail page listed none).
  const shelf = row ? Object.keys(CANON).find((k) => CANON[k].includes(row.component)) ?? null : null;
  const alternatives = shelf
    ? rowsFor(shelf)
        .filter((r) => r.universal != null && !(r.type === type && r.name === slug))
        .slice(0, 3)
    : [];

  return (
    <ContentWidth className="pb-16 pt-8">
      <Link
        href="/browse"
        className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink-muted transition-colors duration-150 ease-state hover:text-accent-hover"
      >
        <ArrowLeftIcon size={15} />
        Browse
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        {/* ── Main column ───────────────────────────────────────────── */}
        <article className="min-w-0">
          {/* Header */}
          <header>
            <span className="inline-flex items-center gap-2">
              <TypeIcon type={component.type} size={16} className="text-accent" />
              <TypePill type={component.type} />
            </span>
            <h1 className="mt-3 break-words text-[32px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink-hi">
              {component.name}
              {row?.ours && <OursTag />}
            </h1>
            {component.description && (
              <p className="mt-3 max-w-2xl text-[16px] leading-[1.5] text-ink-body">
                {component.description}
              </p>
            )}
          </header>

          {/* Score + Signals — FIRST tier alongside Name + Install (design/BRIEF.md
              §4). Computed at render with the same engine as every other surface. */}
          <dl className="mt-6 flex flex-wrap items-start gap-x-10 gap-y-4">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Score
              </dt>
              <dd className="mt-1.5">
                <ScoreBadge score={score} evidence={evidence} caption />
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Evidence
              </dt>
              <dd className="mt-1.5">
                <SignalsRow signals={signals} />
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                Last commit
              </dt>
              <dd className="mt-1.5 text-[13px] text-ink-body">
                {row?.pushedAt ? (
                  <>
                    <time dateTime={row.pushedAt}>{ago(row.pushedAt, now)}</time>
                    {row.stale && <StaleTag />}
                  </>
                ) : (
                  <span className="text-ink-faint">Not known</span>
                )}
              </dd>
            </div>
            {row?.listedAt && (
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  Listed
                </dt>
                <dd className="mt-1.5 text-[13px] text-ink-body">
                  <time dateTime={row.listedAt}>{shortDate(row.listedAt)}</time>
                </dd>
              </div>
            )}
          </dl>

          {/* Install — J3, the design centre. The command plus the exact per-harness config it
              writes, driven by the one harness selector (the nav owns it from lg up). */}
          <div className="mt-8 max-w-xl">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[18px] font-semibold leading-none text-ink-hi">Install</h2>
              <HarnessSelector className="lg:hidden" />
            </div>
            <InstallStrip component={component} />
          </div>

          {alternatives.length > 0 && shelf && (
            <section className="mt-10 max-w-xl">
              <h2 className="text-[18px] font-semibold leading-none text-ink-hi">
                Best alternatives on the {stackFor(shelf)?.label ?? shelf} shelf
              </h2>
              <ol className="mt-3 divide-y divide-line-subtle rounded-xl border border-line-subtle bg-raise-1">
                {alternatives.map((alt) => (
                  <li key={`${alt.type}/${alt.name}`} className="flex items-start justify-between gap-4 px-4 py-3">
                    <span className="min-w-0">
                      <Link
                        href={detailHref(alt.type, alt.name)}
                        className="cursor-pointer break-words text-[14px] font-medium text-ink-hi transition-colors duration-150 ease-state hover:text-accent-hover"
                      >
                        {alt.name}
                      </Link>
                      {alt.ours && <OursTag />}
                      <span className="mt-0.5 block">
                        <SignalsRow signals={alt.signals} />
                      </span>
                    </span>
                    <ScoreBadge score={alt.universal} evidence={alt.evidence} />
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Markdown body from the brain vault */}
          {html ? (
            <div
              className="component-prose mt-10"
              // Build-time repo content authored by maintainers — trusted.
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="mt-10 text-sm text-ink-muted">
              No detailed write-up yet for this component.
            </p>
          )}

          {/* Connections — related components. The `related:` field is loose
              co-occurrence, not verified dependencies, so this stays a plain list
              of real, named components (each a real edge to a real page) rather
              than a decorative graph (design/BRIEF.md Approval §3). */}
          {(relatedComponents.length > 0 || unresolvedRelated.length > 0) && (
            <section className="mt-12 border-t border-line-subtle pt-8">
              <h2 className="text-[18px] font-semibold leading-none text-ink-hi">
                Connections
              </h2>

              {relatedComponents.length > 0 && (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {relatedComponents.map((rel) => (
                    <ComponentCard key={`${rel.type}/${rel.name}`} component={rel} />
                  ))}
                </div>
              )}

              {unresolvedRelated.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    Not Indexed
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {unresolvedRelated.map((r) => (
                      <li key={r}>
                        <span className="inline-flex items-center rounded-lg border border-dashed border-line px-3 py-1.5 font-sans text-sm text-ink-muted">
                          {r}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </article>

        {/* ── Meta rail (Double-Bezel panel) ────────────────────────── */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl bg-raise-1 p-1.5 ring-1 ring-line-subtle">
            <dl className="divide-y divide-line-subtle rounded-[calc(1.25rem-0.375rem)] bg-raise-2 p-5">
              <MetaRow label="Component">
                <TypePill type={component.type} />
              </MetaRow>
              <MetaRow label="Domain">
                <span className="text-[12px] text-ink-body">{domain ?? "—"}</span>
              </MetaRow>
              {vertical && (
                <MetaRow label="Vertical">
                  <span className="text-[12px] text-ink-body">{vertical}</span>
                </MetaRow>
              )}
              <MetaRow label="Maturity">
                <MaturityBadge maturity={component.maturity} />
              </MetaRow>
              {component.cli_compat.length > 0 && (
                <MetaRow label="Harness" stack>
                  <div className="flex flex-wrap gap-1.5">
                    {component.cli_compat.map((cli) => (
                      <CliChip key={cli} cli={cli} />
                    ))}
                  </div>
                </MetaRow>
              )}
              {component.tags.length > 0 && (
                <MetaRow label="Tags" stack>
                  <div className="flex flex-wrap gap-1.5">
                    {component.tags.map((tag) => (
                      <TagChip key={tag} tag={tag} />
                    ))}
                  </div>
                </MetaRow>
              )}
              {component.license && component.license !== "unknown" && (
                <MetaRow label="License">
                  <span className="text-[12px] text-ink-body">{component.license}</span>
                </MetaRow>
              )}
              {component.verified_at && (
                <MetaRow label="Checked">
                  <time
                    dateTime={component.verified_at}
                    className="font-sans text-[12px] text-ink-body"
                  >
                    {component.verified_at.slice(0, 10)}
                  </time>
                </MetaRow>
              )}
            </dl>
          </div>

          {component.source_url && (
            <a
              href={component.source_url}
              target="_blank"
              rel="noreferrer noopener"
              className="group mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-sm text-ink-body transition-colors duration-150 ease-state hover:border-accent-line hover:text-accent-hover"
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  Source
                </span>
                <span className="mt-0.5 block truncate font-sans text-[13px]">
                  {component.source_repo || component.source_url}
                </span>
              </span>
              <ExternalIcon size={15} className="shrink-0" />
            </a>
          )}
          {contributedBy && (
            <p className="mt-2 px-1 text-[12px] text-ink-muted">Contributed by {contributedBy}</p>
          )}
        </aside>
      </div>
    </ContentWidth>
  );
}

function MetaRow({
  label,
  children,
  stack = false,
}: {
  label: string;
  children: React.ReactNode;
  stack?: boolean;
}) {
  return (
    <div
      className={`py-2.5 first:pt-0 last:pb-0 ${
        stack ? "" : "flex items-center justify-between gap-3"
      }`}
    >
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {label}
      </dt>
      <dd className={stack ? "mt-2" : ""}>{children}</dd>
    </div>
  );
}
