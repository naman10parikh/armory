---
name: threat-zone
type: mcps
description: >
  Integrates with the Threat.Zone API to provide malware analysis capabilities including static analysis, dynamic sandbox execution across multiple environments, URL scanning, and CDR processing with detailed result retrieval and artifact management.
source_repo: threat-zone/threatzonemcp
source_url: https://github.com/threat-zone/threatzonemcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 13
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Threat.Zone`, catalogued on PulseMCP. Integrates with the Threat.Zone API to provide malware analysis capabilities including static analysis, dynamic sandbox execution across multiple environments, URL scanning, and CDR processing with detailed result retrieval and artifact management.

## When to use it
Integrates with the Threat.Zone API to provide malware analysis capabilities including static analysis, dynamic sandbox execution across multiple environments, URL scanning, and CDR processing with detailed result retrieval and artifact management.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/threat-zone/threatzonemcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/threat-zone). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
