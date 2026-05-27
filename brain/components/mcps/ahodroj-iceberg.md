---
name: ahodroj-iceberg
type: mcps
description: >
  Provides a SQL interface for querying and managing Apache Iceberg tables through connections to Iceberg REST catalogs and S3-compatible storage, enabling data analysts to interact with data lakes without switching contexts.
source_repo: ahodroj/mcp-iceberg-service
source_url: https://github.com/ahodroj/mcp-iceberg-service
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 8
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Apache Iceberg`, catalogued on PulseMCP. Provides a SQL interface for querying and managing Apache Iceberg tables through connections to Iceberg REST catalogs and S3-compatible storage, enabling data analysts to interact with data lakes without switching contexts.

## When to use it
Provides a SQL interface for querying and managing Apache Iceberg tables through connections to Iceberg REST catalogs and S3-compatible storage, enabling data analysts to interact with data lakes without switching contexts.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/ahodroj/mcp-iceberg-service

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/ahodroj-iceberg). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
