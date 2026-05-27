---
name: samtalki-agenteval
type: mcps
description: >
  Provides persistent Julia code evaluation with automatic session management, eliminating startup penalties through maintained variable state and package persistence.
source_repo: samtalki/agentrepl.jl
source_url: https://github.com/samtalki/agentrepl.jl
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 4
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `AgentEval (Julia)`, catalogued on PulseMCP. Provides persistent Julia code evaluation with automatic session management, eliminating startup penalties through maintained variable state and package persistence.

## When to use it
Provides persistent Julia code evaluation with automatic session management, eliminating startup penalties through maintained variable state and package persistence.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/samtalki/agentrepl.jl

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/samtalki-agenteval). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
