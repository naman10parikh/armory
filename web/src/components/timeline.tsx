// The editorial "how the index grew" timeline. A SERVER component — every number
// is computed from catalog.json at build time and handed in by the page. There are
// NO dates: this is the LAYERS the Armory is built from, in the order an agent meets
// them, not a dated history. Warm-black + Synapse-Amber, inline styles + CSS-var
// tokens, serif milestone titles via var(--font-display) — the leaderboard house style.

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
  types: Tally[]; // the 12 component kinds, real per-type counts, sorted desc
  starsSignal: number; // components carrying a measured popularity signal
  verticals: string[]; // the 12 industry buckets (display labels)
}

// The Universal-score weighting is the ranking FORMULA (engine constants in
// lib/rank.mjs), not a catalog aggregate: a passing test counts most, then community
// mentions, then stars, then usage. Static on purpose — it describes the math.
const SIGNAL_WEIGHTS: readonly string[] = [
  "a passing test ×1.4",
  "community mentions ×1.2",
  "GitHub stars ×1.0",
  "usage ×0.9",
];

// The three ways the one catalog is read. All three ship (README: the site, the
// `armory` CLI, and the armory-mcp server all read one generated catalog.json).
const SURFACES: readonly { name: string; detail: string }[] = [
  { name: "REST", detail: "/api/rank · /api/search" },
  { name: "CLI", detail: "armory rank · armory search" },
  { name: "MCP", detail: "armory-mcp — live search + install" },
];

const nf = (n: number): string => n.toLocaleString("en-US");

// ── shared inline styles (CSS-var tokens only — the leaderboard palette) ─────────
const eyebrow: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  color: "var(--accent)",
};
const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-display), Georgia, serif",
  fontSize: "clamp(1.6rem, 3.2vw, 2.35rem)",
  lineHeight: 1.08,
  letterSpacing: "-0.02em",
  color: "var(--text-hi)",
  margin: "8px 0 0",
};
const lead: React.CSSProperties = {
  color: "var(--text-body)",
  fontSize: 15,
  lineHeight: 1.6,
  margin: "10px 0 0",
  maxWidth: "62ch",
};
const bigFigure: React.CSSProperties = {
  fontFamily: "var(--font-display), Georgia, serif",
  fontSize: "clamp(2.1rem, 5vw, 3rem)",
  lineHeight: 1,
  letterSpacing: "-0.03em",
  color: "var(--accent-hover)",
  fontVariantNumeric: "tabular-nums",
};
const figureCaption: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: 12.5,
  marginTop: 4,
};
const subhead: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--text-muted)",
  margin: "0 0 8px",
};
const card: React.CSSProperties = {
  background: "var(--bg-raise-1)",
  border: "1px solid var(--line-subtle)",
  borderRadius: 12,
  padding: "14px 16px",
};
const chip: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: 12.5,
  color: "var(--text-body)",
  background: "var(--bg-raise-1)",
  border: "1px solid var(--line-default)",
  borderRadius: 999,
  padding: "5px 11px",
  whiteSpace: "nowrap",
};

// One "label ————— count" row with a hairline baseline (used for sources + kinds).
function TallyRow({ label, count }: Tally): React.ReactElement {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        padding: "6px 0",
        borderBottom: "1px solid var(--line-subtle)",
      }}
    >
      <span style={{ color: "var(--text-body)", fontSize: 13.5, minWidth: 0, overflowWrap: "anywhere" }}>
        {label}
      </span>
      <span
        style={{
          color: "var(--text-hi)",
          fontSize: 13.5,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
        }}
      >
        {nf(count)}
      </span>
    </div>
  );
}

interface Milestone {
  eyebrow: string;
  title: string;
  lead: string;
  figure: React.ReactNode;
}

