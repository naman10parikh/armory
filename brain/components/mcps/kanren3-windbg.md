---
name: kanren3-windbg
type: mcps
description: >
  Exposes WinDbg debugging sessions as an MCP server for command execution, documentation lookup, and target interruption.
source_repo: kanren3/windbg-mcp-rs
source_url: https://github.com/kanren3/windbg-mcp-rs
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 54
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 9
pushed_at: "2026-08-09T10:20:26Z"
---
## What it is
MCP server `WinDbg`, catalogued on PulseMCP. Exposes WinDbg debugging sessions as an MCP server for command execution, documentation lookup, and target interruption.

## When to use it
Exposes WinDbg debugging sessions as an MCP server for command execution, documentation lookup, and target interruption.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/kanren3/windbg-mcp-rs

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/kanren3-windbg). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
