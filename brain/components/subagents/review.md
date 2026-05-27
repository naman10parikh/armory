---
name: review
type: subagents
description: >
  PR Reviewer agent. Reviews implemented code using a 3-tier taxonomy (🔴 Critical / 🟡 Should Fix / 💡 Consider). Auto-resolves minor issues, pauses on critical ones. Applies security guardrails. Outputs review-report.md.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/ship-mate/agents/review.md
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
`wshobson/agents` sub-agent `review` (model: inherit) from the `ship-mate` plugin. PR Reviewer agent. Reviews implemented code using a 3-tier taxonomy (🔴 Critical / 🟡 Should Fix / 💡 Consider). Auto-resolves minor issues, pauses on critical ones. Applies security guardrails. Outputs review-report.md.

## When to use it
PR Reviewer agent. Reviews implemented code using a 3-tier taxonomy (🔴 Critical / 🟡 Should Fix / 💡 Consider). Auto-resolves minor issues, pauses on critical ones. Applies security guardrails. Outputs review-report.md.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/ship-mate/agents/review.md -o .claude/agents/review.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/ship-mate/agents/review.md). Plugin: `ship-mate`. Pending verify -> promote.
