---
name: nijosmsft-wpr-trace-analyzer
type: mcps
description: >
  Analyzes Windows WPR/ETW performance traces via xperf.exe, exposing CPU utilization, call stacks, DPC/ISR latency, spinlocks, and disk I/O through natural language queries.
source_repo: nijosmsft/wpr-mcp-server
source_url: https://github.com/nijosmsft/wpr-mcp-server
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 2
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `WPR Trace Analyzer`, catalogued on PulseMCP. Analyzes Windows WPR/ETW performance traces via xperf.exe, exposing CPU utilization, call stacks, DPC/ISR latency, spinlocks, and disk I/O through natural language queries.

## When to use it
Analyzes Windows WPR/ETW performance traces via xperf.exe, exposing CPU utilization, call stacks, DPC/ISR latency, spinlocks, and disk I/O through natural language queries.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/nijosmsft/wpr-mcp-server

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/nijosmsft-wpr-trace-analyzer). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
