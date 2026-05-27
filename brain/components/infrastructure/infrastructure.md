---
type: moc
title: Infrastructure — category hub
created: 2026-05-26
tags: [moc, infrastructure]
---

# infrastructure

The runtime substrate an agent acts through: sandboxes to execute code safely, browsers to operate the web, hosted
controllers for enterprise control planes, payment rails to fund itself, and tunnels to reach private data. This is
the "agent operates a computer / browses / moves money" layer. These engrams are the canonical picks for each need,
with their OSS escape hatches — slot the right one into the runtime/tools/plugins component rather than hand-rolling.

## Engrams

- [[e2b-sandbox]] — Firecracker microVM sandbox for agent code
- [[microsandbox]] — OSS self-hosted sandbox (libkrun)
- [[browserbase-bb]] — cloud browser the agent operates
- [[claude-managed-agents-selfhost]] — hosted control plane, your infra executes
- [[stripe-agent-toolkit]] — payment rail for self-funding compute
- [[mcp-tunnels-cloudflared]] — reach private-data MCP servers from hosted agents
