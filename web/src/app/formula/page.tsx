// /formula — how the Universal score works, shown rather than explained.
//
// Every figure on this page is computed from catalog.json at build time with the SAME engine the
// leaderboard and the API use (lib/rank.mjs), so the page can never drift from the ranking. Examples
// are chosen by CRITERIA (the most-starred single-signal tool, the highest-scoring tool, …) rather
// than hardcoded names, so they stay true as the catalog grows.
import type { Metadata } from "next";
import { readCatalogText } from "@/lib/catalog-file";
// @ts-expect-error — vendored plain-ESM engine (web/lib/rank.mjs, copied by scripts/copy-data.mjs)
import { computeRows, WEIGHTS, BLEND, MIN_POOL } from "../../../lib/rank.mjs";
import {
  Coverage,
  HeadToHead,
  Ladder,
  Section,
  Signals,
  WorkedTable,
  type Rung,
  type Worked,
} from "@/components/score-explainer";
import { signalWords } from "@/components/signals-row";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Formula · Armory",
  description:
    `One score per component: each public signal becomes a percentile within its own kind; the strongest counts ${BLEND.base} and the second strongest ${BLEND.others}, so more evidence can never lower it.`,
};

// The weights and the blend are IMPORTED from the engine, never re-typed here. A hand-typed mirror
// used to live on this line, and it drifted: the page printed `(100×1.4 + …) = 93.70` next to the
// 92.9 the engine actually computed (docs/FORMULA-AUDIT.md §H12). Now there is one object, so the
// arithmetic on this page cannot disagree with the ranking.
const W = WEIGHTS as Record<string, number>;
const REPO = "https://github.com/naman10parikh/armory";
const B = BLEND as { base: number; others: number };

// Every signal the engine scores on, in the order they read best on the page.
const SIGNALS = ["tested", "mentions", "stars", "forks", "usage"] as const;
type Signal = (typeof SIGNALS)[number];
// Words, not glyphs (the site's rule, components/signals-row.tsx; CP138 T51).
const WHAT: Record<string, string> = {
  tested: "Installed and run by Armory",
  mentions: "Cited in published sources",
  stars: "GitHub stars",
  forks: "Repository forks",
  usage: "Registry install count",
};
const WHO: Record<string, string> = {
  tested: "Source: Armory",
  mentions: "Source: articles and posts",
  stars: "Source: GitHub",
  forks: "Source: GitHub",
  usage: "Source: Smithery, mcp.so",
};

interface Row {
  name: string;
  url: string | null;
  kind: string;
  stale: boolean;
  pushed_at: string | null;
  signals: Record<Signal, number | null>;
  scores: {
    universal: number | null;
    tested: number | null;
    popular: number | null;
    practitioner: number | null;
    evidence: number;
    /** the percentile this row earned on each signal it holds */
    pct: Partial<Record<Signal, number>>;
    /** the signal that produced the strongest percentile — the `base` term */
    base: Signal | null;
    /** the signal that produced the second-strongest percentile — the `others` term */
    second: Signal | null;
    /** the second-strongest percentile, or null when the row holds one signal */
    others: number | null;
  };
  primary: { key: string; value: number | null; pct: number } | null;
}

function load(): Row[] {
  const cat = JSON.parse(readCatalogText());
  return computeRows(cat.components) as Row[];
}

const n = (v: number) => v.toLocaleString();
// Two decimals, trailing zeros dropped. The two halves are shown EXACT so they always add to the
// score; only the final score is rounded to one decimal, and §04 says so.
const ex = (v: number) => String(+v.toFixed(2));

/**
 * Turn a row into its visible arithmetic — the proof the formula is not a black box.
 * The engine hands over the percentile per signal and which two are the `base` and the `second`, so
 * this only formats what was already computed. It cannot print a different sum.
 */
function work(r: Row, tier: string): Worked {
  const { pct, base, second, others } = r.scores;
  const held = SIGNALS.filter((s) => pct[s] != null);
  if (!held.length || !base) {
    return { name: r.name, tier, parts: "Unmeasured", math: "No Value", score: "—" };
  }
  const mark = (s: Signal) => (s === base ? "  ← strongest" : s === second ? "  ← second" : "  (not used: weaker than both)");
  const parts = held.map((s) => `${signalWords(s, r.signals[s] as number)} → p${pct[s]}${mark(s)}`).join("\n");
  // others = the second-strongest percentile; a weaker third signal is not used, so it cannot cost points
  const othersMath = second ? `${B.others} × ${pct[second]}` : `${B.others} × 0 (nothing else to corroborate)`;
  return {
    name: r.name,
    tier,
    parts,
    math: `${B.base} × ${pct[base]}  +  ${othersMath}\n= ${ex(B.base * (pct[base] as number))} + ${ex(B.others * (others ?? 0))}`,
    score: String(r.scores.universal ?? "—"),
  };
}

