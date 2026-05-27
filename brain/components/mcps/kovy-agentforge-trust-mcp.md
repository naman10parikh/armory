---
name: kovy-agentforge-trust-mcp
type: mcps
description: >
  Query the AgentForge Trust Score (0-100 across five dimensions: security, code health, behavioral audit, community trust, EU compliance) for any MCP server before connecting. Exposes `check_trust`, `evaluate_policy`, `list_trusted`, and `recommend` tools. 3,600+ servers audited, free public API.
source_repo: KOVY/agentforge-trust-mcp
source_url: https://github.com/KOVY/agentforge-trust-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, security]
---
## What it is
Query the AgentForge Trust Score (0-100 across five dimensions: security, code health, behavioral audit, community trust, EU compliance) for any MCP server before connecting. Exposes `check_trust`, `evaluate_policy`, `list_trusted`, and `recommend` tools. 3,600+ servers audited, free public API.

## When to use it
When an agent needs the "Security" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Security). See https://github.com/KOVY/agentforge-trust-mcp. Pending verify -> promote.
