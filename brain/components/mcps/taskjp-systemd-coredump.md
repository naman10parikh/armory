---
name: taskjp-systemd-coredump
type: mcps
description: >
  Provides a bridge to systemd-coredump functionality for accessing, managing, and analyzing system core dumps in Linux environments, including listing available coredumps, retrieving information, extracting dumps, and generating stack traces using GDB.
source_repo: signal-slot/mcp-systemd-coredump
source_url: https://github.com/signal-slot/mcp-systemd-coredump
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 2
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Systemd-Coredump`, catalogued on PulseMCP. Provides a bridge to systemd-coredump functionality for accessing, managing, and analyzing system core dumps in Linux environments, including listing available coredumps, retrieving information, extracting dumps, and generating stack traces using GDB.

## When to use it
Provides a bridge to systemd-coredump functionality for accessing, managing, and analyzing system core dumps in Linux environments, including listing available coredumps, retrieving information, extracting dumps, and generating stack traces using GDB.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/signal-slot/mcp-systemd-coredump

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/taskjp-systemd-coredump). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
