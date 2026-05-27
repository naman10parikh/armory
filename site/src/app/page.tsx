import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { buildGraph } from "@/lib/graph";
import { CategoryBento } from "@/components/category-bento";
import { BuildFlow } from "@/components/build-flow";
import { CopyCommand } from "@/components/copy-command";
import { MagneticCta } from "@/components/magnetic-cta";
import { CountUp } from "@/components/count-up";
import { Reveal } from "@/components/reveal";
import { SynapseGraph } from "@/components/synapse-graph";
import { ArrowRightIcon, GraphIcon, SearchIcon } from "@/components/icons";

// The landing page. Server component — counts + a SAMPLED graph come straight
// from catalog.json at build time. The hero graph is a ≤30-node teaser; the full
// graph section samples a larger (still bounded) subset. Editorial, asymmetric.
export default function HomePage() {
  const { engrams, counts } = getCatalog();
  const total = counts.total;
  const heroGraph = buildGraph(engrams, 30);
  const sectionGraph = buildGraph(engrams, 160);

  return (
    <div className="overflow-x-clip">
      {/* ── Hero (split: copy left, live synapse graph right) ──────────── */}
      <section className="mx-auto grid min-h-[100dvh] max-w-[1240px] grid-cols-1 items-center gap-10 px-5 pb-16 pt-28 md:grid-cols-12 md:gap-8 md:pt-24">
        <div className="md:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-line bg-accent-quiet px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-hover animate-fade-up">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
            not an aggregator for humans
          </span>

          <h1 className="mt-6 max-w-2xl font-serif text-[clamp(3rem,7vw+1rem,5.75rem)] font-normal leading-[0.97] tracking-[-0.02em] text-ink-hi animate-fade-up">
            Where agents gear up.
          </h1>

          <p className="mt-5 font-serif text-[clamp(1.5rem,2.5vw,2.25rem)] italic leading-tight text-accent-hover animate-fade-up">
            For agents, by agents, of agents.
          </p>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-body sm:text-lg">
            Armory is the open, self-improving registry of every agent-harness
            component —{" "}
            <span className="text-ink-hi">
              MCPs, skills, hooks, sub-agents, memory, evals, observability,
              infrastructure
            </span>{" "}
            — and the workflows that compose them. Your coding agent recalls the
            right piece straight into its harness. It is part of the harness, not
            a bookmark.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
            <MagneticCta
              href="/browse"
              icon={<ArrowRightIcon size={15} className="text-base" />}
            >
              <SearchIcon size={15} className="text-base" />
              Gear up
            </MagneticCta>
            <Link
              href="/graph"
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-body transition-colors hover:text-accent-hover"
            >
              <GraphIcon size={16} />
              See the synapse graph
            </Link>
          </div>

          <p className="mt-7 font-mono text-[13px] text-ink-muted">
            <CountUp value={total} className="text-ink-hi" /> engram
            {total === 1 ? "" : "s"} indexed · 12 categories · self-evolving
          </p>
        </div>

        {/* Live mini synapse-graph (the signature moment). */}
        <div className="relative md:col-span-5">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(28rem_20rem_at_50%_45%,var(--accent-quiet),transparent_70%)]"
          />
          {heroGraph.nodes.length > 0 ? (
            <SynapseGraph
              data={heroGraph}
              interactive={false}
              className="aspect-square w-full"
            />
          ) : (
            <div className="aspect-square w-full rounded-2xl ring-1 ring-line-subtle" />
          )}
        </div>
      </section>

      {/* ── The pitch ──────────────────────────────────────────────────── */}
      <Reveal as="section" className="mx-auto max-w-[1240px] px-5 py-24">
        <div className="hairline mb-12 h-px w-full" />
        <p className="max-w-3xl font-serif text-[clamp(1.75rem,3vw,2.75rem)] leading-tight text-ink-body">
          This is not a list for people to skim. It is a{" "}
          <span className="text-accent-hover">brain you can read</span> — a graph
          of recallable components, verified and scored, that an agent queries to{" "}
          <span className="text-ink-hi">improve its own harness</span> while you
          sleep.
        </p>
      </Reveal>

      {/* ── 12-category bento ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-5 py-12">
        <Reveal className="mb-9 flex items-end justify-between gap-6">
          <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] leading-none tracking-[-0.015em] text-ink-hi">
            Twelve regions of the brain.
          </h2>
          <p className="hidden max-w-xs text-right text-sm leading-snug text-ink-muted sm:block">
            CLIs, Evals, Observability, and Infrastructure are exactly what every
            other list under-covers. That is the wedge.
          </p>
        </Reveal>
        <CategoryBento counts={counts} />
      </section>

      {/* ── How it's built ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-5 py-24">
        <Reveal className="mb-9">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
            how it&apos;s built
          </span>
          <h2 className="mt-2 max-w-2xl font-serif text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight tracking-[-0.015em] text-ink-hi">
            One vault. One catalog. Three ways to recall it.
          </h2>
        </Reveal>
        <BuildFlow />
      </section>

      {/* ── Live graph teaser ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-5 py-12">
        <Reveal className="mb-6 flex items-end justify-between gap-6">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
              the synapses
            </span>
            <h2 className="mt-2 font-serif text-[clamp(1.75rem,3.5vw,2.75rem)] leading-none tracking-[-0.015em] text-ink-hi">
              Every related[] is an edge.
            </h2>
          </div>
          <Link
            href="/graph"
            className="hidden cursor-pointer items-center gap-1.5 text-sm font-medium text-ink-body transition-colors hover:text-accent-hover sm:inline-flex"
          >
            Open full graph
            <ArrowRightIcon size={14} />
          </Link>
        </Reveal>
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-raise-1 p-1.5 ring-1 ring-line-subtle">
            <div className="rounded-[calc(1.25rem-0.375rem)] bg-base/40">
              {sectionGraph.nodes.length > 0 ? (
                <SynapseGraph
                  data={sectionGraph}
                  className="h-[420px] w-full"
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-sm text-ink-muted">
                  The graph forms as engrams are indexed.
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Quickstart ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-5 py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
            quickstart
          </span>
          <h2 className="mt-2 font-serif text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight tracking-[-0.015em] text-ink-hi">
            Recall from the terminal.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Search and install engrams without leaving your agent&apos;s shell.
          </p>
          <div className="mt-7 space-y-3 text-left">
            <CopyCommand command="npx engram search browser automation" />
            <CopyCommand command="npx engram install playwright-mcp" />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
