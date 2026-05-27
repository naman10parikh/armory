---
name: drdroidlab-grafana
type: mcps
description: >
  Integrates with Grafana's monitoring platform to query metrics via PromQL, search logs through Loki, execute dashboard panels with template variables, and retrieve metadata for datasources and folders, enabling real-time infrastructure observability and incident response workflows.
source_repo: drdroidlab/grafana-mcp-server
source_url: https://github.com/drdroidlab/grafana-mcp-server
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 6
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Grafana`, catalogued on PulseMCP. Integrates with Grafana's monitoring platform to query metrics via PromQL, search logs through Loki, execute dashboard panels with template variables, and retrieve metadata for datasources and folders, enabling real-time infrastructure observability and incident response workflows.

## When to use it
Integrates with Grafana's monitoring platform to query metrics via PromQL, search logs through Loki, execute dashboard panels with template variables, and retrieve metadata for datasources and folders, enabling real-time infrastructure observability and incident response workflows.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/drdroidlab/grafana-mcp-server

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/drdroidlab-grafana). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
