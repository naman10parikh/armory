---
name: secure-filesystem
type: mcps
description: >
  Provides secure file system access through a Go-based server that enables reading, writing, listing, and manipulating files within specified allowed directories while preventing directory traversal attacks.
source_repo: cheny-alf/filesystem-server
source_url: https://github.com/cheny-alf/filesystem-server
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 1
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 1
pushed_at: "2025-03-06T15:00:52Z"
---
## What it is
MCP server `Secure Filesystem`, catalogued on PulseMCP. Provides secure file system access through a Go-based server that enables reading, writing, listing, and manipulating files within specified allowed directories while preventing directory traversal attacks.

## When to use it
Provides secure file system access through a Go-based server that enables reading, writing, listing, and manipulating files within specified allowed directories while preventing directory traversal attacks.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/cheny-alf/filesystem-server

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/secure-filesystem). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
