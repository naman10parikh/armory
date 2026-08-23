// /formula — the open scoring formula + how any agent calls Armory (CLI · MCP · HTTP/JSON · RAG).
// Static, editorial. The whole point: the ranking is objective, public, and machine-callable.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The formula · Armory",
  description: "How the Universal score is computed — open and cited — and how any agent calls the ranked index.",
};

const H2: React.CSSProperties = { fontFamily: "var(--font-display), Georgia, serif", color: "var(--text-hi)", fontSize: 26, letterSpacing: "-0.01em", margin: "2.4rem 0 0.6rem" };
const P: React.CSSProperties = { color: "var(--text-body)", lineHeight: 1.7, maxWidth: "68ch", margin: "0.8rem 0" };
const CODE: React.CSSProperties = { display: "block", background: "oklch(13% 0.006 72)", border: "1px solid var(--line-default)", borderRadius: 12, padding: "14px 16px", fontFamily: "var(--font-mono), ui-monospace, Menlo, monospace", fontSize: 13, color: "var(--text-body)", overflowX: "auto", margin: "0.8rem 0", whiteSpace: "pre" };
const LI: React.CSSProperties = { color: "var(--text-body)", lineHeight: 1.6, margin: "0.4rem 0", maxWidth: "68ch" };

export default function Formula() {
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "56px 24px 96px" }}>
      <a href="/leaderboard" style={{ color: "var(--accent-hover)", fontSize: 13.5, textDecoration: "none" }}>← the leaderboard</a>
      <h1 style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: 44, lineHeight: 1.05, color: "var(--text-hi)", letterSpacing: "-0.02em", margin: "12px 0 0" }}>
        How the Universal score works
      </h1>
      <p style={{ ...P, color: "var(--text-muted)", fontSize: 17 }}>
        One rating for every building block — a 40k-star repo, an npm package, a docs page — even though
        they carry totally different stats. Objective, open, and cited to source.
      </p>

      <h2 style={H2}>The problem</h2>
      <p style={P}>
        A GitHub repo has stars. An npm package has downloads. A docs page has neither. You can’t rank
        raw stars against raw downloads. So we don’t.
      </p>

      <h2 style={H2}>The formula</h2>
      <ol style={{ paddingLeft: "1.3rem" }}>
        <li style={LI}><strong style={{ color: "var(--text-hi)" }}>Percentile within kind.</strong> Each signal is turned into a 0–100 percentile against everything else that has that signal — stars vs stars, downloads vs downloads, a measured test score vs test scores, community mentions vs mentions.</li>
        <li style={LI}><strong style={{ color: "var(--text-hi)" }}>Blend what a thing has.</strong> The Universal score is the weighted mean of the percentiles a component actually has. A missing signal never counts against it.</li>
        <li style={LI}><strong style={{ color: "var(--text-hi)" }}>Reward corroboration.</strong> A tool backed by several signals (stars + tests + mentions) is scaled up over one riding a single signal — evidence matters.</li>
        <li style={LI}><strong style={{ color: "var(--text-hi)" }}>Honest gaps.</strong> A component with no real signal yet is <em>unranked</em>, never faked to the top.</li>
      </ol>
      <p style={P}>Ties are fine — like ranking models, many tools can share a score. They break on each tool’s own primary metric (a repo on stars, a package on downloads), then evidence, then name.</p>
      <p style={P}><strong style={{ color: "var(--text-hi)" }}>Signals today:</strong> GitHub stars · a measured test score · community mentions. <strong style={{ color: "var(--text-hi)" }}>On the roadmap:</strong> npm/PyPI downloads · dependents · a trending (momentum) axis. Every number links back to its source.</p>

      <h2 style={H2}>Call it from an agent</h2>
      <p style={P}>Armory is the search layer for the agent stack — three ways in, all returning the same ranked JSON.</p>
      <p style={{ ...P, color: "var(--text-muted)", fontSize: 13.5, marginBottom: 2 }}>CLI</p>
      <code style={CODE}>{`npx @namanparikh/armory rank --domain front-end --sort universal
npx @namanparikh/armory rank --component mcp --domain browser --json`}</code>
      <p style={{ ...P, color: "var(--text-muted)", fontSize: 13.5, marginBottom: 2 }}>MCP (any MCP client)</p>
      <code style={CODE}>{`tool: rank_components
args: { "component": "cli", "domain": "front-end", "sort": "universal", "limit": 20 }`}</code>
      <p style={{ ...P, color: "var(--text-muted)", fontSize: 13.5, marginBottom: 2 }}>HTTP / JSON</p>
      <code style={CODE}>{`GET /api/rank?component=mcp&domain=payments&sort=universal&dir=desc&limit=20
GET /api/rank.csv?domain=front-end        # spreadsheet export`}</code>
      <p style={P}>Every response is JSON with a <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent-hover)" }}>universal</code> score, the raw signals, and a source URL — so a model can filter by regex, embed for semantic/RAG matching, or reason over the whole slice.</p>

      <h2 style={H2}>Open by design</h2>
      <p style={P}>The formula, the scores, and every source signal are public. It should evolve — if the weighting is wrong, that’s a pull request, not a mystery.</p>
    </main>
  );
}
