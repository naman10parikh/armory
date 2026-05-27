---
name: agentward-ai-agentward
type: mcps
description: >
  Permission control plane for AI agents. MCP proxy that enforces least-privilege YAML policies on every tool call, classifies sensitive data (PII/PHI), detects dangerous skill chains, and generates compliance audit trails. Supports stdio and HTTP proxy modes.
source_repo: agentward-ai/agentward
source_url: https://github.com/agentward-ai/agentward
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, security]
---
## What it is
Permission control plane for AI agents. MCP proxy that enforces least-privilege YAML policies on every tool call, classifies sensitive data (PII/PHI), detects dangerous skill chains, and generates compliance audit trails. Supports stdio and HTTP proxy modes.

## When to use it
When an agent needs the "Security" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Security). See https://github.com/agentward-ai/agentward. Pending verify -> promote.
