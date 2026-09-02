---
name: non-dirty-claude-desktop-restart
type: mcps
description: >
  Enables automated restarts of Claude Desktop on macOS by leveraging psutil to safely terminate and relaunch the application process.
source_repo: non-dirty/mcp-server-restart
source_url: https://github.com/non-dirty/mcp-server-restart
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 7
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 4
pushed_at: "2024-12-02T05:08:38Z"
---
## What it is
MCP server `Claude Desktop Restart`, catalogued on PulseMCP. Enables automated restarts of Claude Desktop on macOS by leveraging psutil to safely terminate and relaunch the application process.

## When to use it
Enables automated restarts of Claude Desktop on macOS by leveraging psutil to safely terminate and relaunch the application process.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/non-dirty/mcp-server-restart

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/non-dirty-claude-desktop-restart). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
