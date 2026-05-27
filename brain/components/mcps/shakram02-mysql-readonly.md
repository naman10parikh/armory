---
name: shakram02-mysql-readonly
type: mcps
description: >
  Provides secure read-only MySQL database access with strict query validation that blocks all write operations and dangerous functions while allowing SELECT, SHOW, DESCRIBE, and EXPLAIN statements for safe data exploration and analysis.
source_repo: shakram02/go-readonly-mcp-sql-db
source_url: https://github.com/shakram02/go-readonly-mcp-sql-db
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 2
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `MySQL Read-Only`, catalogued on PulseMCP. Provides secure read-only MySQL database access with strict query validation that blocks all write operations and dangerous functions while allowing SELECT, SHOW, DESCRIBE, and EXPLAIN statements for safe data exploration and analysis.

## When to use it
Provides secure read-only MySQL database access with strict query validation that blocks all write operations and dangerous functions while allowing SELECT, SHOW, DESCRIBE, and EXPLAIN statements for safe data exploration and analysis.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/shakram02/go-readonly-mcp-sql-db

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/shakram02-mysql-readonly). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
