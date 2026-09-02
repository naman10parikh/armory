---
name: lokallost-abusech
type: mcps
description: >
  Integrates with abuse.ch threat intelligence platforms (MalwareBazaar, URLhaus, ThreatFox) to provide security reports for files, URLs, domains, and IP addresses with hash validation, concurrent API calls, and automatic response limiting for malware analysis and IOC enrichment.
source_repo: lokallost/abusech-mcp
source_url: https://github.com/lokallost/abusech-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 3
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 0
pushed_at: "2025-09-10T02:56:32Z"
---
## What it is
MCP server `Abuse.ch`, catalogued on PulseMCP. Integrates with abuse.ch threat intelligence platforms (MalwareBazaar, URLhaus, ThreatFox) to provide security reports for files, URLs, domains, and IP addresses with hash validation, concurrent API calls, and automatic response limiting for malware analysis and IOC enrichment.

## When to use it
Integrates with abuse.ch threat intelligence platforms (MalwareBazaar, URLhaus, ThreatFox) to provide security reports for files, URLs, domains, and IP addresses with hash validation, concurrent API calls, and automatic response limiting for malware analysis and IOC enrichment.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/lokallost/abusech-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/lokallost-abusech). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
