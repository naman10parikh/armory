---
name: implement-2
type: subagents
description: >
  Developer agent. Implements the architect plan step-by-step, guided by AGENTS.md guardrails. Writes tests, leaves no TODOs, and flags plan deviations rather than silently skipping them.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/ship-mate/agents/implement.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [agents, subagents]
---
## What it is
`wshobson/agents` sub-agent `implement` (model: sonnet) from the `ship-mate` plugin. Developer agent. Implements the architect plan step-by-step, guided by AGENTS.md guardrails. Writes tests, leaves no TODOs, and flags plan deviations rather than silently skipping them.

## When to use it
Developer agent. Implements the architect plan step-by-step, guided by AGENTS.md guardrails. Writes tests, leaves no TODOs, and flags plan deviations rather than silently skipping them.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/ship-mate/agents/implement.md -o .claude/agents/implement.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/ship-mate/agents/implement.md). Plugin: `ship-mate`. Pending verify -> promote.
