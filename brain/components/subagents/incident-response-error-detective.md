---
name: incident-response-error-detective
type: subagents
description: >
  Analyzes error traces, logs, and observability data to identify error signatures, reproduction steps, user impact, and timeline context for production issues.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/incident-response/agents/error-detective.md
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
`wshobson/agents` sub-agent `error-detective` (model: sonnet) from the `incident-response` plugin. Analyzes error traces, logs, and observability data to identify error signatures, reproduction steps, user impact, and timeline context for production issues.

## When to use it
Analyzes error traces, logs, and observability data to identify error signatures, reproduction steps, user impact, and timeline context for production issues.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/incident-response/agents/error-detective.md -o .claude/agents/error-detective.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/incident-response/agents/error-detective.md). Plugin: `incident-response`. Pending verify -> promote.
