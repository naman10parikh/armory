import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/types";
import { buildGraph } from "@/lib/graph";
import { CategoryBento } from "@/components/category-bento";
import { BuildFlow } from "@/components/build-flow";
import { CopyCommand } from "@/components/copy-command";
import { MagneticCta } from "@/components/magnetic-cta";
import { CountUp } from "@/components/count-up";
import { Reveal } from "@/components/reveal";
import { SynapseGraph } from "@/components/synapse-graph";
import { ArrowRightIcon, SearchIcon } from "@/components/icons";

// The landing page. Server component — counts + a SAMPLED graph come straight
// from catalog.json at build time. The hero graph is a ≤30-node teaser; the full
// graph section samples a larger (still bounded) subset. Editorial, asymmetric.
export default function HomePage() {
  const { components, counts, generated_at } = getCatalog();
  const total = counts.total;
  const heroGraph = buildGraph(components, 30);
  const sectionGraph = buildGraph(components, 160);
  // Show the catalog's own date as data instead of claiming "kept current" in
  // prose. The empty-catalog fallback stamps the epoch — don't print 1970.
  const indexed = generated_at > "2000" ? generated_at.slice(0, 10) : null;

  return (
    <div className="overflow-x-clip">
      {/* ── Hero (split: copy left, live synapse graph right) ──────────── */}
      <section className="mx-auto grid min-h-[100dvh] max-w-[1240px] grid-cols-1 items-center gap-10 px-5 pb-16 pt-28 md:grid-cols-12 md:gap-8 md:pt-24">
        <div className="md:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-line bg-accent-quiet px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-hover animate-fade-up">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
            not an aggregator for humans
          </span>

          <h1 className="mt-6 font-serif text-[clamp(3rem,7vw+1rem,5.75rem)] font-normal leading-[0.97] tracking-[-0.02em] text-ink-hi animate-fade-up">
            Where agents gear up.
          </h1>

          <p className="mt-5 text-base leading-relaxed text-ink-body sm:text-lg">
            The <span className="text-ink-hi">ranked</span> index of every
            open-source building block for the agent stack — crawled, scored and
            kept current by agents.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <MagneticCta
              href="/leaderboard"
              icon={<ArrowRightIcon size={15} className="text-base" />}
            >
              See the leaderboard
            </MagneticCta>
            <Link
              href="/browse"
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-body transition-colors hover:text-accent-hover"
            >
              <SearchIcon size={16} />
              Browse the catalog
            </Link>
          </div>

          <dl className="mt-10 flex flex-wrap items-baseline gap-x-12 gap-y-6">
            <Stat label="ranked" value={<CountUp value={total} />} />
            <Stat label="categories" value={<CountUp value={CATEGORIES.length} />} />
            {indexed && <Stat label="last indexed" value={indexed} />}
          </dl>
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

      {/* ── 12-category bento ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-5 pb-12 pt-4">
        <div className="hairline mb-12 h-px w-full" />
        <Reveal className="mb-9">
          <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] leading-none tracking-[-0.015em] text-ink-hi">
            Twelve regions of the brain.
          </h2>
        </Reveal>
        <CategoryBento counts={counts} />
      </section>

      {/* ── How it's built ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-5 py-24">
        <Reveal className="mb-9">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
            how it&apos;s built
          </span>
          <h2 className="mt-2 font-serif text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight tracking-[-0.015em] text-ink-hi">
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
              the map
            </span>
            <h2 className="mt-2 font-serif text-[clamp(1.75rem,3.5vw,2.75rem)] leading-none tracking-[-0.015em] text-ink-hi">
              How the pieces connect.
            </h2>
          </div>
          <Link
            href="/graph"
            className="hidden cursor-pointer items-center gap-1.5 text-sm font-medium text-ink-body transition-colors hover:text-accent-hover sm:inline-flex"
          >
            How the index grew
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
                  The graph forms as components are indexed.
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Quickstart ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-5 py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
            quickstart
          </span>
          <h2 className="mt-2 font-serif text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight tracking-[-0.015em] text-ink-hi">
            Recall from the terminal.
          </h2>
          <div className="mt-7 space-y-3 text-left">
            <CopyCommand command="armory search browser automation" />
            <CopyCommand command="armory install playwright-mcp --cli claude" />
          </div>
        </Reveal>
      </section>
    </div>
  );
}

// One hero stat: micro-label over a mono number. Replaces the sentence that
// used to describe the same figures.
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
        {label}
      </dt>
      <dd className="mt-1.5 font-mono text-[clamp(1.5rem,2.2vw,2rem)] leading-none text-ink-hi">
        {value}
      </dd>
    </div>
  );
}
