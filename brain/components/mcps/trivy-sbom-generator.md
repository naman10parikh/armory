---
name: trivy-sbom-generator
type: mcps
description: >
  Generates Software Bill of Materials (SBOM) for container images using Trivy scanner, providing detailed component information including package metadata, licenses, and vulnerability data for security compliance and dependency analysis.
source_repo: gkhays/mcp-sbom-server
source_url: https://github.com/gkhays/mcp-sbom-server
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 3
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 2
pushed_at: "2025-04-04T16:36:59Z"
---
## What it is
MCP server `SBOM Generator (Trivy)`, catalogued on PulseMCP. Generates Software Bill of Materials (SBOM) for container images using Trivy scanner, providing detailed component information including package metadata, licenses, and vulnerability data for security compliance and dependency analysis.

## When to use it
Generates Software Bill of Materials (SBOM) for container images using Trivy scanner, providing detailed component information including package metadata, licenses, and vulnerability data for security compliance and dependency analysis.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/gkhays/mcp-sbom-server

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/trivy-sbom-generator). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
