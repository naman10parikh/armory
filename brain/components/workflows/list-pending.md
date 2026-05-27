---
name: list-pending
type: workflows
description: >
  List recent denied review actions from the receipt chain. Shows what the agent tried to do that was blocked by the review-governance policy.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/review-agent-governance/commands/list-pending.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [agents, workflows]
---
## What it is
`wshobson/agents` workflow `list-pending` from the `review-agent-governance` plugin. List recent denied review actions from the receipt chain. Shows what the agent tried to do that was blocked by the review-governance policy.

## When to use it
List recent denied review actions from the receipt chain. Shows what the agent tried to do that was blocked by the review-governance policy.

## How to install / invoke
```bash
# copy the workflow into your project's .claude/commands/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/review-agent-governance/commands/list-pending.md -o .claude/commands/list-pending.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/review-agent-governance/commands/list-pending.md). Plugin: `review-agent-governance`. Pending verify -> promote.
