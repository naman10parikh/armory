---
name: verify-receipt
type: workflows
description: >
  Verify a single Ed25519-signed receipt file. Returns exit 0 if valid, 1 if tampered, 2 if malformed.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/protect-mcp/commands/verify-receipt.md
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
`wshobson/agents` workflow `verify-receipt` from the `protect-mcp` plugin. Verify a single Ed25519-signed receipt file. Returns exit 0 if valid, 1 if tampered, 2 if malformed.

## When to use it
Verify a single Ed25519-signed receipt file. Returns exit 0 if valid, 1 if tampered, 2 if malformed.

## How to install / invoke
```bash
# copy the workflow into your project's .claude/commands/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/protect-mcp/commands/verify-receipt.md -o .claude/commands/verify-receipt.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/protect-mcp/commands/verify-receipt.md). Plugin: `protect-mcp`. Pending verify -> promote.
