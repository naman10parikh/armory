---
name: aliengiraffe-spotdb
type: mcps
description: >
  Provides direct access to an ephemeral DuckDB instance for CSV file uploads, SQL query execution, and database snapshots through a lightweight Go-based server with WebSocket support and S3 integration for temporary data analysis workflows.
source_repo: aliengiraffe/spotdb
source_url: https://github.com/aliengiraffe/spotdb
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 20
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `SpotDB`, catalogued on PulseMCP. Provides direct access to an ephemeral DuckDB instance for CSV file uploads, SQL query execution, and database snapshots through a lightweight Go-based server with WebSocket support and S3 integration for temporary data analysis workflows.

## When to use it
Provides direct access to an ephemeral DuckDB instance for CSV file uploads, SQL query execution, and database snapshots through a lightweight Go-based server with WebSocket support and S3 integration for temporary data analysis workflows.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/aliengiraffe/spotdb

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/aliengiraffe-spotdb). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
