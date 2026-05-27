import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import {
  findEngram,
  getEngrams,
  getNameIndex,
  readEngramBody,
} from "@/lib/catalog";
import { buildNeighborhood } from "@/lib/graph";
import { CATEGORY_LABEL, type Engram } from "@/lib/types";
import { CliChip, MaturityBadge, TagChip, TypePill } from "@/components/badges";
import { EngramCard } from "@/components/engram-card";
import { InstallStrip } from "@/components/install-strip";
import { SynapseGraph } from "@/components/synapse-graph";
import {
  ArrowLeftIcon,
  ExternalIcon,
  StarIcon,
  TypeIcon,
} from "@/components/icons";

interface RouteParams {
  type: string;
  slug: string;
}

// PERFORMANCE: do NOT statically pre-render every engram — the catalog grows to
// thousands and that would blow up build time. Pre-render only the top ~200 (by
// synapse degree + stars), and serve the long tail on-demand via ISR.
const PRERENDER_CAP = 200;
export const dynamicParams = true;
export const revalidate = 3600; // re-validate on-demand pages hourly

export function generateStaticParams(): RouteParams[] {
  const engrams = getEngrams();
  const degree = new Map<string, number>();
  for (const e of engrams)
    for (const r of e.related)
      degree.set(r, (degree.get(r) ?? 0) + 1);

  return [...engrams]
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
  const engram = findEngram(type, slug);
  if (!engram) return { title: "Not found — Armory" };
  return {
    title: `${engram.name} — Armory`,
    description: engram.description,
  };
}

export default async function EngramDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { type, slug } = await params;
  const engram = findEngram(type, slug);
  if (!engram) notFound();

  const body = readEngramBody(engram);
  const html = body
    ? await marked.parse(body, { async: true, gfm: true, breaks: false })
    : "";

  const allEngrams = getEngrams();
  const nameIndex = getNameIndex();
  const neighborhood = buildNeighborhood(allEngrams, engram.name);
  const relatedEngrams: Engram[] = engram.related
    .map((r) => allEngrams.find((e) => e.name === r))
    .filter((e): e is Engram => Boolean(e));

  return (
    <article className="mx-auto max-w-[1240px] px-5 pb-24 pt-28">
      <Link
        href="/browse"
        className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-accent-hover"
      >
        <ArrowLeftIcon size={15} />
        Browse
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        {/* ── Main column ───────────────────────────────────────────── */}
        <div className="min-w-0">
          {/* Header */}
          <header>
            <span className="inline-flex items-center gap-2">
              <TypeIcon type={engram.type} size={18} className="text-accent" />
              <TypePill type={engram.type} />
            </span>
            <h1 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-[-0.02em] text-ink-hi">
              {engram.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-body">
              {engram.description}
            </p>
          </header>

          {/* Install strip */}
          <div className="mt-8">
            <InstallStrip slug={engram.name} cliCompat={engram.cli_compat} />
          </div>

          {/* Markdown body from the brain vault */}
          {html ? (
            <div
              className="engram-prose mt-10"
              // Build-time repo content authored by maintainers — trusted.
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="mt-10 text-sm text-ink-muted">
              No detailed write-up yet for this engram.
            </p>
          )}

          {/* Synapses — local subgraph + related cards */}
          {(neighborhood.nodes.length > 1 || relatedEngrams.length > 0) && (
            <section className="mt-12 border-t border-line-subtle pt-8">
              <h2 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] leading-none tracking-[-0.015em] text-ink-hi">
                Synapses.
              </h2>
              <p className="mt-1.5 text-sm text-ink-muted">
                The 1-hop neighbourhood around this engram — a small region of the
                brain.
              </p>

              {neighborhood.nodes.length > 1 && (
                <div className="mt-5 overflow-hidden rounded-2xl bg-raise-1 p-1.5 ring-1 ring-line-subtle">
                  <div className="rounded-[calc(1.25rem-0.375rem)] bg-base/40">
                    <SynapseGraph
                      data={neighborhood}
                      className="h-[300px] w-full"
                    />
                  </div>
                </div>
              )}

              {relatedEngrams.length > 0 && (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {relatedEngrams.map((rel) => (
                    <EngramCard key={`${rel.type}/${rel.name}`} engram={rel} />
                  ))}
                </div>
              )}

              {/* Unresolved synapses (named relations with no engram yet). */}
              {engram.related.some((r) => !nameIndex.has(r)) && (
                <div className="mt-5">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink-muted">
                    Synapses not yet filled
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {engram.related
                      .filter((r) => !nameIndex.has(r))
                      .map((r) => (
                        <li key={r}>
                          <span
                            className="inline-flex items-center rounded-lg border border-dashed border-line px-3 py-1.5 font-mono text-sm text-ink-muted"
                            title="No engram with this name exists yet."
                          >
                            {r}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>

        {/* ── Meta rail (Double-Bezel panel) ────────────────────────── */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl bg-raise-1 p-1.5 ring-1 ring-line-subtle">
            <dl className="divide-y divide-line-subtle rounded-[calc(1.25rem-0.375rem)] bg-raise-2 p-5">
              <MetaRow label="Maturity">
                <MaturityBadge maturity={engram.maturity} />
              </MetaRow>
              {typeof engram.stars === "number" && (
                <MetaRow label="Stars">
                  <span className="inline-flex items-center gap-1.5 tabular-nums text-ink-body">
                    <StarIcon size={13} className="text-accent" />
                    {engram.stars.toLocaleString()}
                  </span>
                </MetaRow>
              )}
              {typeof engram.eval_score === "number" && (
                <MetaRow label="Eval score">
                  <span className="tabular-nums text-accent-hover">
                    {engram.eval_score.toFixed(2)}
                  </span>
                </MetaRow>
              )}
              {engram.license && engram.license !== "unknown" && (
                <MetaRow label="License">
                  <span className="text-ink-body">{engram.license}</span>
                </MetaRow>
              )}
              {engram.verified_at && (
                <MetaRow label="Verified">
                  <span className="font-mono text-[13px] text-ink-body">
                    {engram.verified_at}
                  </span>
                </MetaRow>
              )}
              {engram.cli_compat.length > 0 && (
                <MetaRow label="Works in" stack>
                  <div className="flex flex-wrap gap-1.5">
                    {engram.cli_compat.map((cli) => (
                      <CliChip key={cli} cli={cli} />
                    ))}
                  </div>
                </MetaRow>
              )}
              {engram.tags.length > 0 && (
                <MetaRow label="Tags" stack>
                  <div className="flex flex-wrap gap-1.5">
                    {engram.tags.map((tag) => (
                      <TagChip key={tag} tag={tag} />
                    ))}
                  </div>
                </MetaRow>
              )}
            </dl>
          </div>

          {engram.source_url && (
            <a
              href={engram.source_url}
              target="_blank"
              rel="noreferrer noopener"
              className="group mt-3 flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-line px-4 py-3 text-sm text-ink-body transition-colors hover:border-accent-line hover:text-accent-hover"
            >
              <span className="truncate font-mono text-[13px]">
                {engram.source_repo || "source"}
              </span>
              <ExternalIcon size={15} />
            </a>
          )}
        </aside>
      </div>
    </article>
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
        stack
          ? ""
          : "flex items-center justify-between gap-3"
      }`}
    >
      <dt className="text-[11px] uppercase tracking-[0.15em] text-ink-muted">
        {label}
      </dt>
      <dd className={stack ? "mt-2" : ""}>{children}</dd>
    </div>
  );
}
