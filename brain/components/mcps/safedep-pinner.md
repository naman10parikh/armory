---
name: safedep-pinner
type: mcps
description: >
  Secures software supply chains by pinning dependencies to immutable versions, resolving GitHub references to commit SHAs and Docker image tags to digests to prevent dependency substitution attacks.
source_repo: safedep/pinner-mcp
source_url: https://github.com/safedep/pinner-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 13
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 4
pushed_at: "2025-09-05T03:15:35Z"
---
## What it is
MCP server `Pinner`, catalogued on PulseMCP. Secures software supply chains by pinning dependencies to immutable versions, resolving GitHub references to commit SHAs and Docker image tags to digests to prevent dependency substitution attacks.

## When to use it
Secures software supply chains by pinning dependencies to immutable versions, resolving GitHub references to commit SHAs and Docker image tags to digests to prevent dependency substitution attacks.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/safedep/pinner-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/safedep-pinner). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
