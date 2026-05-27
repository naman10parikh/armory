---
name: trivy-security-scanner
type: mcps
description: >
  Integrates Trivy's security scanning capabilities to detect vulnerabilities, misconfigurations, licenses, and secrets in local filesystems, container images, and remote repositories through natural language queries.
source_repo: aquasecurity/trivy-mcp
source_url: https://github.com/aquasecurity/trivy-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 42
verified_at: 2026-05-26
related: []
tags: [devops, mcp, security]
---

## What it is
MCP server `Trivy Security Scanner`, catalogued on PulseMCP. Integrates Trivy's security scanning capabilities to detect vulnerabilities, misconfigurations, licenses, and secrets in local filesystems, container images, and remote repositories through natural language queries.

## When to use it
Integrates Trivy's security scanning capabilities to detect vulnerabilities, misconfigurations, licenses, and secrets in local filesystems, container images, and remote repositories through natural language queries.

## How to install / invoke
See the source repo README for the `mcpServers` config block (command + args).

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/aquasecurity-trivy). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
