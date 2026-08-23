// /status — the freshness & coverage report for the index (a technical-program view).
// Reads the vendored catalog.json the same way /api/rank does (join(process.cwd(),
// "catalog.json")) and reports, honestly: how many components are indexed, how many carry
// each ranking signal (stars · a measured test · community mentions) with coverage %, and
// when the crawl last confirmed everything (the "valid as of" date). Server component,
// static — the 38MB parse happens once at build. Warm-black + Synapse-Amber, wide, editorial.
import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Index status · Armory",
  description:
    "Freshness and signal coverage for the Armory index — how many components are catalogued, how many carry each ranking signal, and when the crawl last confirmed them.",
};

// ---- the data read (memoized so the 38MB parse happens once) ---------------------------
interface Comp {
  stars?: number | null;
  eval_score?: number | null;
  mentions?: number | null;
  verified_at?: string | null;
  source_repo?: string | null;
}
interface Stats {
  total: number;
  sources: number;
  stars: number;
  tested: number;
  mentions: number;
  anySignal: number;
  months: { key: string; count: number }[];
  validAsOf: string | null; // year-month of the newest crawl, e.g. "2026-05"
  sweptFrom: string | null; // full min date, e.g. "2026-05-26"
  sweptTo: string | null; // full max date
  monthsOld: number; // age of the newest crawl, in whole months
}

let CACHE: Stats | null = null;

function stats(): Stats {
  if (CACHE) return CACHE;
  const path = join(process.cwd(), "catalog.json"); // vendored to the site root by prebuild
  const cat = JSON.parse(readFileSync(path, "utf-8")) as { components?: Comp[] };
  const comps = cat.components ?? [];

  const sources = new Set<string>();
  const ym = new Map<string, number>();
  let stars = 0;
  let tested = 0;
  let mentions = 0;
  let anySignal = 0;
  let min = "9999-99-99";
  let max = "0000-00-00";

  for (const c of comps) {
    const hasStars = typeof c.stars === "number" && c.stars > 0;
    const hasTested = typeof c.eval_score === "number";
    const hasMentions = typeof c.mentions === "number" && c.mentions > 0;
    if (hasStars) stars++;
    if (hasTested) tested++;
    if (hasMentions) mentions++;
    if (hasStars || hasTested || hasMentions) anySignal++;
    if (typeof c.source_repo === "string" && c.source_repo) sources.add(c.source_repo);

    const key = c.verified_at ? String(c.verified_at).slice(0, 7) : "(none)";
    ym.set(key, (ym.get(key) ?? 0) + 1);
    if (c.verified_at) {
      const d = String(c.verified_at);
      if (d < min) min = d;
      if (d > max) max = d;
    }
  }

  // year-months ascending, with the undated bucket pinned last
  const months = Array.from(ym.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => {
      if (a.key === "(none)") return 1;
      if (b.key === "(none)") return -1;
      return a.key < b.key ? -1 : 1;
    });

  const sweptTo = max !== "0000-00-00" ? max : null;
  const sweptFrom = min !== "9999-99-99" ? min : null;
  const validAsOf = sweptTo ? sweptTo.slice(0, 7) : null;

  let monthsOld = 0;
  if (sweptTo) {
    const newest = new Date(sweptTo + "T00:00:00Z").getTime();
    const ageMs = Date.now() - newest;
    monthsOld = Math.max(1, Math.round(ageMs / (1000 * 60 * 60 * 24 * 30.44)));
  }

  CACHE = {
    total: comps.length,
    sources: sources.size,
    stars,
    tested,
    mentions,
    anySignal,
    months,
    validAsOf,
    sweptFrom,
    sweptTo,
    monthsOld,
  };
  return CACHE;
}

// ---- small formatters ------------------------------------------------------------------
const n = (v: number): string => v.toLocaleString("en-US");
const pct = (part: number, whole: number): string => {
  if (!whole) return "0%";
  const p = (100 * part) / whole;
  return (p < 1 ? p.toFixed(2) : p.toFixed(1)) + "%";
};
function monthLabel(key: string): string {
  if (key === "(none)") return "no date recorded";
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
function longDate(d: string | null): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

// ---- shared style objects (inline tokens, matching /formula + /leaderboard) -------------
const H2: React.CSSProperties = {
  fontFamily: "var(--font-display), Georgia, serif",
  color: "var(--text-hi)",
  fontSize: 27,
  letterSpacing: "-0.01em",
  margin: "0 0 4px",
};
const KICKER: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.11em",
  color: "var(--text-muted)",
  fontWeight: 600,
};
const CARD: React.CSSProperties = {
  background: "var(--bg-raise-1)",
  border: "1px solid var(--line-default)",
  borderRadius: 16,
  padding: "22px 24px",
};
const BIGNUM: React.CSSProperties = {
  fontFamily: "var(--font-display), Georgia, serif",
  color: "var(--text-hi)",
  lineHeight: 1,
  letterSpacing: "-0.02em",
  fontVariantNumeric: "tabular-nums",
};

