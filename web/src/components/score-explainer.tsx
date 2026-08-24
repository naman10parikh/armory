// Visual pieces for /formula — how the Universal score works, shown rather than described.
// Every number is passed in from the page, which computes it from catalog.json at build time.
// Warm-black + amber, serif headings, data-forward. No prose blocks.

const SERIF = "var(--font-display), Georgia, serif";
const MONO = "var(--font-mono), ui-monospace, Menlo, monospace";

export interface SignalCard {
  glyph: string;
  key: string;
  what: string;
  who: string;
  weight: number;
  rows: number;
  pctOfCatalog: number;
}

export interface Rung {
  raw: string;
  pct: number;
  note?: string;
}

export interface Contender {
  name: string;
  headline: string;
  headlineLabel: string;
  signals: number;
  score: number;
  verdict: string;
}

export interface Worked {
  name: string;
  parts: string;
  math: string;
  score: string;
  tier: string;
}

const sectionTitle: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: 30,
  color: "var(--text-hi)",
  letterSpacing: "-0.015em",
  margin: "0 0 6px",
};
const lead: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: 15,
  margin: "0 0 24px",
  lineHeight: 1.5,
};
const eyebrow: React.CSSProperties = {
  fontSize: 10.5,
  textTransform: "uppercase",
  letterSpacing: "0.11em",
  color: "var(--accent)",
  fontWeight: 600,
  margin: "0 0 8px",
};

export function Section({
  n,
  title,
  lead: leadText,
  children,
}: {
  n: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ margin: "0 0 72px" }}>
      <div style={eyebrow}>{n}</div>
      <h2 style={sectionTitle}>{title}</h2>
      <p style={lead}>{leadText}</p>
      {children}
    </section>
  );
}

/** The four signals, each with a bar showing how much of the catalog actually carries it. */
export function Signals({ cards }: { cards: SignalCard[] }) {
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
      {cards.map((c) => (
        <div
          key={c.key}
          style={{
            border: "1px solid var(--line-default)",
            borderRadius: 14,
            background: "var(--bg-raise-1)",
            padding: "16px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ color: "var(--accent)", fontSize: 16 }}>{c.glyph}</span>
            <span style={{ color: "var(--text-hi)", fontWeight: 600, fontSize: 15 }}>{c.key}</span>
            <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 11.5, color: "var(--text-muted)" }}>
              ×{c.weight}
            </span>
          </div>
          <div style={{ color: "var(--text-body)", fontSize: 13.5, marginTop: 6 }}>{c.what}</div>
          <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>{c.who}</div>
          <div style={{ marginTop: 14 }}>
            <div style={{ height: 6, borderRadius: 3, background: "var(--line-subtle)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.max(c.pctOfCatalog, 0.4)}%`,
                  height: "100%",
                  background: "var(--accent)",
                  borderRadius: 3,
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--text-body)" }}>
                {c.rows.toLocaleString()} of the catalog
              </span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--text-muted)" }}>
                {c.pctOfCatalog.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Raw number → percentile. The ladder makes the compression obvious at a glance. */
export function Ladder({ rungs, unit }: { rungs: Rung[]; unit: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--line-default)",
        borderRadius: 14,
        background: "var(--bg-raise-1)",
        padding: "18px 20px",
      }}
    >
      {rungs.map((r) => (
        <div
          key={r.raw}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(96px, 120px) 1fr minmax(52px, auto)",
            alignItems: "center",
            gap: 14,
            padding: "7px 0",
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 13, color: "var(--text-body)", textAlign: "right" }}>
            {r.raw} {unit}
          </span>
          <span style={{ position: "relative", height: 8 }}>
            <span
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 4,
                background: "var(--line-subtle)",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: `${r.pct}%`,
                borderRadius: 4,
                background: "var(--accent)",
              }}
            />
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 13,
              color: r.note ? "var(--accent-hover)" : "var(--text-muted)",
            }}
          >
            p{r.pct}
          </span>
          {r.note ? (
            <span
              style={{
                gridColumn: "2 / 4",
                fontSize: 11.5,
                color: "var(--text-muted)",
                marginTop: -2,
              }}
            >
              {r.note}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** The money visual: more stars, lower score — because one signal can be luck. */
export function HeadToHead({ left, right }: { left: Contender; right: Contender }) {
  const card = (c: Contender, win: boolean): React.ReactElement => (
    <div
      style={{
        border: `1px solid ${win ? "var(--accent-line)" : "var(--line-default)"}`,
        borderRadius: 16,
        background: "var(--bg-raise-1)",
        padding: "22px 24px",
        flex: "1 1 260px",
      }}
    >
      <div style={{ fontFamily: MONO, fontSize: 12, color: "var(--text-muted)" }}>{c.headlineLabel}</div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 40,
          color: win ? "var(--accent)" : "var(--text-hi)",
          lineHeight: 1.05,
          margin: "2px 0 4px",
        }}
      >
        {c.headline}
      </div>
      <div style={{ color: "var(--text-hi)", fontWeight: 600, fontSize: 15 }}>{c.name}</div>
      <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>
        {c.signals} independent signal{c.signals === 1 ? "" : "s"}
      </div>
      <div style={{ marginTop: 16, height: 8, borderRadius: 4, background: "var(--line-subtle)" }}>
        <div
          style={{
            width: `${c.score}%`,
            height: "100%",
            borderRadius: 4,
            background: win ? "var(--accent)" : "var(--text-muted)",
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 22, color: "var(--text-hi)" }}>{c.score}</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.verdict}</span>
      </div>
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "stretch" }}>
      {card(left, false)}
      {card(right, true)}
    </div>
  );
}

