---
name: jjikky-dynamodb-readonly
type: mcps
description: >
  Provides read-only access to AWS DynamoDB databases, enabling natural language interactions for listing tables, scanning data, querying with conditions, and retrieving table schemas without requiring direct database credentials.
source_repo: jjikky/dynamo-readonly-mcp
source_url: https://github.com/jjikky/dynamo-readonly-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 2
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 6
pushed_at: "2025-08-23T23:36:27Z"
---
## What it is
MCP server `DynamoDB Readonly`, catalogued on PulseMCP. Provides read-only access to AWS DynamoDB databases, enabling natural language interactions for listing tables, scanning data, querying with conditions, and retrieving table schemas without requiring direct database credentials.

## When to use it
Provides read-only access to AWS DynamoDB databases, enabling natural language interactions for listing tables, scanning data, querying with conditions, and retrieving table schemas without requiring direct database credentials.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/jjikky/dynamo-readonly-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/jjikky-dynamodb-readonly). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
