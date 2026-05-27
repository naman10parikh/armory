---
name: tomjwxf-scopeblind-gateway
type: mcps
description: >
  Security gateway that wraps any MCP server with per-tool policies, approval gates, and optional Ed25519-signed receipts. Shadow mode logs every tool call; enforce mode blocks, rate-limits, or requires approval.
source_repo: tomjwxf/scopeblind-gateway
source_url: https://github.com/tomjwxf/scopeblind-gateway
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, security]
---
## What it is
Security gateway that wraps any MCP server with per-tool policies, approval gates, and optional Ed25519-signed receipts. Shadow mode logs every tool call; enforce mode blocks, rate-limits, or requires approval.

## When to use it
When an agent needs the "Security" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Security). See https://github.com/tomjwxf/scopeblind-gateway. Pending verify -> promote.
