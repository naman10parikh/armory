---
name: tokeii0-memprocfs
type: mcps
description: >
  Provides a bridge to memory forensics capabilities through MemProcFS for analyzing process attributes, registry hives, and keys from Windows memory dumps
source_repo: tokeii0/memprocfs-mcp-server
source_url: https://github.com/tokeii0/memprocfs-mcp-server
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 7
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `MemProcFS`, catalogued on PulseMCP. Provides a bridge to memory forensics capabilities through MemProcFS for analyzing process attributes, registry hives, and keys from Windows memory dumps

## When to use it
Provides a bridge to memory forensics capabilities through MemProcFS for analyzing process attributes, registry hives, and keys from Windows memory dumps

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/tokeii0/memprocfs-mcp-server

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/tokeii0-memprocfs). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
