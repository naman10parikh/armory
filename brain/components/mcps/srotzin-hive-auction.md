---
name: srotzin-hive-auction
type: mcps
description: >
  Reverse Dutch auction for scarce compute slot allocation, starting at 5x asking rate and dropping 5% per 30 seconds to a floor price.
source_repo: srotzin/hive-mcp-auction
source_url: https://github.com/srotzin/hive-mcp-auction
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 0
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 0
pushed_at: "2026-07-29T07:53:18Z"
---
## What it is
MCP server `Hive Auction`, catalogued on PulseMCP. Reverse Dutch auction for scarce compute slot allocation, starting at 5x asking rate and dropping 5% per 30 seconds to a floor price.

## When to use it
Reverse Dutch auction for scarce compute slot allocation, starting at 5x asking rate and dropping 5% per 30 seconds to a floor price.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/srotzin/hive-mcp-auction

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/srotzin-hive-auction). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
