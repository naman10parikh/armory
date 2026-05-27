---
name: aws-samples-eks-node-diagnostics
type: mcps
description: >
  Collects and analyzes diagnostic logs from Amazon EKS worker nodes using AWS SSM Automation, covering 20+ log sources including kubelet, containerd, iptables, CNI config, and more.
source_repo: aws-samples/sample-eks-node-diagnostics-mcp
source_url: https://github.com/aws-samples/sample-eks-node-diagnostics-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 6
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `EKS Node Diagnostics`, catalogued on PulseMCP. Collects and analyzes diagnostic logs from Amazon EKS worker nodes using AWS SSM Automation, covering 20+ log sources including kubelet, containerd, iptables, CNI config, and more.

## When to use it
Collects and analyzes diagnostic logs from Amazon EKS worker nodes using AWS SSM Automation, covering 20+ log sources including kubelet, containerd, iptables, CNI config, and more.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/aws-samples/sample-eks-node-diagnostics-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/aws-samples-eks-node-diagnostics). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
