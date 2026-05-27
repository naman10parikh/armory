---
name: audit-chain
type: workflows
description: >
  Walk the receipt chain in ./receipts/ verifying every signature and hash link. Detects insertions, deletions, and tampering across the entire audit trail.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/protect-mcp/commands/audit-chain.md
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
`wshobson/agents` workflow `audit-chain` from the `protect-mcp` plugin. Walk the receipt chain in ./receipts/ verifying every signature and hash link. Detects insertions, deletions, and tampering across the entire audit trail.

## When to use it
Walk the receipt chain in ./receipts/ verifying every signature and hash link. Detects insertions, deletions, and tampering across the entire audit trail.

## How to install / invoke
```bash
# copy the workflow into your project's .claude/commands/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/protect-mcp/commands/audit-chain.md -o .claude/commands/audit-chain.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/protect-mcp/commands/audit-chain.md). Plugin: `protect-mcp`. Pending verify -> promote.
