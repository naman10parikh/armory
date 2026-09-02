---
name: trustify
type: mcps
description: >
  Integrates with Trustify supply chain security platforms to query SBOMs and packages, retrieve vulnerability information by CVE ID or PURL, analyze dependencies for security issues, and access advisory data for vulnerability management and compliance tracking.
source_repo: guacsec/trustify-mcp
source_url: https://github.com/guacsec/trustify-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 4
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 7
pushed_at: "2026-09-01T09:43:55Z"
---
## What it is
MCP server `Trustify`, catalogued on PulseMCP. Integrates with Trustify supply chain security platforms to query SBOMs and packages, retrieve vulnerability information by CVE ID or PURL, analyze dependencies for security issues, and access advisory data for vulnerability management and compliance tracking.

## When to use it
Integrates with Trustify supply chain security platforms to query SBOMs and packages, retrieve vulnerability information by CVE ID or PURL, analyze dependencies for security issues, and access advisory data for vulnerability management and compliance tracking.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/guacsec/trustify-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/trustify). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
