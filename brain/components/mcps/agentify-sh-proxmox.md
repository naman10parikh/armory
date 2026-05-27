---
name: agentify-sh-proxmox
type: mcps
description: >
  Integrates with Proxmox virtualization platform to monitor cluster health, manage VM and container lifecycles, execute commands within VMs via QEMU guest agent, and track storage resources across nodes.
source_repo: agentify-sh/cursor-proxmox-mcp
source_url: https://github.com/agentify-sh/cursor-proxmox-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 10
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Proxmox`, catalogued on PulseMCP. Integrates with Proxmox virtualization platform to monitor cluster health, manage VM and container lifecycles, execute commands within VMs via QEMU guest agent, and track storage resources across nodes.

## When to use it
Integrates with Proxmox virtualization platform to monitor cluster health, manage VM and container lifecycles, execute commands within VMs via QEMU guest agent, and track storage resources across nodes.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/agentify-sh/cursor-proxmox-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/agentify-sh-proxmox). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
