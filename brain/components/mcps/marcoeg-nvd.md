---
name: marcoeg-nvd
type: mcps
description: >
  Provides access to the NIST National Vulnerability Database through get_cve and search_cve tools for retrieving and searching CVE records with customizable result options.
source_repo: marcoeg/mcp-nvd
source_url: https://github.com/marcoeg/mcp-nvd
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 14
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `NVD (National Vulnerability Database)`, catalogued on PulseMCP. Provides access to the NIST National Vulnerability Database through get_cve and search_cve tools for retrieving and searching CVE records with customizable result options.

## When to use it
Provides access to the NIST National Vulnerability Database through get_cve and search_cve tools for retrieving and searching CVE records with customizable result options.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/marcoeg/mcp-nvd

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/marcoeg-nvd). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
