---
name: gkhays-nvd
type: mcps
description: >
  Provides direct access to the National Vulnerability Database (NVD) for retrieving detailed CVE information including descriptions, severity ratings, publication dates, and references by ID.
source_repo: gkhays/mcp-nvd-server
source_url: https://github.com/gkhays/mcp-nvd-server
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 7
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `NVD (National Vulnerability Database)`, catalogued on PulseMCP. Provides direct access to the National Vulnerability Database (NVD) for retrieving detailed CVE information including descriptions, severity ratings, publication dates, and references by ID.

## When to use it
Provides direct access to the National Vulnerability Database (NVD) for retrieving detailed CVE information including descriptions, severity ratings, publication dates, and references by ID.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/gkhays/mcp-nvd-server

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/gkhays-nvd). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
