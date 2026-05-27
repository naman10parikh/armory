---
name: smythos-docker-sandbox
type: mcps
description: >
  Provides Linux sandbox container management through Docker integration, enabling spawning of Ubuntu containers, TTY input with escape sequence support, screen buffer reading, and container lifecycle management for secure command execution in disposable environments.
source_repo: smythos/smyth-docker-mcp
source_url: https://github.com/smythos/smyth-docker-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 26
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Docker Sandbox`, catalogued on PulseMCP. Provides Linux sandbox container management through Docker integration, enabling spawning of Ubuntu containers, TTY input with escape sequence support, screen buffer reading, and container lifecycle management for secure command execution in disposable environments.

## When to use it
Provides Linux sandbox container management through Docker integration, enabling spawning of Ubuntu containers, TTY input with escape sequence support, screen buffer reading, and container lifecycle management for secure command execution in disposable environments.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/smythos/smyth-docker-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/smythos-docker-sandbox). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
