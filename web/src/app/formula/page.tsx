// /formula — how the Universal score works, shown rather than explained.
//
// Every figure on this page is computed from catalog.json at build time with the SAME engine the
// leaderboard and the API use (lib/rank.mjs), so the page can never drift from the ranking. Examples
// are chosen by CRITERIA (the most-starred single-signal tool, the highest-scoring tool, …) rather
// than hardcoded names, so they stay true as the catalog grows.
import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
// @ts-expect-error — vendored plain-ESM engine (web/lib/rank.mjs, copied by scripts/copy-data.mjs)
import { computeRows, WEIGHTS, BLEND } from "../../../lib/rank.mjs";
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

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "How the score works — Armory",
  description:
    "One rating for every open-source building block. Each signal becomes a percentile within its own kind, blended by weight, and scaled by how many independent signals agree. Every number computed from the catalog.",
};

// The weights and the blend are IMPORTED from the engine, never re-typed here. A hand-typed mirror
// used to live on this line, and it drifted: the page printed `(100×1.4 + …) = 93.70` next to the
// 92.9 the engine actually computed (docs/FORMULA-AUDIT.md §H12). Now there is one object, so the
// arithmetic on this page cannot disagree with the ranking.
const W = WEIGHTS as Record<string, number>;
const B = BLEND as { base: number; others: number };

// Every signal the engine scores on, in the order they read best on the page.
const SIGNALS = ["tested", "mentions", "stars", "forks", "usage"] as const;
type Signal = (typeof SIGNALS)[number];
const GLYPH: Record<string, string> = { stars: "★", usage: "↑", tested: "✓", mentions: "♦", forks: "⑂" };
const UNIT: Record<string, string> = { stars: "stars", usage: "used", tested: "tested", mentions: "mentions", forks: "forks" };
const WHAT: Record<string, string> = {
  tested: "We installed it and it ran.",
  mentions: "Practitioners cite it in the wild.",
  stars: "GitHub stars.",
  forks: "People copied the repo to build on it.",
  usage: "Installs from a registry listing.",
};
const WHO: Record<string, string> = {
  tested: "measured by us",
  mentions: "from what builders publish",
  stars: "published by GitHub",
  forks: "published by GitHub",
  usage: "published by Smithery, mcp.so",
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
    /** the weight-averaged percentile of everything else, or null when there is nothing else */
    others: number | null;
  };
  primary: { key: string; value: number | null; pct: number } | null;
}

function load(): Row[] {
  const cat = JSON.parse(readFileSync(join(process.cwd(), "catalog.json"), "utf-8"));
  return computeRows(cat.components) as Row[];
}

const n = (v: number) => v.toLocaleString();
// Two decimals, trailing zeros dropped. The two halves are shown EXACT so they always add to the
// score; only the final score is rounded to one decimal, and §04 says so.
const ex = (v: number) => String(+v.toFixed(2));

/**
 * Turn a row into its visible arithmetic — the proof the formula is not a black box.
 * The engine hands over the percentile per signal, which one is the `base`, and the weighted average
 * of the rest, so this only formats what was already computed. It cannot print a different sum.
 */
