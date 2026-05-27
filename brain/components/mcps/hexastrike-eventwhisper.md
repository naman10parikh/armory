---
name: hexastrike-eventwhisper
type: mcps
description: >
  Provides access to Windows Event Log files for querying events with time range, event ID, and text filters to enable security investigations, system troubleshooting, and forensic analysis.
source_repo: hexastrike/eventwhisper
source_url: https://github.com/hexastrike/eventwhisper
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 46
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `EventWhisper (Windows Event Logs)`, catalogued on PulseMCP. Provides access to Windows Event Log files for querying events with time range, event ID, and text filters to enable security investigations, system troubleshooting, and forensic analysis.

## When to use it
Provides access to Windows Event Log files for querying events with time range, event ID, and text filters to enable security investigations, system troubleshooting, and forensic analysis.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/hexastrike/eventwhisper

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/hexastrike-eventwhisper). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
