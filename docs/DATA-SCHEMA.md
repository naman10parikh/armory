# Armory data schema — the source of truth

Armory is a **data layer** first. Every surface (site · leaderboard · CLI · MCP · API) reads from
**one version-controlled record: `catalog.json`** (git is the audit log). This is what we store for
every artifact, and how each field feeds the ranking.

## Every artifact carries

| Field | Meaning | Used for |
|---|---|---|
| `name` | canonical slug | identity, dedup |
| `type` | the harness component (mcp · cli · skill · hook · subagent · plugin · rules · memory · eval · tool · …) | the component axis |
| `description` | one-line what-it-is | search, keyword/vertical tagging, semantic reasoning |
| `source_url` / `source_repo` | where it lives (a link an agent can fetch) | install, provenance, source_type |
| `license` | SPDX id or unknown | filtering |
| `cli_compat` | which harnesses it plugs into (claude · cursor · codex · …) | install targeting |
| `maturity` | stable · preview · experimental | a quiet quality hint |
| `tags` | free-form keywords | search, vertical tagging |
| `verified_at` | when the crawl last confirmed it | **staleness** |
| `path` | the brain note for its long-form page | the detail view |

## Signals (each nullable, each cited) — what the ranking reads

| Signal | Source | Applies to |
|---|---|---|
| `stars` | GitHub API | **GitHub repos only** — never conflated with usage |
| `usage` | registry usage counts (e.g. Smithery tool-calls) | non-GitHub sources (a Smithery MCP's claim to fame) |
| `eval_score` | our own install-and-test harness | the ~few we measured (`verified`) |
| `mentions` | how often practitioners reference it (community signal) | the ones the community talks about |
| `forks` · `downloads` · `dependents` · `freshness` | roadmap (crawler enrichment) | repos / npm-pypi packages |

**Primary-metric rule (the display law):** we do NOT show a universal "stars" column — most artifacts
have no stars. Each row surfaces **its own strongest metric** (a repo's stars, a Smithery MCP's usage,
a community pick's mentions) as a real number, with a `✓ verified` badge when we measured it. All
signals are on hover. A `stars` figure is GitHub stars ONLY when the source is GitHub.

## The Universal score (open formula — `/formula`)

Each signal → a 0–100 **percentile within its own kind** (stars vs stars, usage vs usage, …). The
Universal score is the evidence-weighted mean of the percentiles a row has (more corroborating signals
→ scaled up). A row with no real signal is **unranked**, never faked to the top. Every number links to
its source.

## Provenance + freshness (v2 target — WS-D3/D4)

Each artifact will carry `provenance` (which crawl/source) + `crawled_at`, so staleness is answerable
per row and surfaced at `/status`. **Today's freshness (2026-08-23):** the base self-crawl is stale
(~May 2026); a proactive crawler (WS-G1) is being added to keep it current.

## Verticals (WS-D6) — how "finance MCPs" works without heavy load

Cheap **keyword/BM25 vertical tags** are derived from `description` + `tags` at ingest (no per-submission
LLM — it must scale for open source). Those tags are the structured substrate; **semantic + re-rank**
sits on top for arbitrary intent ("front-end tools for finance"). Descriptions are what the reasoning
reads over — so every artifact must have one.

## One source of truth

`catalog.json` is authoritative + version-controlled. A **queryable index** (built from it) powers fast
slice/search; the site/CLI/MCP/API/chat all read the same data. No divergent copies. New tools arrive by
human submission or the agent crawler/feed — always as PRs, always additive.
