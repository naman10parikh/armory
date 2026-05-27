---
name: sudhan30-freshprobe
type: mcps
description: >
  Data freshness verification for AI agents. Probes endpoints for HTTP cache staleness, latency percentiles, content fingerprinting, TLS health, DNS timing, and redirect chains. Returns deterministic FRESH/STALE/UNKNOWN verdicts with NIST AI RMF mapping. CLI + MCP server + HTTP API with Prometheus metrics and YAML policy engine.
source_repo: Sudhan30/freshprobe
source_url: https://github.com/Sudhan30/freshprobe
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, monitoring]
---
## What it is
Data freshness verification for AI agents. Probes endpoints for HTTP cache staleness, latency percentiles, content fingerprinting, TLS health, DNS timing, and redirect chains. Returns deterministic FRESH/STALE/UNKNOWN verdicts with NIST AI RMF mapping. CLI + MCP server + HTTP API with Prometheus metrics and YAML policy engine.

## When to use it
When an agent needs the "Monitoring" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Monitoring). See https://github.com/Sudhan30/freshprobe. Pending verify -> promote.
