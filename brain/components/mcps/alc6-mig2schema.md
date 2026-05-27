---
name: alc6-mig2schema
type: mcps
description: >
  Extracts database schema from PostgreSQL migration files by running them in temporary containers and outputting human-readable schema information or SQL DDL, enabling developers to understand final database structure without manually tracking changes across multiple migration files.
source_repo: alc6/mig2schema
source_url: https://github.com/alc6/mig2schema
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 2
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `mig2schema`, catalogued on PulseMCP. Extracts database schema from PostgreSQL migration files by running them in temporary containers and outputting human-readable schema information or SQL DDL, enabling developers to understand final database structure without manually tracking changes across multiple migration files.

## When to use it
Extracts database schema from PostgreSQL migration files by running them in temporary containers and outputting human-readable schema information or SQL DDL, enabling developers to understand final database structure without manually tracking changes across multiple migration files.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/alc6/mig2schema

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/alc6-mig2schema). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
