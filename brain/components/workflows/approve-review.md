---
name: approve-review
type: workflows
description: >
  Open a review-action approval window by creating the ./.review-approved flag file. Takes an optional reason string that is embedded in the receipt chain.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/review-agent-governance/commands/approve-review.md
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
`wshobson/agents` workflow `approve-review` from the `review-agent-governance` plugin. Open a review-action approval window by creating the ./.review-approved flag file. Takes an optional reason string that is embedded in the receipt chain.

## When to use it
Open a review-action approval window by creating the ./.review-approved flag file. Takes an optional reason string that is embedded in the receipt chain.

## How to install / invoke
```bash
# copy the workflow into your project's .claude/commands/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/review-agent-governance/commands/approve-review.md -o .claude/commands/approve-review.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/review-agent-governance/commands/approve-review.md). Plugin: `review-agent-governance`. Pending verify -> promote.
