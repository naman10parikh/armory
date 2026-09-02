---
name: controlplaneio-flux-gitops
type: mcps
description: >
  Provides a bridge between Kubernetes GitOps operations and Flux CD ecosystem, enabling debugging, resource management, and workflow troubleshooting through specialized tools for log retrieval, reconciliation, and cluster context switching.
source_repo: controlplaneio-fluxcd/flux-operator
source_url: https://github.com/controlplaneio-fluxcd/flux-operator
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 744
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 73
pushed_at: "2026-08-31T22:34:52Z"
---
## What it is
MCP server `Flux GitOps`, catalogued on PulseMCP. Provides a bridge between Kubernetes GitOps operations and Flux CD ecosystem, enabling debugging, resource management, and workflow troubleshooting through specialized tools for log retrieval, reconciliation, and cluster context switching.

## When to use it
Provides a bridge between Kubernetes GitOps operations and Flux CD ecosystem, enabling debugging, resource management, and workflow troubleshooting through specialized tools for log retrieval, reconciliation, and cluster context switching.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/controlplaneio-fluxcd/flux-operator

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/controlplaneio-flux-gitops). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
