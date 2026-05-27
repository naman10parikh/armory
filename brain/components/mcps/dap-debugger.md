---
name: dap-debugger
type: mcps
description: >
  Integrates with DAP-compatible debuggers like Delve to provide comprehensive debugging session management including breakpoints, execution control, state inspection, and expression evaluation for multiple programming languages.
source_repo: go-delve/mcp-dap-server
source_url: https://github.com/go-delve/mcp-dap-server
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 85
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `DAP Debugger`, catalogued on PulseMCP. Integrates with DAP-compatible debuggers like Delve to provide comprehensive debugging session management including breakpoints, execution control, state inspection, and expression evaluation for multiple programming languages.

## When to use it
Integrates with DAP-compatible debuggers like Delve to provide comprehensive debugging session management including breakpoints, execution control, state inspection, and expression evaluation for multiple programming languages.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/go-delve/mcp-dap-server

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/dap-debugger). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
