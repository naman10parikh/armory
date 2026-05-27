---
name: team-reviewer
type: subagents
description: >
  Multi-dimensional code reviewer that operates on one assigned review dimension (security, performance, architecture, testing, or accessibility) with structured finding format. Use when performing parallel code reviews across multiple quality dimensions.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/agent-teams/agents/team-reviewer.md
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
`wshobson/agents` sub-agent `team-reviewer` (model: opus) from the `agent-teams` plugin. Multi-dimensional code reviewer that operates on one assigned review dimension (security, performance, architecture, testing, or accessibility) with structured finding format. Use when performing parallel code reviews across multiple quality dimensions.

## When to use it
Multi-dimensional code reviewer that operates on one assigned review dimension (security, performance, architecture, testing, or accessibility) with structured finding format. Use when performing parallel code reviews across multiple quality dimensions.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/agent-teams/agents/team-reviewer.md -o .claude/agents/team-reviewer.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/agent-teams/agents/team-reviewer.md). Plugin: `agent-teams`. Pending verify -> promote.
