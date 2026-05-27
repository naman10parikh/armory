---
name: a0dotrun-expose
type: mcps
description: >
  Proxy server that enables communication between clients and MCP-compatible services through JSON-RPC, forwarding requests to configured backend URLs while maintaining proper error handling and response formatting.
source_repo: deadcodedump/expose
source_url: https://github.com/deadcodedump/expose
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 20
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Expose (JSON-RPC Proxy)`, catalogued on PulseMCP. Proxy server that enables communication between clients and MCP-compatible services through JSON-RPC, forwarding requests to configured backend URLs while maintaining proper error handling and response formatting.

## When to use it
Proxy server that enables communication between clients and MCP-compatible services through JSON-RPC, forwarding requests to configured backend URLs while maintaining proper error handling and response formatting.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/deadcodedump/expose

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/a0dotrun-expose). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
