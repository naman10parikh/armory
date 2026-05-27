---
name: conductor-validator
type: subagents
description: >
  Validates Conductor project artifacts for completeness, consistency, and correctness. Use after setup, when diagnosing issues, or before implementation to verify project context.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/conductor/agents/conductor-validator.md
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [subagent]
---

## What it is
`wshobson/agents` sub-agent `conductor-validator` (model: opus), from the `conductor` plugin. Validates Conductor project artifacts for completeness, consistency, and correctness. Use after setup, when diagnosing issues, or before implementation to verify project context.

## When to use it
Validates Conductor project artifacts for completeness, consistency, and correctness. Use after setup, when diagnosing issues, or before implementation to verify project context.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/conductor/agents/conductor-validator.md -o .claude/agents/conductor-validator.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/conductor/agents/conductor-validator.md). The source file carries the full system prompt, capability list, and model assignment. Pending verify -> promote.