export default function FormulaPage() {
  const rows = load();
  const total = rows.length;
  const ranked = rows.filter((r) => r.scores.universal != null);
  const byUniversal = (a: Row, b: Row) => (b.scores.universal ?? 0) - (a.scores.universal ?? 0);

  // ── the signals, with real coverage. Weight comes from the engine's WEIGHTS, never re-typed. ──
  const count = (s: Signal) => rows.filter((r) => r.signals[s] != null).length;
  const cards = SIGNALS.map((s) => ({
    key: s, what: WHAT[s], who: WHO[s], weight: W[s], rows: count(s),
  })).map((c) => ({ ...c, pctOfCatalog: (100 * c.rows) / total }));

  // ── the ladder: what a star count is actually worth ────────────────────────────────────────
  // Repo roots only. A star's percentile is measured inside its own kind, so mixing repos with files
  // inside repos here would draw a ladder whose rungs came from two different pools.
  const starred = rows
    .filter((r) => r.signals.stars != null && r.kind === "github-root")
    .sort((a, b) => (a.signals.stars ?? 0) - (b.signals.stars ?? 0));
  const median = starred[Math.floor(starred.length / 2)];
  const rungAt = (target: number, note?: string): Rung | null => {
    const hit = starred.find((r) => (r.signals.stars ?? 0) >= target);
    return hit ? { raw: n(hit.signals.stars as number), pct: hit.scores.popular ?? 0, note } : null;
  };
  const medianRung: Rung | null = median
    ? { raw: n(median.signals.stars as number), pct: median.scores.popular ?? 0, note: "the median repo — half of everything with stars sits below here" }
    : null;
  const rungs = [
    rungAt(1),
    medianRung,
    rungAt(100),
    rungAt(5000),
    rungAt(100000, "the top is compressed on purpose: 5,000 → 100,000 stars moves you about one point"),
  ].filter((x): x is Rung => x !== null);

  // ── the head-to-head: most stars in the catalog vs the highest score ───────────────────────
  const loudest = rows
    .filter((r) => r.signals.stars != null && r.scores.evidence === 1)
    .sort((a, b) => (b.signals.stars ?? 0) - (a.signals.stars ?? 0))[0];
  const best = [...ranked].sort(byUniversal)[0];

  // ── worked examples, picked by criteria (never hardcoded names) ────────────────────────────
  const threeSignal = rows.filter((r) => r.scores.evidence >= 3).sort(byUniversal)[0];
  const twoSignal = rows.filter((r) => r.scores.evidence === 2 && r.signals.stars != null).sort(byUniversal)[0];
  const mostUsed = rows.filter((r) => r.signals.usage != null).sort((a, b) => (b.signals.usage ?? 0) - (a.signals.usage ?? 0))[0];
  const failed = rows.find((r) => r.signals.tested === 0);
  const blankRow = rows.find((r) => r.scores.universal == null);
  const examples: Worked[] = [
    threeSignal ? work(threeSignal, `${threeSignal.scores.evidence} Signals`) : null,
    twoSignal ? work(twoSignal, "2 Signals") : null,
    loudest ? work(loudest, "1 Signal · Most-Starred Single-Signal Row") : null,
    mostUsed ? work(mostUsed, "Registry Listing") : null,
    median ? work(median, "Median") : null,
    failed ? work(failed, "Tested · Failed") : null,
    blankRow ? work(blankRow, "Unmeasured") : null,
  ].filter((x): x is Worked => x !== null);

  // ── coverage: why the rest is blank, and whose problem that is ─────────────────────────────
  // `kind` is the engine's own classifier (the same one that picks each signal's percentile pool),
  // so these buckets can never disagree with how a row was actually scored.
  const blank = rows.filter((r) => r.scores.universal == null);
  const root = blank.filter((r) => r.kind === "github-root");
  const inside = blank.filter((r) => r.kind === "github-file");
  const elsewhere = blank.filter((r) => r.kind !== "github-root" && r.kind !== "github-file" && r.url);
  const nowhere = blank.filter((r) => !r.url);
  const stale = rows.filter((r) => r.stale).length;
  const dated = rows.filter((r) => r.pushed_at).length;
  const repos = new Set(
    blank
      .map((r) => (r.url || "").match(/github\.com\/([^/]+)\/([^/#?]+)/i))
      .filter((m): m is RegExpMatchArray => m !== null)
      .map((m) => `${m[1]}/${m[2]}`.toLowerCase()),
  );

  return (
    <main style={{ maxWidth: 1240, margin: "0 auto", padding: "96px 24px 96px" }}>
      <h1 style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: 46, lineHeight: 1.04, color: "var(--text-hi)", letterSpacing: "-0.02em", margin: "0 0 10px" }}>
        Formula
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 16, margin: "0 0 56px" }}>
        One score from {SIGNALS.length} public signals, each ranked within its own kind
      </p>

      <Section
        n="01"
        title="Signals"
        lead={`${cards.length} exist today. A tool is scored on whichever ones it has: a missing signal, or a recorded zero, never counts against it. The strongest number a tool holds is always the one it leads with; the weight only decides which leads when two rank the same.`}
      >
        <Signals cards={cards} />
      </Section>

      <Section
        n="02"
        title="Percentiles"
        lead={`Each number is swapped for its place among things measured the same way — a repo's stars against other repos' stars, a registry's installs against other registries'. A kind with fewer than ${MIN_POOL} measured things is too small to rank within, so those are ranked against every kind. Listed twice on the same link? It counts once. On this page, p90 means the 90th percentile: higher than 90% of its kind.`}
      >
        <Ladder rungs={rungs} unit="stars" />
      </Section>

      {loudest && best ? (
        <Section
          n="03"
          title="Confidence"
          lead={`One signal can be luck, a launch, or marketing. Several sources agreeing is stronger evidence than one. So we take your strongest number as ${B.base} of the score, and your second strongest adds the last ${B.others}. One signal caps you at ${100 * B.base}. A third counts only when it beats one of those two, so earning more evidence is never punished.`}
        >
          <HeadToHead
            left={{
              name: loudest.name,
              headline: n(loudest.signals.stars as number),
              headlineLabel: "stars",
              signals: loudest.scores.evidence,
              score: loudest.scores.universal ?? 0,
              verdict: "Unconfirmed",
            }}
            right={{
              name: best.name,
              headline: n((best.signals.stars ?? best.signals.usage ?? 0) as number),
              headlineLabel: best.signals.stars != null ? "stars" : "installs",
              signals: best.scores.evidence,
              score: best.scores.universal ?? 0,
              verdict: "Corroborated",
            }}
          />
        </Section>
      ) : null}

      <Section
        n="04"
        title="Worked Examples"
        lead={`${B.base} × the best rank a tool holds, plus ${B.others} × its second best, rounded to one decimal at the end; tables print three decimals from the unrounded score to separate ties. These sums use the same numbers as the score.`}
      >
        <WorkedTable rows={examples} />
      </Section>

      <Section
        n="05"
        title="Coverage"
        lead={`We asked GitHub about all ${n(repos.size)} repos behind the blank rows. Most have nothing to measure yet.`}
      >
        <Coverage
          ranked={ranked.length}
          total={total}
          buckets={[
            { rows: root.length, label: "Repositories with zero stars: nothing to score yet", fix: "Needs a first star", fixable: false },
            { rows: inside.length, label: "Files inside a repository: the parent's stars are not counted for the file", fix: "Needs its own signal", fixable: true },
            { rows: elsewhere.length, label: "Listed on a registry that publishes its own install counts", fix: "Pending registry fetch", fixable: true },
            { rows: nowhere.length, label: "Nowhere to look — nothing published anywhere", fix: nowhere.length ? "genuinely unrankable" : "None", fixable: false },
          ]}
        />
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 18 }}>
          Separately: we record when a repo was last pushed to, and flag anything untouched for two
          years as <strong style={{ color: "var(--accent-hover)" }}>Stale</strong>. It is a warning
          label, never a term in the score — being freshly pushed proves a tool is alive, not that
          anyone uses it, and a brand-new repo nobody has starred must not outrank a maintained one.
          It breaks ties. Rows are ordered by the score before rounding, then by how many signals
          back it, then by the latest commit, then by stars, then by name, so among tools on the same
          score the ones still being worked on come first.{" "}
          {dated
            ? `We hold a push date for ${n(dated)} rows; ${n(stale)} of them are stale.`
            : "The push-date backfill has not run yet, so nothing is flagged."}
        </p>
      </Section>

      <Section n="06" title="API" lead="The same ranked JSON, three ways in.">
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {(
            [
              ["REST", "GET /api/rank?component=mcp&vertical=finance\nGET /api/search?q=browser+automation"],
              ["CLI", 'Not on npm yet · build from cli/ in the repository, then:\narmory rank --domain payments\narmory search "oauth"'],
              ["MCP", "rank_components · search_catalog"],
            ] as const
          ).map(([label, code]) => (
            <div key={label} style={{ border: "1px solid var(--line-default)", borderRadius: 14, background: "var(--bg-raise-1)", padding: "14px 16px" }}>
              <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>
                {label}
              </div>
              <pre style={{ margin: 0, fontFamily: "var(--font-sans), ui-monospace, Menlo, monospace", fontSize: 12, color: "var(--text-body)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {code}
              </pre>
            </div>
          ))}
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 18 }}>
          Weights are versioned in the repository (
          <a href={`${REPO}/blob/main/lib/rank.mjs`} target="_blank" rel="noreferrer noopener" className="cursor-pointer text-accent-hover underline underline-offset-4">
            lib/rank.mjs
          </a>
          ) ·{" "}
          <a href={`${REPO}/issues/new`} target="_blank" rel="noreferrer noopener" className="cursor-pointer text-accent-hover underline underline-offset-4">
            Open Issue
          </a>
        </p>
      </Section>
    </main>
  );
}
