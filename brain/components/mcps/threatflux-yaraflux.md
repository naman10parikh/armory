---
name: threatflux-yaraflux
type: mcps
description: >
  Provides YARA-based malware scanning capabilities with support for local and MinIO storage backends, enabling security professionals to manage rules, scan files/URLs, and analyze results for threat detection.
source_repo: threatflux/yaraflux
source_url: https://github.com/threatflux/yaraflux
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 23
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 6
pushed_at: "2026-08-31T16:38:39Z"
---
## What it is
MCP server `YaraFlux`, catalogued on PulseMCP. Provides YARA-based malware scanning capabilities with support for local and MinIO storage backends, enabling security professionals to manage rules, scan files/URLs, and analyze results for threat detection.

## When to use it
Provides YARA-based malware scanning capabilities with support for local and MinIO storage backends, enabling security professionals to manage rules, scan files/URLs, and analyze results for threat detection.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/threatflux/yaraflux

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/threatflux-yaraflux). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
