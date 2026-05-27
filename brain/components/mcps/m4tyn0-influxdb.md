---
name: m4tyn0-influxdb
type: mcps
description: >
  Provides secure, read-only access to InfluxDB 1.8 time-series databases with JWT authentication, enabling database listing, measurement exploration, and query execution while enforcing security restrictions.
source_repo: m4tyn0/influx_mcp
source_url: https://github.com/m4tyn0/influx_mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 4
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `InfluxDB`, catalogued on PulseMCP. Provides secure, read-only access to InfluxDB 1.8 time-series databases with JWT authentication, enabling database listing, measurement exploration, and query execution while enforcing security restrictions.

## When to use it
Provides secure, read-only access to InfluxDB 1.8 time-series databases with JWT authentication, enabling database listing, measurement exploration, and query execution while enforcing security restrictions.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/m4tyn0/influx_mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/m4tyn0-influxdb). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
