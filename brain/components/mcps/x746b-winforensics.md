---
name: x746b-winforensics
type: mcps
description: >
  Enables Windows digital forensics analysis by parsing EVTX event logs, registry hives, and remotely collecting artifacts via WinRM for incident response workflows.
source_repo: x746b/winforensics-mcp
source_url: https://github.com/x746b/winforensics-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 18
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Windows Forensics`, catalogued on PulseMCP. Enables Windows digital forensics analysis by parsing EVTX event logs, registry hives, and remotely collecting artifacts via WinRM for incident response workflows.

## When to use it
Enables Windows digital forensics analysis by parsing EVTX event logs, registry hives, and remotely collecting artifacts via WinRM for incident response workflows.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/x746b/winforensics-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/x746b-winforensics). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
