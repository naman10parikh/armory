---
name: dozzman-sonarcloud
type: mcps
description: >
  Integrates with SonarCloud API to fetch and analyze code quality issues for pull requests, providing detailed issue data with filtering by severity, type, assignee, and status plus high-level summaries with metrics for automated code review workflows.
source_repo: dozzman/sonarcloud-mcp
source_url: https://github.com/dozzman/sonarcloud-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 4
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 0
pushed_at: "2025-07-02T23:14:05Z"
---
## What it is
MCP server `SonarCloud`, catalogued on PulseMCP. Integrates with SonarCloud API to fetch and analyze code quality issues for pull requests, providing detailed issue data with filtering by severity, type, assignee, and status plus high-level summaries with metrics for automated code review workflows.

## When to use it
Integrates with SonarCloud API to fetch and analyze code quality issues for pull requests, providing detailed issue data with filtering by severity, type, assignee, and status plus high-level summaries with metrics for automated code review workflows.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/dozzman/sonarcloud-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/dozzman-sonarcloud). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
