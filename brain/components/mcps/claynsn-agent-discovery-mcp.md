---
name: claynsn-agent-discovery-mcp
type: mcps
description: >
  Minimal MCP server (~250 lines TS) for ERC-8004 agent discovery + x402 payment. Three tools: `find_agents_by_skill` (via 8004scan public API), `get_agent_card`, `call_agent_with_payment` using Coinbase's official `x402-fetch`. Direct EOA signing — no smart account, no bundler, no relay. Works with Claude Code, OpenClaw, Cursor, Cline. USDC on Base/Ethereum + testnets, MIT.
source_repo: Claynsn/agent-discovery-mcp
source_url: https://github.com/Claynsn/agent-discovery-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, finance-fintech]
stars: 5
---
## What it is
Minimal MCP server (~250 lines TS) for ERC-8004 agent discovery + x402 payment. Three tools: `find_agents_by_skill` (via 8004scan public API), `get_agent_card`, `call_agent_with_payment` using Coinbase's official `x402-fetch`. Direct EOA signing — no smart account, no bundler, no relay. Works with Claude Code, OpenClaw, Cursor, Cline. USDC on Base/Ethereum + testnets, MIT.

## When to use it
When an agent needs the "Finance & Fintech" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Finance & Fintech). See https://github.com/Claynsn/agent-discovery-mcp. Pending verify -> promote.
