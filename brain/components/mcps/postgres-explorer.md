---
name: postgres-explorer
type: mcps
description: >
  Provides read-only PostgreSQL database access for exploring schemas and executing safe queries, deployable via Docker or NPX for data analysis without risk of modification.
source_repo: danielrsnell/postgres-mcp
source_url: https://github.com/danielrsnell/postgres-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 1
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `PostgreSQL Explorer`, catalogued on PulseMCP. Provides read-only PostgreSQL database access for exploring schemas and executing safe queries, deployable via Docker or NPX for data analysis without risk of modification.

## When to use it
Provides read-only PostgreSQL database access for exploring schemas and executing safe queries, deployable via Docker or NPX for data analysis without risk of modification.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/danielrsnell/postgres-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/postgres-explorer). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
