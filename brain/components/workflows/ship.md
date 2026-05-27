---
name: ship
type: workflows
description: >
  Master pipeline entry point. Routes requirements from a story file through scan → orchestrate → architect → implement → review → QA → playwright stages. Use /ship stories/foo.md to start, /ship status to check progress, /ship resume to continue.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/ship-mate/commands/ship.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [agents, workflows]
---
## What it is
`wshobson/agents` workflow `ship` from the `ship-mate` plugin. Master pipeline entry point. Routes requirements from a story file through scan → orchestrate → architect → implement → review → QA → playwright stages. Use /ship stories/foo.md to start, /ship status to check progress, /ship resume to continue.

## When to use it
Master pipeline entry point. Routes requirements from a story file through scan → orchestrate → architect → implement → review → QA → playwright stages. Use /ship stories/foo.md to start, /ship status to check progress, /ship resume to continue.

## How to install / invoke
```bash
# copy the workflow into your project's .claude/commands/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/ship-mate/commands/ship.md -o .claude/commands/ship.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/ship-mate/commands/ship.md). Plugin: `ship-mate`. Pending verify -> promote.
