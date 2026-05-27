---
name: policy-enforcer
type: subagents
description: >
  Cedar policy author and reviewer for Claude Code tool calls. Writes, audits, and explains Cedar policies that govern Bash, Edit, Write, WebFetch, and other tools. Use when you need declarative, formally verifiable rules for what an AI agent can and cannot do in a project.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/protect-mcp/agents/policy-enforcer.md
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
`wshobson/agents` sub-agent `policy-enforcer` (model: opus) from the `protect-mcp` plugin. Cedar policy author and reviewer for Claude Code tool calls. Writes, audits, and explains Cedar policies that govern Bash, Edit, Write, WebFetch, and other tools. Use when you need declarative, formally verifiable rules for what an AI agent can and cannot do in a project.

## When to use it
Cedar policy author and reviewer for Claude Code tool calls. Writes, audits, and explains Cedar policies that govern Bash, Edit, Write, WebFetch, and other tools. Use when you need declarative, formally verifiable rules for what an AI agent can and cannot do in a project.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/protect-mcp/agents/policy-enforcer.md -o .claude/agents/policy-enforcer.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/protect-mcp/agents/policy-enforcer.md). Plugin: `protect-mcp`. Pending verify -> promote.
