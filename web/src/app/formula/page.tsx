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
import { computeRows } from "../../../lib/rank.mjs";
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

const WEIGHTS: Record<string, number> = { tested: 1.4, mentions: 1.2, stars: 1.0, usage: 0.9 };
const GLYPH: Record<string, string> = { stars: "★", usage: "↑", tested: "✓", mentions: "♦" };
const UNIT: Record<string, string> = { stars: "stars", usage: "used", tested: "tested", mentions: "mentions" };

interface Row {
  name: string;
  url: string | null;
  signals: { stars: number | null; usage: number | null; tested: number | null; mentions: number | null };
  scores: {
    universal: number | null;
    tested: number | null;
    popular: number | null;
    practitioner: number | null;
    evidence: number;
  };
  primary: { key: string; value: number | null; pct: number } | null;
}

function load(): Row[] {
  const cat = JSON.parse(readFileSync(join(process.cwd(), "catalog.json"), "utf-8"));
  return computeRows(cat.components) as Row[];
}

/** The percentile a row earned on each signal (usage only surfaces through `primary`). */
function pctOf(r: Row, sig: string): number | null {
  if (sig === "stars") return r.scores.popular;
  if (sig === "tested") return r.scores.tested;
  if (sig === "mentions") return r.scores.practitioner;
  return r.primary?.key === "usage" ? r.primary.pct : null;
}

const n = (v: number) => v.toLocaleString();

/** Turn a row into its visible arithmetic — the proof the formula is not a black box. */
function work(r: Row, tier: string): Worked {
  const held = (["tested", "mentions", "stars", "usage"] as const)
    .map((s) => ({ s, raw: r.signals[s], pct: pctOf(r, s) }))
    .filter((x) => x.raw != null && x.pct != null);
  if (!held.length) {
    return { name: r.name, tier, parts: "no signal yet", math: "nothing to average — left blank, never guessed", score: "—" };
  }
  const wsum = held.reduce((t, x) => t + WEIGHTS[x.s], 0);
  const mult = 0.7 + (0.3 * Math.min(held.length, 3)) / 3;
  return {
    name: r.name,
    tier,
    parts: held.map((x) => `${GLYPH[x.s]} ${n(x.raw as number)} ${UNIT[x.s]} → p${x.pct}`).join("\n"),
    math: `(${held.map((x) => `${x.pct}×${WEIGHTS[x.s]}`).join(" + ")}) ÷ ${wsum.toFixed(1)} × ${mult.toFixed(2)}`,
    score: String(r.scores.universal ?? "—"),
  };
}

export default function FormulaPage() {
  const rows = load();
  const total = rows.length;
  const ranked = rows.filter((r) => r.scores.universal != null);
  const byUniversal = (a: Row, b: Row) => (b.scores.universal ?? 0) - (a.scores.universal ?? 0);

  // ── the four signals, with real coverage ───────────────────────────────────────────────────
  const count = (s: keyof Row["signals"]) => rows.filter((r) => r.signals[s] != null).length;
  const cards = [
    { glyph: "✓", key: "tested", what: "We installed it and it ran.", who: "measured by us", weight: 1.4, rows: count("tested") },
    { glyph: "♦", key: "mentions", what: "Practitioners cite it in the wild.", who: "from what builders publish", weight: 1.2, rows: count("mentions") },
    { glyph: "★", key: "stars", what: "GitHub stars.", who: "published by GitHub", weight: 1.0, rows: count("stars") },
    { glyph: "↑", key: "usage", what: "Installs from a registry listing.", who: "published by Smithery, mcp.so", weight: 0.9, rows: count("usage") },
  ].map((c) => ({ ...c, pctOfCatalog: (100 * c.rows) / total }));

  // ── the ladder: what a star count is actually worth ────────────────────────────────────────
  const starred = rows
    .filter((r) => r.signals.stars != null)
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
  const twoSignal = rows.filter((r) => r.scores.evidence === 2 && r.signals.stars != null).sort(byUniversal)[0];
  const mostUsed = rows.filter((r) => r.signals.usage != null).sort((a, b) => (b.signals.usage ?? 0) - (a.signals.usage ?? 0))[0];
  const failed = rows.find((r) => r.signals.tested === 0);
  const blankRow = rows.find((r) => r.scores.universal == null);
  const examples: Worked[] = [
    best ? work(best, "three signals agree") : null,
    twoSignal ? work(twoSignal, "two signals") : null,
    loudest ? work(loudest, "one signal — the most-starred repo we hold") : null,
    mostUsed ? work(mostUsed, "a registry listing, not a repo") : null,
    median ? work(median, "the typical repo") : null,
    failed ? work(failed, "we tested it and it failed") : null,
    blankRow ? work(blankRow, "nothing published about it yet") : null,
  ].filter((x): x is Worked => x !== null);

  // ── coverage: why the rest is blank, and whose problem that is ─────────────────────────────
  const blank = rows.filter((r) => r.scores.universal == null);
  const isGh = (u: string | null) => /github\.com/i.test(u || "");
  const isRoot = (u: string | null) => /github\.com\/[^/]+\/[^/#?]+\/?$/i.test(u || "");
  const root = blank.filter((r) => isGh(r.url) && isRoot(r.url));
  const inside = blank.filter((r) => isGh(r.url) && !isRoot(r.url));
  const elsewhere = blank.filter((r) => !isGh(r.url) && r.url);
  const nowhere = blank.filter((r) => !r.url);
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
        lead="Four exist today. A tool is scored on whichever ones it has — a missing signal never counts against it."
      >
        <Signals cards={cards} />
      </Section>

      <Section
        n="02"
        title="Raw numbers don't compare. Ranks do."
        lead="Each number is swapped for its place among things measured the same way — stars against stars, installs against installs."
      >
        <Ladder rungs={rungs} unit="stars" />
      </Section>

      {loudest && best ? (
        <Section
          n="03"
          title="Evidence beats popularity."
          lead="One signal can be luck, a launch, or marketing. Several independent signals agreeing is proof — so one signal caps you at 80, and three lets you reach 100."
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
        lead="A weighted average of the percentiles a tool actually has, scaled by how many signals agree. Nothing hidden."
      >
        <WorkedTable rows={examples} />
      </Section>

      <Section
        n="05"
        title={`We rank ${((100 * ranked.length) / total).toFixed(0)}% of the shelf. The rest is our backlog, not a dead end.`}
        lead={`Every blank row has somewhere to fetch a number from — ${n(repos.size)} GitHub repos would light up most of it.`}
      >
        <Coverage
          ranked={ranked.length}
          total={total}
          buckets={[
            { rows: root.length, label: "Points at a GitHub repo — the stars are public, we simply haven't fetched them yet.", fix: "one backfill run", fixable: true },
            { rows: inside.length, label: "Points at a file inside a repo — the file has no stars of its own, only its parent does.", fix: "inherit, or count as a mention", fixable: true },
            { rows: elsewhere.length, label: "Listed on a registry that publishes its own counts.", fix: "read the registry", fixable: true },
            { rows: nowhere.length, label: "Nowhere to look — nothing published anywhere.", fix: nowhere.length ? "genuinely unrankable" : "none of them", fixable: false },
          ]}
        />
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
