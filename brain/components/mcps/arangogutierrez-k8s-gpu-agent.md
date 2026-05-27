---
name: arangogutierrez-k8s-gpu-agent
type: mcps
description: >
  Provides ephemeral diagnostic capabilities for Kubernetes clusters with real-time NVIDIA GPU hardware introspection, health monitoring, and XID error analysis through kubectl debug sessions.
source_repo: arangogutierrez/k8s-gpu-mcp-server
source_url: https://github.com/arangogutierrez/k8s-gpu-mcp-server
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 4
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Kubernetes GPU Agent`, catalogued on PulseMCP. Provides ephemeral diagnostic capabilities for Kubernetes clusters with real-time NVIDIA GPU hardware introspection, health monitoring, and XID error analysis through kubectl debug sessions.

## When to use it
Provides ephemeral diagnostic capabilities for Kubernetes clusters with real-time NVIDIA GPU hardware introspection, health monitoring, and XID error analysis through kubectl debug sessions.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/arangogutierrez/k8s-gpu-mcp-server

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/arangogutierrez-k8s-gpu-agent). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
