---
name: incident-response-debugger
type: subagents
description: >
  Performs deep root cause analysis through code path tracing, git bisect automation, dependency analysis, and systematic hypothesis testing for production bugs.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/incident-response/agents/debugger.md
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
`wshobson/agents` sub-agent `debugger` (model: sonnet) from the `incident-response` plugin. Performs deep root cause analysis through code path tracing, git bisect automation, dependency analysis, and systematic hypothesis testing for production bugs.

## When to use it
Performs deep root cause analysis through code path tracing, git bisect automation, dependency analysis, and systematic hypothesis testing for production bugs.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/incident-response/agents/debugger.md -o .claude/agents/debugger.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/incident-response/agents/debugger.md). Plugin: `incident-response`. Pending verify -> promote.
