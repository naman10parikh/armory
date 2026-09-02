---
name: raj-sharma-git-aks-incident
type: mcps
description: >
  Monitors Azure Kubernetes Service pod logs for errors, detects incidents using LLM analysis, and automatically creates routed Jira tickets.
source_repo: raj-sharma-git/k8s-mcp-jira-agent
source_url: https://github.com/raj-sharma-git/k8s-mcp-jira-agent
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 2
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 0
pushed_at: "2026-04-05T17:40:06Z"
---
## What it is
MCP server `AKS Incident Agent`, catalogued on PulseMCP. Monitors Azure Kubernetes Service pod logs for errors, detects incidents using LLM analysis, and automatically creates routed Jira tickets.

## When to use it
Monitors Azure Kubernetes Service pod logs for errors, detects incidents using LLM analysis, and automatically creates routed Jira tickets.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/raj-sharma-git/k8s-mcp-jira-agent

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/raj-sharma-git-aks-incident). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
