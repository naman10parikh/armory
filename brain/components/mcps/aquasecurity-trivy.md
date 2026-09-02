---
name: aquasecurity-trivy
type: mcps
description: >
  Integrates Trivy's security scanning capabilities to detect vulnerabilities, misconfigurations, licenses, and secrets in local filesystems, container images, and remote repositories through natural language queries.
source_repo: aquasecurity/trivy-mcp
source_url: https://github.com/aquasecurity/trivy-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 47
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 8
pushed_at: "2025-12-17T16:02:32Z"
---
## What it is
MCP server `Trivy Security Scanner`, catalogued on PulseMCP. Integrates Trivy's security scanning capabilities to detect vulnerabilities, misconfigurations, licenses, and secrets in local filesystems, container images, and remote repositories through natural language queries.

## When to use it
Integrates Trivy's security scanning capabilities to detect vulnerabilities, misconfigurations, licenses, and secrets in local filesystems, container images, and remote repositories through natural language queries.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/aquasecurity/trivy-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/aquasecurity-trivy). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
