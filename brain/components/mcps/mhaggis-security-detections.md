---
name: mhaggis-security-detections
type: mcps
description: >
  Aggregates security detection rules from Sigma, Splunk ESCU, Elastic, and KQL into a unified searchable SQLite database with MITRE ATT&CK mappings and CVE tracking for security analysts and threat hunters.
source_repo: mhaggis/security-detections-mcp
source_url: https://github.com/mhaggis/security-detections-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 440
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Security Detections`, catalogued on PulseMCP. Aggregates security detection rules from Sigma, Splunk ESCU, Elastic, and KQL into a unified searchable SQLite database with MITRE ATT&CK mappings and CVE tracking for security analysts and threat hunters.

## When to use it
Aggregates security detection rules from Sigma, Splunk ESCU, Elastic, and KQL into a unified searchable SQLite database with MITRE ATT&CK mappings and CVE tracking for security analysts and threat hunters.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/mhaggis/security-detections-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/mhaggis-security-detections). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
