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
| `verified_at` | when the crawl last confirmed it | **crawl** staleness |
| `pushed_at` | ISO-8601 of the last push to the repo (GitHub `pushedAt`) | **artifact** staleness + tiebreak — **never a score term** |
| `path` | the brain note for its long-form page | the detail view |

Two fields derived by the engine, present on every ranked row (`kind`, `stale`) — see below.

## Signals (each nullable, each cited) — what the ranking reads

| Signal | Weight | Source | Applies to |
|---|---:|---|---|
| `mentions` | 1.2 | how often practitioners reference it (community signal) | the ones the community talks about |
| `eval_score` (`tested`) | 1.0 | our own install-and-test harness | the ~few we measured (`verified`) |
| `stars` | 1.0 | GitHub API | **GitHub repos only** — never conflated with usage |
| `usage` | 0.9 | registry usage counts (e.g. Smithery tool-calls) | non-GitHub sources (a Smithery MCP's claim to fame) |
| `forks` | 0.8 | GitHub API `forkCount`, same call as stars | **GitHub repo roots only** — a file inside a repo has not earned its parent's forks |
| `downloads` · `dependents` · `citations` | — | roadmap (crawler enrichment) | npm/PyPI packages, papers |

**`pushed_at` is deliberately NOT a signal.** Recency proves an artifact is alive, not that anyone
uses it — a freshly-pushed 0-star repo must never outrank a maintained 100-star one. It earns its keep
in two other ways: it raises a **`stale`** flag (no push in 24 months) and it breaks ties, so among the
thousands of rows sharing a score, the ones still being worked on come first.

**Weights order the corroboration, not the win.** The strongest percentile a row holds is always its
base, whatever signal produced it; a weight only decides how much a *secondary* signal contributes.
The ordering principle: **weight = how much deliberate human intent the number encodes, discounted by
how easy it is to fake.** A practitioner writing about a tool (1.2) is more intent than our own test
(1.0, and binary today), than a star (1.0, but trivially farmable), than a self-reported registry
counter (0.9), than a fork (0.8 — real, but the weakest independent claim, and correlated with stars).

**Primary-metric rule (the display law):** we do NOT show a universal "stars" column — most artifacts
have no stars. Each row surfaces **its own strongest metric** (a repo's stars, a Smithery MCP's usage,
a community pick's mentions) as a real number, with a `✓ verified` badge when we measured it. All
signals are on hover. A `stars` figure is GitHub stars ONLY when the source is GitHub.

## The Universal score (open formula — `/formula`)

**Step 1 — each signal becomes a percentile inside its own pool.** A pool is a **(signal, kind)** pair,
counted over **distinct URLs**. `kind` is derived from the URL and is one of:

| `kind` | what it is | example |
|---|---|---|
| `github-root` | a repo | `github.com/owner/repo` |
| `github-file` | a file *inside* a repo | `github.com/owner/repo/blob/…` |
| `registry` | a registry listing | smithery.ai · mcp.so · pulsemcp.com · glama.ai |
| `package` | a package-registry page | npmjs.com · pypi.org · crates.io |
| `paper` | a paper | arxiv.org · doi.org · aclanthology.org |
| `hf` | a model or dataset | huggingface.co |
| `website` | anything else, incl. other VCS hosts | a docs page, a vendor site |

Partitioning by kind is what makes one score legitimate across shapes: a repo's stars are ranked
against other repos' stars, never against a registry's install count. Counting **distinct URLs** is
what stops a duplicate listing from voting twice — the first row on a URL contributes the group's one
value and every row on that URL receives that same percentile, so the same artifact crawled five times
can no longer score five different numbers or inflate everyone else's denominator.

**Step 2 — the percentiles blend, monotonically:**

```
universal = 0.8 × base  +  0.2 × others
    base   = the strongest percentile the row holds (any signal)
    others = Σ(percentile × weight) ÷ Σ(weight)  over every OTHER signal it holds  (0 if none)
```

One signal caps at **80**. A second or third can only **add** — earning more evidence is never
punished. (It used to be: under the old evidence-weighted mean, a p100 repo that picked up one
mention *lost* 19.3 points. See `FORMULA-AUDIT.md` §H2.) A row that is p100 on everything reaches 100.

A row with no real signal is **unranked**, never faked to the top. Every number links to its source.

**Ties break on** universal → number of signals → most recently pushed → stars → name.

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

### Adding a signal takes THREE edits — miss one and the nightly rebuild deletes it

`catalog.json` is **derived** from `brain/components/**/*.md`, and `ingest/catalog.mjs` silently drops
any key not in its `FIELDS` map. That has cost live data three times (19,367 stars reverted in one
rebuild; `tested` 60 → 3 and `mentions` 275 → 0 in another; `mentions` again on the next nightly run).
So every new field needs all three of:

1. the key in `FIELDS` in **`ingest/catalog.mjs`**
2. the key in the `FIELDS` array in **`scripts/persist-signals-to-brain.mjs`**
3. the value written into the component note's **frontmatter** (that script does it)

and, if it is score-bearing, a weight in `WEIGHTS` in **`lib/rank.mjs`** — which `/formula` imports, so
the public page's arithmetic follows automatically and cannot drift from the score.