function work(r: Row, tier: string): Worked {
  const { pct, base, others } = r.scores;
  const held = SIGNALS.filter((s) => pct[s] != null);
  if (!held.length || !base) {
    return { name: r.name, tier, parts: "no signal yet", math: "nothing to rank — left blank, never guessed", score: "—" };
  }
  const rest = held.filter((s) => s !== base);
  const parts = held
    .map((s) => `${GLYPH[s]} ${n(r.signals[s] as number)} ${UNIT[s]} → p${pct[s]}${s === base ? "  ← strongest" : ""}`)
    .join("\n");
  // others = Σ(percentile × weight) ÷ Σ(weight) over every signal that is NOT the strongest
  const othersMath = rest.length
    ? `${B.others} × [(${rest.map((s) => `${pct[s]}×${W[s]}`).join(" + ")}) ÷ ${rest.reduce((t, s) => t + W[s], 0).toFixed(1)}]`
    : `${B.others} × 0 (nothing else to corroborate)`;
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
    glyph: GLYPH[s], key: s, what: WHAT[s], who: WHO[s], weight: W[s], rows: count(s),
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
    threeSignal ? work(threeSignal, `${threeSignal.scores.evidence} signals agree`) : null,
    twoSignal ? work(twoSignal, "two signals — the second one only adds") : null,
    loudest ? work(loudest, "one signal — the most-starred repo we hold") : null,
    mostUsed ? work(mostUsed, "a registry listing, not a repo") : null,
    median ? work(median, "the typical repo") : null,
    failed ? work(failed, "we tested it and it failed") : null,
    blankRow ? work(blankRow, "nothing published about it yet") : null,
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
      <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.11em", color: "var(--accent)", fontWeight: 600 }}>
        the formula
      </div>
      <h1 style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: 46, lineHeight: 1.04, color: "var(--text-hi)", letterSpacing: "-0.02em", margin: "8px 0 10px" }}>
        One score for {n(total)} very different things.
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 16, margin: "0 0 56px" }}>
        A repo has stars. A registry listing has installs. A rules file has neither. So we never compare
        raw numbers — we compare ranks, and count how many independent sources agree.
      </p>

      <Section
        n="01"
        title="A signal is a public number that proves people use it."
        lead={`${cards.length} exist today. A tool is scored on whichever ones it has — a missing signal never counts against it. The weight decides how much a signal corroborates, never how much it wins: the strongest number a tool holds is always the one it leads with.`}
      >
        <Signals cards={cards} />
      </Section>

      <Section
        n="02"
        title="Raw numbers don't compare. Ranks do."
        lead="Each number is swapped for its place among things measured the same way — a repo's stars against other repos' stars, a registry's installs against other registries'. Listed twice on the same link? It counts once."
      >
        <Ladder rungs={rungs} unit="stars" />
      </Section>

      {loudest && best ? (
        <Section
          n="03"
          title="Evidence beats popularity — and can never cost you."
          lead={`One signal can be luck, a launch, or marketing. Several independent sources agreeing is proof. So we take your strongest number as ${B.base} of the score, and everything else you hold adds the last ${B.others}. One signal caps you at ${100 * B.base}. A second and a third can only ever push you up — earning more evidence is never punished.`}
        >
          <HeadToHead
            left={{
              name: loudest.name,
              headline: n(loudest.signals.stars as number),
              headlineLabel: "★ stars",
              signals: loudest.scores.evidence,
              score: loudest.scores.universal ?? 0,
              verdict: "popular, unconfirmed",
            }}
            right={{
              name: best.name,
              headline: n((best.signals.stars ?? best.signals.usage ?? 0) as number),
              headlineLabel: best.signals.stars != null ? "★ stars" : "↑ used",
              signals: best.scores.evidence,
              score: best.scores.universal ?? 0,
              verdict: "corroborated",
            }}
          />
        </Section>
      ) : null}

      <Section
        n="04"
        title="The whole thing, on real rows."
        lead={`${B.base} × the best rank a tool holds, plus ${B.others} × the weighted average of everything else it holds, rounded to one decimal at the end. Nothing hidden — these sums are printed from the same weights the score is computed with, so they cannot disagree with it.`}
      >
        <WorkedTable rows={examples} />
      </Section>

      <Section
        n="05"
        title={`We rank ${((100 * ranked.length) / total).toFixed(0)}% of the shelf, and we know why the rest is blank.`}
        lead={`We asked GitHub about all ${n(repos.size)} repos behind the blank rows. None of this is a mystery — most of the tail simply has nothing to measure yet.`}
      >
        <Coverage
          ranked={ranked.length}
          total={total}
          buckets={[
            { rows: root.length, label: "A repo we asked about that has no stars. Nobody has starred it yet, so there is honestly nothing to score.", fix: "waiting on its first user", fixable: false },
            { rows: inside.length, label: "A file inside a repo. Its parent has stars; the file has not earned them, and we refuse to borrow the number.", fix: "needs a signal of its own", fixable: true },
            { rows: elsewhere.length, label: "Listed on a registry that publishes its own install counts.", fix: "read the registry", fixable: true },
            { rows: nowhere.length, label: "Nowhere to look — nothing published anywhere.", fix: nowhere.length ? "genuinely unrankable" : "none of them", fixable: false },
          ]}
        />
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 18 }}>
          Separately: we record when a repo was last pushed to, and flag anything untouched for two
          years as <strong style={{ color: "var(--accent-hover)" }}>Stale</strong>. It is a warning
          label, never a term in the score — being freshly pushed proves a tool is alive, not that
          anyone uses it, and a brand-new repo nobody has starred must not outrank a maintained one.
          It breaks ties, so among the thousands of tools sitting on the same score, the ones still
          being worked on come first.{" "}
          {dated
            ? `We hold a push date for ${n(dated)} rows; ${n(stale)} of them are stale.`
            : "The push-date backfill has not run yet, so nothing is flagged."}
        </p>
      </Section>

      <Section n="06" title="Call it from an agent." lead="The same ranked JSON, three ways in.">
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {(
            [
              ["REST", "GET /api/rank?component=mcp&vertical=finance\nGET /api/search?q=browser+automation"],
              ["CLI", 'npx @namanparikh/armory rank --domain payments\nnpx @namanparikh/armory search "oauth"'],
              ["MCP", "rank_components · search_catalog"],
            ] as const
          ).map(([label, code]) => (
            <div key={label} style={{ border: "1px solid var(--line-default)", borderRadius: 14, background: "var(--bg-raise-1)", padding: "14px 16px" }}>
              <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>
                {label}
              </div>
              <pre style={{ margin: 0, fontFamily: "var(--font-mono), ui-monospace, Menlo, monospace", fontSize: 12, color: "var(--text-body)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {code}
              </pre>
            </div>
          ))}
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 18 }}>
          The formula and every signal are open. If a weight is wrong, that&rsquo;s a pull request, not a mystery.
        </p>
      </Section>
    </main>
  );
}
