---
name: mcp-tunnels-cloudflared
type: infrastructure
description: >
  Use to let a hosted agent reach a private-data MCP server behind your firewall — an outbound tunnel plus a proxy,
  with per-server OAuth — so internal tools are usable without exposing them to the public internet.
source_repo: cloudflare/cloudflared
source_url: https://github.com/cloudflare/cloudflared
license: Apache-2.0
cli_compat: [claude]
maturity: stable
stars: 15474
eval_score: null
verified_at: 2026-05-26
related: [claude-managed-agents-selfhost, github-mcp, server-memory]
tags: [tunnel, mcp, private-data, cloudflared, networking, oauth]
forks: 1417
pushed_at: "2026-09-01T16:56:30Z"
---

## What it is
A networking pattern for connecting hosted agents to private MCP servers. An outbound tunnel (no inbound firewall
holes) plus a provider proxy lets a managed agent call MCP servers that live inside your network, with per-server
OAuth for access control. It bridges "managed agent" and "private internal tools."

## When to use it
When an agent runs in a hosted control plane but needs tools or data that must stay private — internal databases,
company knowledge, on-prem services exposed as MCP. The trigger is "the hosted agent needs our private MCP server."

## How to install / invoke
Run the tunnel agent to establish an outbound connection on its dedicated port, deploy it via your container/Helm
setup, and set the appropriate MCP-client beta header so the agent reaches the tunneled servers with per-server OAuth.

## Notes
Outbound-only tunnels avoid opening inbound firewall ports — the security win. Scope each MCP server's OAuth
narrowly. Pair with a hosted-control runtime when the data plane stays on your infra.
