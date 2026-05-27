---
name: appcontrollabs-appcontrol
type: mcps
description: >
  Provides read-only access to AppControl's Windows desktop monitoring data including CPU, GPU, RAM, disk usage, security events, and binary tracking through 9 tools.
source_repo: appcontrollabs/appcontrol-mcp-go
source_url: https://github.com/appcontrollabs/appcontrol-mcp-go
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 23
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `AppControl`, catalogued on PulseMCP. Provides read-only access to AppControl's Windows desktop monitoring data including CPU, GPU, RAM, disk usage, security events, and binary tracking through 9 tools.

## When to use it
Provides read-only access to AppControl's Windows desktop monitoring data including CPU, GPU, RAM, disk usage, security events, and binary tracking through 9 tools.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/appcontrollabs/appcontrol-mcp-go

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/appcontrollabs-appcontrol). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
