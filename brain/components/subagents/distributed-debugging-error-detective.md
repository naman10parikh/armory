---
name: distributed-debugging-error-detective
type: subagents
description: >
  Search logs and codebases for error patterns, stack traces, and anomalies. Correlates errors across systems and identifies root causes. Use PROACTIVELY when debugging issues, analyzing logs, or investigating production errors.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/distributed-debugging/agents/error-detective.md
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
`wshobson/agents` sub-agent `error-detective` (model: sonnet) from the `distributed-debugging` plugin. Search logs and codebases for error patterns, stack traces, and anomalies. Correlates errors across systems and identifies root causes. Use PROACTIVELY when debugging issues, analyzing logs, or investigating production errors.

## When to use it
Search logs and codebases for error patterns, stack traces, and anomalies. Correlates errors across systems and identifies root causes. Use PROACTIVELY when debugging issues, analyzing logs, or investigating production errors.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/distributed-debugging/agents/error-detective.md -o .claude/agents/error-detective.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/distributed-debugging/agents/error-detective.md). Plugin: `distributed-debugging`. Pending verify -> promote.
