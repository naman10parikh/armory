---
name: keeper-secrets-manager
type: mcps
description: >
  Provides secure access to Keeper Secrets Manager with CRUD operations for secrets and folders, file attachment management, password generation, TOTP code retrieval, and confirmation-based security controls that prevent direct credential exposure while maintaining full secret management capabilities.
source_repo: keeper-security/keeper-mcp-golang-docker
source_url: https://github.com/keeper-security/keeper-mcp-golang-docker
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 10
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 4
pushed_at: "2026-07-16T14:56:52Z"
---
## What it is
MCP server `Keeper Secrets Manager`, catalogued on PulseMCP. Provides secure access to Keeper Secrets Manager with CRUD operations for secrets and folders, file attachment management, password generation, TOTP code retrieval, and confirmation-based security controls that prevent direct credential exposure while maintaining full secret management capabilities.

## When to use it
Provides secure access to Keeper Secrets Manager with CRUD operations for secrets and folders, file attachment management, password generation, TOTP code retrieval, and confirmation-based security controls that prevent direct credential exposure while maintaining full secret management capabilities.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/keeper-security/keeper-mcp-golang-docker

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/keeper-secrets-manager). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