// A hairline meter: honest widths (a 0.09% signal reads as a hair, not a fake block).
function Meter({ part, whole, tone = "accent" }: { part: number; whole: number; tone?: "accent" | "muted" }) {
  const p = whole ? (100 * part) / whole : 0;
  const fill = tone === "muted" ? "var(--text-muted)" : "var(--accent)";
  return (
    <div
      style={{
        height: 8,
        borderRadius: 999,
        background: "var(--bg-raise-2)",
        border: "1px solid var(--line-subtle)",
        overflow: "hidden",
      }}
    >
      <div style={{ width: `max(3px, ${p}%)`, height: "100%", background: fill, borderRadius: 999 }} />
    </div>
  );
}

// One signal / freshness row: label + description, a meter, then count · coverage.
function CoverageRow({
  label,
  sub,
  glyph,
  count,
  total,
  tone = "accent",
}: {
  label: string;
  sub: string;
  glyph?: string;
  count: number;
  total: number;
  tone?: "accent" | "muted";
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
        padding: "16px 0",
        borderBottom: "1px solid var(--line-subtle)",
      }}
    >
      <div style={{ width: 232, minWidth: 200, flexShrink: 0 }}>
        <div style={{ color: "var(--text-hi)", fontSize: 15, fontWeight: 600 }}>
          {glyph ? <span style={{ color: "var(--accent)", marginRight: 8 }}>{glyph}</span> : null}
          {label}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12.5, marginTop: 3, lineHeight: 1.5 }}>{sub}</div>
      </div>
      <div style={{ flex: "1 1 220px", minWidth: 160 }}>
        <Meter part={count} whole={total} tone={tone} />
      </div>
      <div style={{ width: 176, textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
        <span style={{ color: "var(--text-hi)", fontSize: 15, fontWeight: 600 }}>{n(count)}</span>
        <span style={{ color: "var(--text-muted)", fontSize: 13, marginLeft: 8 }}>{pct(count, total)}</span>
      </div>
    </div>
  );
}