export function Timeline({ data }: { data: TimelineData }): React.ReactElement {
  // Milestones = the layers, assembled from real catalog numbers + static structure.
  const milestones: Milestone[] = [
    {
      eyebrow: "where it came from",
      title: "The sources.",
      lead: "Agents crawl the major MCP registries and the best hand-curated GitHub collections, then dedupe and merge everything into one catalog — so the shelf is the whole open ecosystem, not one person's list.",
      figure: (
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div style={card}>
            <p style={subhead}>Registries crawled</p>
            {data.registries.map((r) => (
              <TallyRow key={r.label} label={r.label} count={r.count} />
            ))}
          </div>
          <div style={card}>
            <p style={subhead}>Curated collections</p>
            {data.collections.map((c) => (
              <TallyRow key={c.label} label={c.label} count={c.count} />
            ))}
          </div>
        </div>
      ),
    },
    {
      eyebrow: "what it holds",
      title: "The components.",
      lead: "Every entry is one building block, sorted into twelve kinds. The last four — CLIs, evals, observability, infrastructure — are exactly what every other list under-covers.",
      figure: (
        <div style={card}>
          <div style={{ display: "grid", gap: "0 24px", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
            {data.types.map((t) => (
              <TallyRow key={t.label} label={t.label} count={t.count} />
            ))}
          </div>
        </div>
      ),
    },
    {
      eyebrow: "one score, fairly",
      title: "The ranking.",
      lead: "Every component gets one Universal score. Each signal becomes a 0–100 percentile and blends by weight — and each piece is judged on the signal natural to its kind (stars for a repo, usage for a registry MCP, mentions for a community pick), never forced onto one shared stars column. More independent signals, more confidence.",
      figure: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SIGNAL_WEIGHTS.map((w) => (
            <span key={w} style={chip}>
              {w}
            </span>
          ))}
        </div>
      ),
    },
    {
      eyebrow: "which industry",
      title: "The verticals.",
      lead: "Each component is also scored for the industry sector it serves, so an agent can ask for exactly its domain — or stay industry-agnostic when a building block is horizontal.",
      figure: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {data.verticals.map((v) => (
            <span key={v} style={chip}>
              {v}
            </span>
          ))}
        </div>
      ),
    },
    {
      eyebrow: "how agents reach it",
      title: "The query surface.",
      lead: "The same catalog is readable three ways — the numbers on this page are computed from it the moment the page is built, never hand-typed.",
      figure: (
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {SURFACES.map((s) => (
            <div key={s.name} style={card}>
              <p style={{ ...subhead, color: "var(--accent)", margin: 0 }}>{s.name}</p>
              <p
                style={{
                  fontFamily: "var(--font-mono), ui-monospace, Menlo, monospace",
                  fontSize: 12.5,
                  color: "var(--text-body)",
                  margin: "6px 0 0",
                  overflowWrap: "anywhere",
                }}
              >
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      ),
    },
  ];

  // Each milestone's amber headline number — a real count (or the size of the bucket
  // / surface set for the two structural layers), with a plain-language caption.
  const headline: (Milestone & { big: string; cap: string })[] = milestones.map((m, i) => {
    const big =
      i === 0
        ? nf(data.distinctRepos)
        : i === 1
          ? nf(data.total)
          : i === 2
            ? nf(data.starsSignal)
            : i === 3
              ? String(data.verticals.length)
              : String(SURFACES.length);
    const cap =
      i === 0
        ? "distinct source repositories, deduped"
        : i === 1
          ? "building blocks across twelve kinds"
          : i === 2
            ? "carry a measured popularity signal today"
            : i === 3
              ? "industry buckets"
              : "ways to recall the one catalog";
    return { ...m, big, cap };
  });

  return (
    <ol style={{ listStyle: "none", margin: "40px 0 0", padding: 0, maxWidth: 880 }}>
      {headline.map((m, i) => (
        <li
          key={m.title}
          style={{
            position: "relative",
            marginLeft: 7,
            paddingLeft: 30,
            paddingBottom: i === headline.length - 1 ? 0 : 44,
            // The rail: each item draws the connector down to the next dot; the last
            // item's border is transparent so the line ends exactly at its dot.
            borderLeft: "1px solid",
            borderColor: i === headline.length - 1 ? "transparent" : "var(--line-default)",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: -7,
              top: 4,
              width: 13,
              height: 13,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 0 4px var(--bg-base)",
            }}
          />
          <p style={eyebrow}>{`Layer ${i + 1} — ${m.eyebrow}`}</p>
          <h2 style={titleStyle}>{m.title}</h2>
          <p style={lead}>{m.lead}</p>

          <div style={{ margin: "18px 0 16px" }}>
            <span style={bigFigure}>{m.big}</span>
            <p style={figureCaption}>{m.cap}</p>
          </div>

          {m.figure}
        </li>
      ))}
    </ol>
  );
}
