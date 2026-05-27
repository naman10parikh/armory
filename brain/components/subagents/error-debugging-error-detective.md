---
name: error-debugging-error-detective
type: subagents
description: >
  Search logs and codebases for error patterns, stack traces, and anomalies. Correlates errors across systems and identifies root causes. Use PROACTIVELY when debugging issues, analyzing logs, or investigating production errors.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/error-debugging/agents/error-detective.md
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [subagent]
---

## What it is
`wshobson/agents` sub-agent `error-debugging-error-detective` (model: sonnet), from the `error-debugging` plugin. Search logs and codebases for error patterns, stack traces, and anomalies. Correlates errors across systems and identifies root causes. Use PROACTIVELY when debugging issues, analyzing logs, or investigating production errors.

## When to use it
Search logs and codebases for error patterns, stack traces, and anomalies. Correlates errors across systems and identifies root causes. Use PROACTIVELY when debugging issues, analyzing logs, or investigating production errors.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/error-debugging/agents/error-detective.md -o .claude/agents/error-debugging-error-detective.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/error-debugging/agents/error-detective.md). The source file carries the full system prompt, capability list, and model assignment. Pending verify -> promote.
