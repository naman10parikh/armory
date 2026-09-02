---
name: prometheus
type: mcps
description: >
  Integrates with Prometheus monitoring systems to provide direct access to time-series metrics through specialized tools for discovering available metrics and labels, retrieving metadata and target information, and executing PromQL queries for real-time performance analysis and operational intelligence.
source_repo: idanfishman/prometheus-mcp
source_url: https://github.com/idanfishman/prometheus-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 27
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
mentions: 1
forks: 6
pushed_at: "2026-02-09T01:58:49Z"
---
## What it is
MCP server `Prometheus`, catalogued on PulseMCP. Integrates with Prometheus monitoring systems to provide direct access to time-series metrics through specialized tools for discovering available metrics and labels, retrieving metadata and target information, and executing PromQL queries for real-time performance analysis and operational intelligence.

## When to use it
Integrates with Prometheus monitoring systems to provide direct access to time-series metrics through specialized tools for discovering available metrics and labels, retrieving metadata and target information, and executing PromQL queries for real-time performance analysis and operational intelligence.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/idanfishman/prometheus-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/prometheus). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