// ---- the page --------------------------------------------------------------------------
export default function Status() {
  const s = stats();

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "88px 24px 96px" }}>
      <a href="/leaderboard" style={{ color: "var(--accent-hover)", fontSize: 13.5, textDecoration: "none" }}>
        ← the leaderboard
      </a>
      <h1
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: 46,
          lineHeight: 1.04,
          color: "var(--text-hi)",
          letterSpacing: "-0.02em",
          margin: "12px 0 0",
        }}
      >
        Index status
      </h1>
      <p style={{ color: "var(--text-muted)", marginTop: 12, maxWidth: "68ch", lineHeight: 1.65, fontSize: 17 }}>
        What is actually in the index, how much of it carries a real ranking signal, and how fresh the
        numbers are. Everything below is read live from{" "}
        <span style={{ fontFamily: "var(--font-mono), ui-monospace, Menlo, monospace", color: "var(--text-body)" }}>
          catalog.json
        </span>{" "}
        — the one version-controlled source every surface reads.
      </p>

      {/* Hero: one featured total, then three supporting stats — asymmetric, not a 4-card wall. */}
      <section style={{ margin: "36px 0 12px" }}>
        <div
          style={{
            ...CARD,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 28,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={KICKER}>components indexed</div>
            <div style={{ ...BIGNUM, fontSize: 66, marginTop: 8 }}>{n(s.total)}</div>
          </div>
          <p style={{ color: "var(--text-body)", fontSize: 15, lineHeight: 1.65, maxWidth: "42ch", margin: 0 }}>
            Every catalogued building block — MCPs, skills, hooks, sub-agents, rules, evals,
            infrastructure, and the workflows that compose them — drawn from{" "}
            <strong style={{ color: "var(--text-hi)" }}>{n(s.sources)}</strong> distinct source repositories.
            New tools arrive only as additive pull requests.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 16 }}>
          <div style={CARD}>
            <div style={KICKER}>carry a ranking signal</div>
            <div style={{ ...BIGNUM, fontSize: 34, marginTop: 10 }}>{n(s.anySignal)}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
              {pct(s.anySignal, s.total)} of the index · the rest are honestly unranked
            </div>
          </div>
          <div style={CARD}>
            <div style={KICKER}>valid as of</div>
            <div style={{ ...BIGNUM, fontSize: 34, marginTop: 10 }}>{s.validAsOf ? monthLabel(s.validAsOf) : "—"}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
              last confirmed by the crawl · about {s.monthsOld} month{s.monthsOld === 1 ? "" : "s"} ago
            </div>
          </div>
          <div style={CARD}>
            <div style={KICKER}>measured &amp; verified</div>
            <div style={{ ...BIGNUM, fontSize: 34, marginTop: 10 }}>{n(s.tested)}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 6 }}>
              installed and run through our own test harness
            </div>
          </div>
        </div>
      </section>

      {/* Signal coverage */}
      <section style={{ margin: "48px 0 0" }}>
        <div style={KICKER}>signal coverage</div>
        <h2 style={{ ...H2, marginTop: 6 }}>What each component is scored on</h2>
        <p style={{ color: "var(--text-body)", fontSize: 15, lineHeight: 1.65, maxWidth: "68ch", margin: "8px 0 8px" }}>
          Each signal is real or absent — never invented. A component is ranked on whatever it actually
          has, so most of the index is sparse by design. Coverage is the share of all {n(s.total)}{" "}
          components that carry each one.
        </p>
        <div style={{ ...CARD, padding: "6px 24px" }}>
          <CoverageRow
            label="GitHub stars"
            sub="repos with a real star count (a star figure is GitHub-only, never conflated with usage)"
            glyph="★"
            count={s.stars}
            total={s.total}
          />
          <CoverageRow
            label="Measured test score"
            sub="the few we installed and ran ourselves — the ✓ verified badge on the leaderboard"
            glyph="✓"
            count={s.tested}
            total={s.total}
          />
          <div style={{ borderBottom: "none" }}>
            <CoverageRow
              label="Community mentions"
              sub="how often practitioners reference it — a community signal, not a vanity metric"
              glyph="♦"
              count={s.mentions}
              total={s.total}
            />
          </div>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.6, margin: "14px 0 0", maxWidth: "68ch" }}>
          {n(s.anySignal)} components ({pct(s.anySignal, s.total)}) carry at least one signal; the remaining{" "}
          {n(s.total - s.anySignal)} are unranked rather than faked to the top.{" "}
          <a href="/formula" style={{ color: "var(--accent-hover)", textDecoration: "underline", textUnderlineOffset: 3 }}>
            How the score works →
          </a>
        </p>
      </section>

      {/* Freshness */}
      <section style={{ margin: "48px 0 0" }}>
        <div style={KICKER}>freshness</div>
        <h2 style={{ ...H2, marginTop: 6 }}>
          Valid as of {s.validAsOf ? monthLabel(s.validAsOf) : "—"}
        </h2>
        <p style={{ color: "var(--text-body)", fontSize: 15, lineHeight: 1.65, maxWidth: "68ch", margin: "8px 0 8px" }}>
          When the crawl last confirmed each component, grouped by month. The base index was gathered in a
          single sweep{s.sweptFrom && s.sweptTo ? ` (${longDate(s.sweptFrom)} → ${longDate(s.sweptTo)})` : ""},
          so nearly every record shares one timestamp — an honest picture of a one-shot crawl.
        </p>
        <div style={{ ...CARD, padding: "6px 24px" }}>
          {s.months.map((m, i) => (
            <div key={m.key} style={i === s.months.length - 1 ? { borderBottom: "none" } : undefined}>
              <CoverageRow
                label={monthLabel(m.key)}
                sub={m.key === "(none)" ? "added after the sweep — no crawl timestamp yet" : "confirmed by the base crawl"}
                count={m.count}
                total={s.total}
                tone={m.key === "(none)" ? "muted" : "accent"}
              />
            </div>
          ))}
        </div>
      </section>

      {/* The honest note */}
      <section style={{ margin: "32px 0 0" }}>
        <div
          style={{
            border: "1px solid var(--accent-line)",
            background: "var(--accent-quiet)",
            borderRadius: 16,
            padding: "20px 24px",
          }}
        >
          <div style={{ ...KICKER, color: "var(--accent)" }}>the honest state</div>
          <p style={{ color: "var(--text-body)", fontSize: 15, lineHeight: 1.7, margin: "8px 0 0", maxWidth: "74ch" }}>
            The base crawl is about {s.monthsOld} month{s.monthsOld === 1 ? "" : "s"} old — everything here
            was last confirmed in {s.validAsOf ? monthLabel(s.validAsOf) : "the initial sweep"}. Star counts
            drift, repos move, new tools ship every week. A proactive crawler keeps the index current by
            re-confirming existing components and pulling in new ones on a schedule; every row links back to
            its source, so you can always verify freshness yourself against the original repository.
          </p>
        </div>
      </section>
    </main>
  );
}
