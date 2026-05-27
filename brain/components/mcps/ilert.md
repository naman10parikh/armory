---
name: ilert
type: mcps
description: >
  Integrates with ilert's alerting and incident management platform to provide direct access to alerting workflows, incident data, and on-call management through a remote HTTP transport requiring only API key authentication.
source_repo: ilert/mcp-ilert
source_url: https://github.com/ilert/mcp-ilert
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 14
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `ilert`, catalogued on PulseMCP. Integrates with ilert's alerting and incident management platform to provide direct access to alerting workflows, incident data, and on-call management through a remote HTTP transport requiring only API key authentication.

## When to use it
Integrates with ilert's alerting and incident management platform to provide direct access to alerting workflows, incident data, and on-call management through a remote HTTP transport requiring only API key authentication.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/ilert/mcp-ilert

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/ilert). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
