---
name: kaspersky-threat-intelligence
type: mcps
description: >
  Integrates with Kaspersky's threat intelligence platform to provide conversational access to commercial threat feeds, STIX object analysis, and URL normalization for security analysts and SOC teams.
source_repo: kasperskylab/threat-intelligence
source_url: https://github.com/kasperskylab/threat-intelligence/tree/HEAD/opentip-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 24
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Kaspersky Threat Intelligence`, catalogued on PulseMCP. Integrates with Kaspersky's threat intelligence platform to provide conversational access to commercial threat feeds, STIX object analysis, and URL normalization for security analysts and SOC teams.

## When to use it
Integrates with Kaspersky's threat intelligence platform to provide conversational access to commercial threat feeds, STIX object analysis, and URL normalization for security analysts and SOC teams.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/kasperskylab/threat-intelligence/tree/HEAD/opentip-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/kaspersky-threat-intelligence). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
