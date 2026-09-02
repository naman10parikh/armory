---
name: nhpsecurity-policy-firewall
type: mcps
description: >
  Security proxy that enforces allow/deny policies on MCP tool calls between AI clients and downstream MCP servers, with secret redaction and audit logging.
source_repo: nhpsecurity/mcp-policy-firewall
source_url: https://github.com/nhpsecurity/mcp-policy-firewall
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 2
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 0
pushed_at: "2026-04-19T21:25:39Z"
---
## What it is
MCP server `Policy Firewall`, catalogued on PulseMCP. Security proxy that enforces allow/deny policies on MCP tool calls between AI clients and downstream MCP servers, with secret redaction and audit logging.

## When to use it
Security proxy that enforces allow/deny policies on MCP tool calls between AI clients and downstream MCP servers, with secret redaction and audit logging.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/nhpsecurity/mcp-policy-firewall

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/nhpsecurity-policy-firewall). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
