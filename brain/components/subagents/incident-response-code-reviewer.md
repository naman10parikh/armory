---
name: incident-response-code-reviewer
type: subagents
description: >
  Reviews code for logic flaws, type safety gaps, error handling issues, architectural concerns, and similar vulnerability patterns. Provides fix design recommendations.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/incident-response/agents/code-reviewer.md
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
`wshobson/agents` sub-agent `code-reviewer` (model: sonnet) from the `incident-response` plugin. Reviews code for logic flaws, type safety gaps, error handling issues, architectural concerns, and similar vulnerability patterns. Provides fix design recommendations.

## When to use it
Reviews code for logic flaws, type safety gaps, error handling issues, architectural concerns, and similar vulnerability patterns. Provides fix design recommendations.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/incident-response/agents/code-reviewer.md -o .claude/agents/code-reviewer.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/incident-response/agents/code-reviewer.md). Plugin: `incident-response`. Pending verify -> promote.
