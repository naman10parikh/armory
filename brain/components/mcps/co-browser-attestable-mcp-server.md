---
name: co-browser-attestable-mcp-server
type: mcps
description: >
  An MCP server running inside a trusted execution environment (TEE) via Gramine, showcasing remote attestation using [RA-TLS](https://gramine.readthedocs.io/en/stable/attestation.html). This allows an MCP client to verify the server before conencting.
source_repo: co-browser/attestable-mcp-server
source_url: https://github.com/co-browser/attestable-mcp-server
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, security]
stars: 21
forks: 7
pushed_at: "2026-05-20T20:43:30Z"
---
## What it is
An MCP server running inside a trusted execution environment (TEE) via Gramine, showcasing remote attestation using [RA-TLS](https://gramine.readthedocs.io/en/stable/attestation.html). This allows an MCP client to verify the server before conencting.

## When to use it
When an agent needs the "Security" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Security). See https://github.com/co-browser/attestable-mcp-server. Pending verify -> promote.
