---
name: review-policy-author
type: subagents
description: >
  Cedar policy author specialized in gating AI agent review actions (PR comments, reviews, merges, CI edits) behind human approval. Use when writing, auditing, or extending a review-governance.cedar policy for review-bot governance.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/review-agent-governance/agents/review-policy-author.md
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
`wshobson/agents` sub-agent `review-policy-author` (model: sonnet) from the `review-agent-governance` plugin. Cedar policy author specialized in gating AI agent review actions (PR comments, reviews, merges, CI edits) behind human approval. Use when writing, auditing, or extending a review-governance.cedar policy for review-bot governance.

## When to use it
Cedar policy author specialized in gating AI agent review actions (PR comments, reviews, merges, CI edits) behind human approval. Use when writing, auditing, or extending a review-governance.cedar policy for review-bot governance.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/review-agent-governance/agents/review-policy-author.md -o .claude/agents/review-policy-author.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/review-agent-governance/agents/review-policy-author.md). Plugin: `review-agent-governance`. Pending verify -> promote.
