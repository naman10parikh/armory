// The pipeline: the layers the catalog is built from (/pipeline). A SERVER component — every number is
// computed from catalog.json at build time and handed in by the page. There
// are NO dates: this is the LAYERS the Armory is built from, in the order an
// agent meets them, not a dated history. Tokenised classes only (design/BRIEF.md
// §6/§10.11) — no inline var(--…) objects, no oklch() literals.

// A label paired with its real count from the catalog (a source's contribution, a
// component-kind tally). Exported so the page can build the arrays it passes in.
export interface Tally {
  label: string;
  count: number;
}

// Everything the timeline draws, derived from the catalog by the page. No invented
// values — an aggregate that can't be computed cleanly is described in prose instead.
export interface TimelineData {
  total: number; // canonical catalog total (counts.total)
  registries: Tally[]; // MCP registries crawled, by tagged (non-overlapping) count
  collections: Tally[]; // top hand-curated source repos, by count
  distinctRepos: number; // distinct source repositories, deduped into the catalog
  types: Tally[]; // the 11 harness components, named as on /c, with their row counts, sorted desc
  ranked: number; // components the engine ranks: at least one signal (lib/rank.mjs)
  signals: string[]; // the signals the engine scores on, in its own order (lib/rank.mjs WEIGHTS)
  blend: { base: number; others: number }; // the engine's blend (lib/rank.mjs BLEND)
  verticals: string[]; // the 12 industry buckets (display labels)
}

// The three ways the one catalog is read. All three ship (README: the site, the
// `armory` CLI, and the armory-mcp server all read one generated catalog.json).
const SURFACES: readonly { name: string; detail: string }[] = [
  { name: "REST", detail: "/api/rank · /api/search" },
  { name: "CLI", detail: "armory rank · armory search" },
  { name: "MCP", detail: "armory-mcp · search, rank, get, submit" },
];

const nf = (n: number): string => n.toLocaleString("en-US");

/** One "label ————— count" row with a hairline baseline. Count is machine-readable. */
function TallyRow({ label, count }: Tally): React.ReactElement {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line-subtle py-1.5 last:border-b-0">
      <span className="min-w-0 break-words text-[13px] text-ink-body">{label}</span>
      <data value={String(count)} className="shrink-0 font-sans text-[13px] font-semibold tabular-nums text-ink-hi">
        {nf(count)}
      </data>
    </div>
  );
}

/** Quiet uppercase label — the Label type step (§5), used for group headers. */
function SubLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{children}</p>;
}

/** Card ground for a grouped block of tallies or chips. */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line-subtle bg-raise-1 p-4 ${className}`}>{children}</div>;
}

/** Informational pill — chip labels, never interactive here, so neutral not amber. */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-line bg-raise-1 px-2.5 py-1 text-[12px] text-ink-body">
      {children}
    </span>
  );
}

interface Milestone {
  title: string; // H2, ≤3 words, no terminal punctuation (COPY.md R2, R4); the eyebrow is "Layer N"
  lead: string;
  figure: React.ReactNode;
}

export function Timeline({ data }: { data: TimelineData }): React.ReactElement {
  // Milestones = the layers, assembled from real catalog numbers + static structure.
  const milestones: Milestone[] = [
    {
      title: "Sources",
      lead: `Agents crawl ${data.registries.length} MCP registries and hand-curated GitHub collections, then dedupe and merge them into one catalog.`,
      figure: (
        <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <Card>
            <SubLabel>Registries Crawled</SubLabel>
            {data.registries.map((r) => (
              <TallyRow key={r.label} label={r.label} count={r.count} />
            ))}
          </Card>
          <Card>
            <SubLabel>Curated Collections</SubLabel>
            {data.collections.map((c) => (
              <TallyRow key={c.label} label={c.label} count={c.count} />
            ))}
          </Card>
        </div>
      ),
    },
    {
      title: "Components",
      lead: `Each entry sits in one of ${data.types.length} harness components, named as on the Components page.`,
      figure: (
        <Card>
          <div className="grid gap-x-6 gap-y-0 [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
            {data.types.map((t) => (
              <TallyRow key={t.label} label={t.label} count={t.count} />
            ))}
          </div>
        </Card>
      ),
    },
    {
      title: "Ranking",
      lead: `Components with at least one public signal get a Score: each signal becomes a 0–100 percentile within its own kind, then the strongest counts ${data.blend.base} and the second strongest ${data.blend.others}. More signals, more confidence.`,
      figure: (
        <div className="flex flex-wrap gap-2">
          {data.signals.map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
      ),
    },
    {
      title: "Verticals",
      lead: "Components are also tagged with the industry they serve, so an agent can filter by vertical or ignore it.",
      figure: (
        <div className="flex flex-wrap gap-2">
          {data.verticals.map((v) => (
            <Chip key={v}>{v}</Chip>
          ))}
        </div>
      ),
    },
    {
      title: "Query Surface",
      lead: "The same catalog is readable three ways.",
      figure: (
        <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {SURFACES.map((s) => (
            <Card key={s.name}>
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{s.name}</p>
              <p className="mt-1.5 break-words font-sans text-[12.5px] text-ink-body">{s.detail}</p>
            </Card>
          ))}
        </div>
      ),
    },
  ];

  // Each milestone's headline number — a real count (or the size of the bucket /
  // surface set for the two structural layers), with a plain-language caption.
  const headline: (Milestone & { big: number; cap: string })[] = milestones.map((m, i) => {
    const big =
      i === 0 ? data.distinctRepos
      : i === 1 ? data.total
      : i === 2 ? data.ranked
      : i === 3 ? data.verticals.length
      : SURFACES.length;
    const cap =
      i === 0 ? "Distinct source repositories, deduped"
      : i === 1 ? `In the catalog, across ${data.types.length} harness components`
      : i === 2 ? "Ranked on at least one signal"
      : i === 3 ? "Industry verticals"
      : "Ways to reach the one catalog";
    return { ...m, big, cap };
  });

  return (
    <ol className="m-0 mt-8 max-w-[880px] list-none p-0">
      {headline.map((m, i) => (
        <li
          key={m.title}
          className={`relative ml-[7px] border-l pl-[30px] ${
            i === headline.length - 1 ? "border-transparent pb-0" : "border-line pb-11"
          }`}
        >
          <span
            aria-hidden
            className="absolute -left-[7px] top-1 h-[13px] w-[13px] rounded-full bg-ink-muted ring-4 ring-canvas"
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{`Layer ${i + 1}`}</p>
          <h2 className="mt-1.5 text-[24px] font-semibold leading-[1.15] tracking-[-0.01em] text-ink-hi">
            {m.title}
          </h2>
          <p className="mt-2.5 max-w-[62ch] text-[15px] leading-[1.6] text-ink-body">{m.lead}</p>

          <div className="my-4">
            <data value={String(m.big)} className="font-sans text-[32px] font-semibold leading-none tracking-[-0.01em] tabular-nums text-ink-hi">
              {nf(m.big)}
            </data>
            <p className="mt-1.5 text-[12.5px] text-ink-muted">{m.cap}</p>
          </div>

          {m.figure}
        </li>
      ))}
    </ol>
  );
}
