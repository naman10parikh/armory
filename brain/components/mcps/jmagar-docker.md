---
name: jmagar-docker
type: mcps
description: >
  Manages Docker containers and services across multiple remote hosts through SSH connections, enabling container lifecycle operations, Docker Compose stack management, and data migration between servers with automated host discovery, port conflict detection, and safety mechanisms to prevent destructive operations.
source_repo: jmagar/docker-mcp
source_url: https://github.com/jmagar/docker-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 4
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Remote Docker`, catalogued on PulseMCP. Manages Docker containers and services across multiple remote hosts through SSH connections, enabling container lifecycle operations, Docker Compose stack management, and data migration between servers with automated host discovery, port conflict detection, and safety mechanisms to prevent destructive operations.

## When to use it
Manages Docker containers and services across multiple remote hosts through SSH connections, enabling container lifecycle operations, Docker Compose stack management, and data migration between servers with automated host discovery, port conflict detection, and safety mechanisms to prevent destructive operations.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/jmagar/docker-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/jmagar-docker). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
