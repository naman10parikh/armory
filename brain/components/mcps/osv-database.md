---
name: osv-database
type: mcps
description: >
  Integrates with the OSV Database API to query for security vulnerabilities in software packages, retrieve CVE information, and identify affected and fixed versions.
source_repo: edenyavin/osv-mcp
source_url: https://github.com/edenyavin/osv-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 2
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 1
pushed_at: "2025-04-23T17:22:40Z"
---
## What it is
MCP server `OSV Database API`, catalogued on PulseMCP. Integrates with the OSV Database API to query for security vulnerabilities in software packages, retrieve CVE information, and identify affected and fixed versions.

## When to use it
Integrates with the OSV Database API to query for security vulnerabilities in software packages, retrieve CVE information, and identify affected and fixed versions.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/edenyavin/osv-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/osv-database). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
