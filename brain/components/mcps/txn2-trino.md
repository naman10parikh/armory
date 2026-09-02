---
name: txn2-trino
type: mcps
description: >
  Connects to Trino data warehouses for executing SQL queries, analyzing execution plans, and exploring database schemas with built-in security features like read-only mode, query timeouts, and configurable row limits.
source_repo: txn2/mcp-trino
source_url: https://github.com/txn2/mcp-trino
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 2
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 0
pushed_at: "2026-08-21T14:29:26Z"
---
## What it is
MCP server `Trino`, catalogued on PulseMCP. Connects to Trino data warehouses for executing SQL queries, analyzing execution plans, and exploring database schemas with built-in security features like read-only mode, query timeouts, and configurable row limits.

## When to use it
Connects to Trino data warehouses for executing SQL queries, analyzing execution plans, and exploring database schemas with built-in security features like read-only mode, query timeouts, and configurable row limits.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/txn2/mcp-trino

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/txn2-trino). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
