---
name: eversinc33-triage-pe-file-analysis
type: mcps
description: >
  Integrates with multiple security tools to perform static analysis of PE files, extracting critical information like import tables, metadata, strings, and malware capabilities for rapid triage of suspicious Windows executables.
source_repo: eversinc33/triagemcp
source_url: https://github.com/eversinc33/triagemcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 77
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `TriageMCP (PE File Analysis)`, catalogued on PulseMCP. Integrates with multiple security tools to perform static analysis of PE files, extracting critical information like import tables, metadata, strings, and malware capabilities for rapid triage of suspicious Windows executables.

## When to use it
Integrates with multiple security tools to perform static analysis of PE files, extracting critical information like import tables, metadata, strings, and malware capabilities for rapid triage of suspicious Windows executables.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/eversinc33/triagemcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/eversinc33-triage-pe-file-analysis). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
