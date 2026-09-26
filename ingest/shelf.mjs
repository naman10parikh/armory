// shelf.mjs — the shelf (type) a new contributor-feed row goes on (moved from scripts/ingest-sentinel-feed.mjs so
// it can be tested).
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
