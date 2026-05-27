---
name: neka-nat-freecad
type: mcps
description: >
  Enables AI-driven CAD modeling by providing a remote procedure call (RPC) server that allows programmatic control of FreeCAD, supporting operations like creating documents, inserting parts, editing objects, and executing Python code for generative design workflows.
source_repo: neka-nat/freecad-mcp
source_url: https://github.com/neka-nat/freecad-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 1012
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `FreeCAD`, catalogued on PulseMCP. Enables AI-driven CAD modeling by providing a remote procedure call (RPC) server that allows programmatic control of FreeCAD, supporting operations like creating documents, inserting parts, editing objects, and executing Python code for generative design workflows.

## When to use it
Enables AI-driven CAD modeling by providing a remote procedure call (RPC) server that allows programmatic control of FreeCAD, supporting operations like creating documents, inserting parts, editing objects, and executing Python code for generative design workflows.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/neka-nat/freecad-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/neka-nat-freecad). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
