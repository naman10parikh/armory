---
name: kube-audit
type: mcps
description: >
  Provides unified access to Kubernetes audit logs across Alibaba Cloud SLS, AWS CloudWatch Logs, and Google Cloud Logging with tools for listing clusters, discovering resources, and querying audit trails with flexible filtering by user, namespace, verbs, resource types, and time ranges.
source_repo: mozillazg/kube-audit-mcp
source_url: https://github.com/mozillazg/kube-audit-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 19
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Kubernetes Audit Logs`, catalogued on PulseMCP. Provides unified access to Kubernetes audit logs across Alibaba Cloud SLS, AWS CloudWatch Logs, and Google Cloud Logging with tools for listing clusters, discovering resources, and querying audit trails with flexible filtering by user, namespace, verbs, resource types, and time ranges.

## When to use it
Provides unified access to Kubernetes audit logs across Alibaba Cloud SLS, AWS CloudWatch Logs, and Google Cloud Logging with tools for listing clusters, discovering resources, and querying audit trails with flexible filtering by user, namespace, verbs, resource types, and time ranges.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/mozillazg/kube-audit-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/kube-audit). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
