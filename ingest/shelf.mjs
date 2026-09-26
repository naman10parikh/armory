// shelf.mjs — where a new contributor-feed row goes: its shelf (type) and its slug, which together make its URL,
// /e/<type>/<slug>, and the name its page shows (moved from scripts/ingest-sentinel-feed.mjs so they can be tested).
//
// Shelf assignment. The old version was a three-way guess that sent EVERYTHING non-MCP,
// non-memory to `clis-tools` — which quietly inflated our best-scored shelf with things that are
// not CLIs and starved the thin ones (skills 29 scored of 1,134, hooks 18 of 140). The repo
// description is already fetched for the frontmatter, so classify on it. Deterministic, no LLM
// (hard rule: no per-submission model call). Patterns are deliberately high-precision — a wrong
// shelf is worse than the honest default, so anything unmatched still falls through to clis-tools.
const SHELF = [
  ["mcps", /\bmcp\b|model context protocol/i],
  ["skills", /\b(claude|agent|ai)[- ]skills?\b|\bskill[- ](file|pack|library|collection|set)s?\b|^skills?\b/i],
  ["hooks", /\bhooks?\b(?=.*\b(claude|agent|lifecycle|pre-?tool|post-?tool|commit)\b)|\b(pre|post)-?tool-?use\b/i],
  ["subagents", /\bsub-?agents?\b/i],
  ["evals", /\b(eval|evals|evaluation|benchmark|bench|leaderboard)\b/i], // "bench": terminal-bench-2-1 (CP143)
  ["observability", /\b(observability|tracing|telemetry|opentelemetry)\b/i],
  ["memory", /\bmem(ory)?\b|-mem\b/i],
];

// MCP is read from the name, the URL and the description's first sentence: what the repository says it is.
// Further on, "Detect vulnerabilities in agent configurations, MCP servers, and tool permissions" is what a
// scanner works on, not what it is, and it filed AgentShield, a command-line scanner, under mcps (CP143).
const firstSentence = (text) => String(text || "").trim().split(/(?<=[.!?])\s+/)[0];

export function typeOf(name, url, description = "") {
  for (const [type, re] of SHELF) {
    const hay = `${name} ${url} ${type === "mcps" ? firstSentence(description) : description}`;
    if (re.test(hay)) return type;
  }
  return "clis-tools";
}

// The slug a new row takes: its own when no row holds it. When a row of a different GitHub repository holds it
// (the Playwright MCP row, github.com/microsoft/playwright-mcp, holds microsoft-playwright), the first free -2,
// -3, the suffix the catalog already uses. null when a row of the same repository holds the slug or a suffixed
// one (the tool is listed already), or when a holder names no repository to compare. Existing rows keep their
// slugs, so no URL changes.
// The name a person sees on a new row that had to take a suffix: its own slug. The Playwright MCP row holds
// microsoft-playwright, so microsoft/playwright's page is /e/clis-tools/microsoft-playwright-2 and its heading
// reads "microsoft-playwright". undefined when the row got its own slug, which is then its name.
export const titleFor = (own, slug) => (slug && slug !== own ? own : undefined);

const ownerRepo = (url) => {
  const m = String(url || "").match(/github\.com\/([^/\s#?]+)\/([^/\s#?]+)/i);
  return m ? `${m[1]}/${m[2].replace(/\.git$/i, "")}`.toLowerCase() : null;
};
export function freeSlug(base, url, components) {
  const repo = ownerRepo(url);
  const held = new Map();
  for (const c of components || []) held.set(c.name, [...(held.get(c.name) || []), c]);
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const rows = held.get(slug);
    if (!rows) return slug;
    if (!repo || rows.some((r) => { const k = ownerRepo(r.source_url); return !k || k === repo; })) return null;
  }
}
