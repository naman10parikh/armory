---
name: receipt-verifier
type: subagents
description: >
  Expert in Ed25519 signed receipts, JCS canonicalization, hash chains, and offline verification. Use when you need to verify receipt authenticity, audit a receipt chain, detect tampering, or explain why verification failed.
source_repo: wshobson/agents
source_url: https://github.com/wshobson/agents/blob/main/plugins/protect-mcp/agents/receipt-verifier.md
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
`wshobson/agents` sub-agent `receipt-verifier` (model: sonnet) from the `protect-mcp` plugin. Expert in Ed25519 signed receipts, JCS canonicalization, hash chains, and offline verification. Use when you need to verify receipt authenticity, audit a receipt chain, detect tampering, or explain why verification failed.

## When to use it
Expert in Ed25519 signed receipts, JCS canonicalization, hash chains, and offline verification. Use when you need to verify receipt authenticity, audit a receipt chain, detect tampering, or explain why verification failed.

## How to install / invoke
```bash
# copy the agent definition into your project's .claude/agents/
curl -sL https://github.com/wshobson/agents/raw/main/plugins/protect-mcp/agents/receipt-verifier.md -o .claude/agents/receipt-verifier.md
```

## Notes
Extracted from [`wshobson/agents`](https://github.com/wshobson/agents/blob/main/plugins/protect-mcp/agents/receipt-verifier.md). Plugin: `protect-mcp`. Pending verify -> promote.
