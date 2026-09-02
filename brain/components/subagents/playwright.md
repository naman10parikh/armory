---
name: playwright
type: subagents
description: >
  Playwright testing agent. Only runs for FRONTEND tasks. Verifies acceptance criteria in a real browser using the page object pattern. Passes on success, routes back to developer on failure.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/ship-mate/agents/playwright.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [agents, subagents]
mentions: null
---
## What it is
`wshobson/agents` sub-agent `playwright` (model: sonnet) from the `ship-mate` plugin. Playwright testing agent. Only runs for FRONTEND tasks. Verifies acceptance criteria in a real browser using the page object pattern. Passes on success, routes back to developer on failure.

## When to use it
Playwright testing agent. Only runs for FRONTEND tasks. Verifies acceptance criteria in a real browser using the page object pattern. Passes on success, routes back to developer on failure.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/ship-mate/agents/playwright.md -o .claude/agents/playwright.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/ship-mate/agents/playwright.md). Plugin: `ship-mate`. Pending verify -> promote.
