---
name: dsazz-jira
type: mcps
description: >
  Integrates with Atlassian JIRA to retrieve issue details, list assigned tasks, and create tickets directly through conversation, using a modular architecture with clear separation between API clients, formatters, and tool implementations.
source_repo: dsazz/mcp-jira
source_url: https://github.com/dsazz/mcp-jira
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 6
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `JIRA`, catalogued on PulseMCP. Integrates with Atlassian JIRA to retrieve issue details, list assigned tasks, and create tickets directly through conversation, using a modular architecture with clear separation between API clients, formatters, and tool implementations.

## When to use it
Integrates with Atlassian JIRA to retrieve issue details, list assigned tasks, and create tickets directly through conversation, using a modular architecture with clear separation between API clients, formatters, and tool implementations.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/dsazz/mcp-jira

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/dsazz-jira). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
