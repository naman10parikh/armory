---
name: direkt-log-analysis-sqlite
type: mcps
description: >
  Transforms compressed log files into a queryable SQLite database with tables for logs, stack traces, and errors, enabling efficient analysis and troubleshooting of application issues by timestamp, log level, and module.
source_repo: direkt/mcp-test
source_url: https://github.com/direkt/mcp-test
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 0
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 1
pushed_at: "2025-03-07T23:12:11Z"
---
## What it is
MCP server `Log Analysis SQLite`, catalogued on PulseMCP. Transforms compressed log files into a queryable SQLite database with tables for logs, stack traces, and errors, enabling efficient analysis and troubleshooting of application issues by timestamp, log level, and module.

## When to use it
Transforms compressed log files into a queryable SQLite database with tables for logs, stack traces, and errors, enabling efficient analysis and troubleshooting of application issues by timestamp, log level, and module.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/direkt/mcp-test

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/direkt-log-analysis-sqlite). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
