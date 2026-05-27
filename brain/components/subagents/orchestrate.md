---
name: orchestrate
type: subagents
description: >
  Product Orchestrator agent. Reads the active story file, asks clarifying product questions one at a time, confirms task type (FRONTEND/BACKEND), and produces a complete unambiguous spec in orchestrator-output.md.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/ship-mate/agents/orchestrate.md
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
`wshobson/agents` sub-agent `orchestrate` (model: sonnet) from the `ship-mate` plugin. Product Orchestrator agent. Reads the active story file, asks clarifying product questions one at a time, confirms task type (FRONTEND/BACKEND), and produces a complete unambiguous spec in orchestrator-output.md.

## When to use it
Product Orchestrator agent. Reads the active story file, asks clarifying product questions one at a time, confirms task type (FRONTEND/BACKEND), and produces a complete unambiguous spec in orchestrator-output.md.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/ship-mate/agents/orchestrate.md -o .claude/agents/orchestrate.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/ship-mate/agents/orchestrate.md). Plugin: `ship-mate`. Pending verify -> promote.
