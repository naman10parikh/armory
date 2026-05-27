---
name: csoai-agent-rate-limiter
type: mcps
description: >
  Fleet-wide shared rate limiter for agent-to-agent and multi-MCP deployments with coordinated throttling across servers.
source_repo: csoai-org/agent-rate-limiter-mcp
source_url: https://github.com/csoai-org/agent-rate-limiter-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 0
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Agent Rate Limiter`, catalogued on PulseMCP. Fleet-wide shared rate limiter for agent-to-agent and multi-MCP deployments with coordinated throttling across servers.

## When to use it
Fleet-wide shared rate limiter for agent-to-agent and multi-MCP deployments with coordinated throttling across servers.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/csoai-org/agent-rate-limiter-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/csoai-agent-rate-limiter). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
