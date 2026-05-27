---
name: linear-claude-managed-agents-bridge
type: claudemd-rules
description: >
  Stateless webhook bridge: Linear `AgentSessionEvent` → CMA session (with routing metadata) → `session.status_idled` webhook → `createAgentActivity` reply.
source_repo: anthropics/claude-cookbook
source_url: https://github.com/anthropics/claude-cookbook/blob/main/managed_agents/linear/CLAUDE.md
license: unknown
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [claude-cookbook, claudemd-rules, managed-agents]
---
## What it is
Stateless webhook bridge: Linear `AgentSessionEvent` → CMA session (with routing metadata) → `session.status_idled` webhook → `createAgentActivity` reply.

## When to use it
Stateless webhook bridge: Linear `AgentSessionEvent` → CMA session (with routing metadata) → `session.status_idled` webhook → `createAgentActivity` reply.

## How to install / invoke
```bash
# Download the file into your project
curl -sL https://github.com/anthropics/claude-cookbook/raw/main/managed_agents/linear/CLAUDE.md -o CLAUDE.md
```

## Notes
Extracted from [`anthropics/claude-cookbook`](https://github.com/anthropics/claude-cookbook/blob/main/managed_agents/linear/CLAUDE.md). Merge relevant sections into your project CLAUDE.md or .claude/rules/ to apply these harness conventions. Pending verify -> promote.
