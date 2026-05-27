---
name: cloudflare-auditlogs
type: mcps
description: >
  Audit logs summarize the history of changes made within your Cloudflare account. Audit logs include account level actions like zone configuration changes.
source_repo: cloudflare/mcp-server-cloudflare
source_url: https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/auditlogs
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 3778
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Cloudflare Audit Logs`, catalogued on PulseMCP. Audit logs summarize the history of changes made within your Cloudflare account. Audit logs include account level actions like zone configuration changes.

## When to use it
Audit logs summarize the history of changes made within your Cloudflare account. Audit logs include account level actions like zone configuration changes.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/auditlogs

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/cloudflare-auditlogs). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
