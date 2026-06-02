# Component Architecture

How the agent-native brain is built, and how to extend it. (For the why + positioning, see [README](../README.md). For the component file contract, see [CONTRIBUTING](../CONTRIBUTING.md).)

## The one-line model

> **One markdown vault is the source of truth. Everything else is generated from it.**

```
brain/  =  Obsidian vault (markdown + YAML frontmatter + [[wikilinks]])   ← SOURCE OF TRUTH
   │        components/<type>/<slug>.md  =  one component per file
   │
   ├─ node ingest/catalog.mjs ─────────────▶ catalog.json   (the generated index; counts computed)
   │
   └─ catalog.json fans out to 4 surfaces:
        ├─ Obsidian        — open brain/ as a vault; related[] draws the graph (synapses)
        ├─ site/           — Vercel facet-search (reads catalog.json + renders component markdown)
        ├─ mcp/            — Component MCP server: search_components / get_component / submit_component
        └─ cli/            — `component` CLI: search / get / install / submit / list
```

If markdown and a generated artifact ever disagree, **the markdown wins** — regenerate.

## The 12 categories

`mcps · skills · hooks · subagents · identity · memory · claudemd-rules · clis-tools · evals · observability · infrastructure · workflows`

Each lives under `brain/components/<type>/`, with a category hub note `<type>.md` (excluded from the catalog). The four usually-neglected ones — **clis-tools, evals, observability, infrastructure** — are first-class here; that's the differentiation surface.

## The component (the contract)

Every component is one markdown file: YAML frontmatter (`name · type · description · source_repo · source_url · license · cli_compat[] · maturity · stars · eval_score · verified_at · related[] · tags[]`) + a short body (What / When to use / Install / Notes). The frontmatter is the contract every surface parses. `name` must equal the filename and be unique within its type. `description` is a *WHEN-to-use* routing hint for agents, not a feature list.

## The catalog (keeping it honest)

`ingest/catalog.mjs` walks `brain/components/`, parses frontmatter (zero-dep parser), and writes `catalog.json` with **computed counts** (never hand-typed). `ingest/validate.mjs` enforces the contract. CI (`.github/workflows/catalog.yml`) re-runs both and **fails the build if the committed `catalog.json` drifts** — so the numbers in the repo can never lie.

## The ingest pipeline (how the brain grows)

```
sources ──crawl──▶ incoming/<source>/*.md ──verify──▶ promote ──▶ components/<type>/*.md
 (GitHub MCP /        (review queue:           (links resolve,      (canonical, in the
  API / Firecrawl)     stubs, not yet trusted)  dedupe, score)       vault + catalog)
```

- `ingest/crawl.mjs` — pluggable `SourceAdapter`s map an external source to component stubs in `incoming/<source>/`. Add a source = add an adapter.
- `ingest/verify-links.mjs` — resolves each `source_url`, flags dead links, stamps `verified_at`.
- `ingest/promote.mjs` — validates + dedupes (by name+type) and moves stubs from `incoming/` into `components/`. Defaults to dry-run; only writes the vault with explicit `--apply`.

`incoming/` is a trust boundary: crawled or community-submitted stubs land there and are never counted until promoted.

## Multi-CLI emit (the moat, automated)

Canonical components fan out to each coding CLI's native format (`.claude / .codex / .cursor / .gemini / .opencode`) via `cli_compat[]`-driven emitters. One source corpus, every CLI — without the manual cross-CLI drift that plagues hand-maintained collections.

## The self-improving loop (recursive)

Nightly (AutoLab): crawl new sources → verify staleness → score → prune dead → surface category/CLI gaps → open PRs. The brain proposes additions to its own pipeline. This is the recursively-self-improving layer: the registry gets smarter without a human in the loop, while humans + agents still gate quality via review.

## How to contribute

- **Add one component:** drop a file in `brain/components/<type>/`, open a PR. CI validates + recomputes the catalog. (Or `component submit --file <path>`.)
- **Add a source:** implement a `SourceAdapter` in `ingest/crawl.mjs`.
- **Add a CLI target:** add a format adapter to the emitter.
- Obey the component contract and keep diffs surgical — see [CONTRIBUTING](../CONTRIBUTING.md).
