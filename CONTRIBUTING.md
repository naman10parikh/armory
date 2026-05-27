# Contributing to Engram

Engram is a **registry**: a knowledge graph of agent-harness components. Adding one is adding a single markdown file — an *engram* — under `brain/components/<type>/<slug>.md`. Humans open a PR; agents call `engram submit`. Both land in `incoming/` for a quick verify, then promote to `components/`.

## The engram file (the contract everything parses)

Every engram is one markdown file with this YAML frontmatter, then a short body. **The frontmatter schema is the contract** — the catalog generator, the site, the MCP server, and the CLI all read it.

```markdown
---
name: playwright-mcp                  # REQUIRED. kebab-case. MUST equal the filename (minus .md)
type: mcps                            # REQUIRED. one of the 12 category dirs (see below)
description: >                        # REQUIRED. one sentence, folded (>). WHEN to use it, not what it is.
  Drive a real browser (navigate, click, extract) from an agent via Playwright.
source_repo: microsoft/playwright-mcp # REQUIRED if it lives on GitHub (owner/repo)
source_url: https://github.com/microsoft/playwright-mcp   # REQUIRED. canonical link
license: Apache-2.0                   # REQUIRED. SPDX id, or "unknown"
cli_compat: [claude, codex, cursor, gemini, opencode]     # which CLIs it works in
maturity: stable                      # experimental | beta | stable
stars: 12000                          # GitHub stars at verify time (number, optional)
eval_score: null                      # 0-1 quality score once evaluated (null until scored)
verified_at: 2026-05-26               # ISO date this was last checked live
related: [browserbase-mcp, stagehand] # [[wikilinks]] to sibling engrams (the synapses)
tags: [browser, automation, web]      # free-form facets
---

## What it is
One short paragraph. Plain, agent-readable.

## When to use it
The trigger — the situation where an agent should reach for this.

## How to install / invoke
The exact command or config block. Agent-consumable.

## Notes
Gotchas, auth requirements, alternatives. Keep it tight (Simplicity First).
```

## The 12 categories (the `type:` value = the folder)

`mcps` · `skills` · `hooks` · `subagents` · `identity` · `memory` · `claudemd-rules` · `clis-tools` · `evals` · `observability` · `infrastructure` · `workflows`

## Rules (THE FOUR THINGS apply to contributions too)

1. **One engram per file.** `name` must equal the filename and be unique within its type.
2. **`description` is WHEN to use it, not what it does** — it's a routing hint for agents.
3. **Surgical** — add only your engram; don't reformat or "improve" neighbors.
4. **Verify before submit** — the `source_url` resolves, the install command works, `verified_at` is today.
5. **Link liberally** — a `related:` to an engram that doesn't exist yet is fine; it marks a synapse to fill.

## Submit

- **PR:** add the file, open a PR. CI validates frontmatter + recomputes `catalog.json`.
- **Agent:** `engram submit --file path/to/engram.md` (drops into `incoming/`).
