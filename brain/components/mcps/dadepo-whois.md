---
name: dadepo-whois
type: mcps
description: >
  Provides network information lookup through WHOIS and RIR database queries across RIPE NCC and ARIN regions, enabling contact card lookups, AS-SET expansion, route object validation, and BGP security analysis with TTL-based caching and async processing.
source_repo: dadepo/whois-mcp
source_url: https://github.com/dadepo/whois-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 3
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `WHOIS`, catalogued on PulseMCP. Provides network information lookup through WHOIS and RIR database queries across RIPE NCC and ARIN regions, enabling contact card lookups, AS-SET expansion, route object validation, and BGP security analysis with TTL-based caching and async processing.

## When to use it
Provides network information lookup through WHOIS and RIR database queries across RIPE NCC and ARIN regions, enabling contact card lookups, AS-SET expansion, route object validation, and BGP security analysis with TTL-based caching and async processing.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/dadepo/whois-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/dadepo-whois). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
