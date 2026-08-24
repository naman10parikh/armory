---
name: oauth-mcp-gateway-dsmoz
type: mcps
description: >
  OAuth 2.0 gateway that authenticates Claude clients and proxies requests to multiple upstream MCP servers from a single endpoint.
source_repo: dsmoz/mcp-oauth-server
source_url: https://github.com/dsmoz/mcp-oauth-server
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: null
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `OAuth MCP Gateway`, catalogued on PulseMCP. OAuth 2.0 gateway that authenticates Claude clients and proxies requests to multiple upstream MCP servers from a single endpoint.

## When to use it
OAuth 2.0 gateway that authenticates Claude clients and proxies requests to multiple upstream MCP servers from a single endpoint.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/dsmoz/mcp-oauth-server

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/oauth-mcp-gateway-dsmoz). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