/** Real rows, real arithmetic — the proof that the formula is not a black box. */
export function WorkedTable({ rows }: { rows: Worked[] }) {
  const th: React.CSSProperties = {
    textAlign: "left",
    fontSize: 10.5,
    textTransform: "uppercase",
    letterSpacing: "0.09em",
    color: "var(--text-muted)",
    fontWeight: 600,
    padding: "12px 14px",
    borderBottom: "1px solid var(--line-default)",
    whiteSpace: "nowrap",
  };
  const td: React.CSSProperties = {
    padding: "11px 14px",
    borderBottom: "1px solid var(--line-subtle)",
    verticalAlign: "top",
  };
  return (
    <div
      style={{
        overflowX: "auto",
        border: "1px solid var(--line-default)",
        borderRadius: 14,
        background: "var(--bg-raise-1)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr>
            <th style={th}>what it is</th>
            <th style={th}>signals it has</th>
            <th style={th}>the arithmetic</th>
            <th style={{ ...th, textAlign: "right" }}>score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name + r.parts}>
              <td style={td}>
                <div style={{ color: "var(--text-hi)", fontWeight: 500 }}>{r.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 11.5, marginTop: 2 }}>{r.tier}</div>
              </td>
              <td style={{ ...td, fontFamily: MONO, fontSize: 12, color: "var(--text-body)", whiteSpace: "pre-line", lineHeight: 1.7 }}>{r.parts}</td>
              <td style={{ ...td, fontFamily: MONO, fontSize: 11.5, color: "var(--text-muted)" }}>{r.math}</td>
              <td
                style={{
                  ...td,
                  textAlign: "right",
                  fontFamily: MONO,
                  fontSize: 17,
                  color: r.score === "—" ? "var(--text-muted)" : "var(--text-hi)",
                }}
              >
                {r.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Honest coverage: what is ranked, what is blank, and exactly why. */
export function Coverage({
  ranked,
  total,
  buckets,
}: {
  ranked: number;
  total: number;
  buckets: { label: string; rows: number; fix: string; fixable: boolean }[];
}) {
  const pct = (100 * ranked) / total;
  return (
    <div>
      <div
        style={{
          display: "flex",
          height: 30,
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid var(--line-default)",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            background: "var(--accent)",
            display: "grid",
            placeItems: "center",
            fontFamily: MONO,
            fontSize: 11.5,
            color: "oklch(18% 0.02 72)",
            fontWeight: 600,
          }}
        >
          {pct.toFixed(1)}%
        </div>
        <div
          style={{
            flex: 1,
            background: "var(--line-subtle)",
            display: "grid",
            placeItems: "center",
            fontFamily: MONO,
            fontSize: 11.5,
            color: "var(--text-muted)",
          }}
        >
          {(100 - pct).toFixed(1)}% has no signal yet
        </div>
      </div>
      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {buckets.map((b) => (
          <div
            key={b.label}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "baseline",
              flexWrap: "wrap",
              border: "1px solid var(--line-subtle)",
              borderRadius: 12,
              padding: "12px 16px",
              background: "var(--bg-raise-1)",
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 15, color: "var(--text-hi)", minWidth: 76 }}>
              {b.rows.toLocaleString()}
            </span>
            <span style={{ color: "var(--text-body)", fontSize: 13.5, flex: "1 1 260px" }}>{b.label}</span>
            <span
              style={{
                fontSize: 12,
                color: b.fixable ? "var(--accent-hover)" : "var(--text-muted)",
              }}
            >
              {b.fix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
