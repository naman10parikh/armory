---
name: grafana
type: mcps
description: >
  Integrates with Grafana to enable searching dashboards, fetching datasource information, querying Prometheus metrics, and managing incidents through both stdio and SSE transport modes.
source_repo: grafana/mcp-grafana
source_url: https://github.com/grafana/mcp-grafana
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 3047
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
mentions: 2
---
## What it is
MCP server `Grafana`, catalogued on PulseMCP. Integrates with Grafana to enable searching dashboards, fetching datasource information, querying Prometheus metrics, and managing incidents through both stdio and SSE transport modes.

## When to use it
Integrates with Grafana to enable searching dashboards, fetching datasource information, querying Prometheus metrics, and managing incidents through both stdio and SSE transport modes.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/grafana/mcp-grafana

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/grafana). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
