---
name: mrnugget-tailscale-status
type: mcps
description: >
  Enables querying Tailscale status by parsing CLI output on macOS, providing structured data about connected devices and network information.
source_repo: mrnugget/tailscale-mcp
source_url: https://github.com/mrnugget/tailscale-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 7
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Tailscale Status`, catalogued on PulseMCP. Enables querying Tailscale status by parsing CLI output on macOS, providing structured data about connected devices and network information.

## When to use it
Enables querying Tailscale status by parsing CLI output on macOS, providing structured data about connected devices and network information.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/mrnugget/tailscale-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/mrnugget-tailscale-status). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
