---
name: kvm-control
type: mcps
description: >
  Provides JSON-RPC control over KVM virtual machines through libvirt, enabling VM lifecycle management, VNC display access, and Fedora CoreOS deployment with Ignition configuration for automated infrastructure management.
source_repo: steveydevey/kvm-mcp
source_url: https://github.com/steveydevey/kvm-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 15
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 4
pushed_at: "2025-05-02T20:40:25Z"
---
## What it is
MCP server `KVM Control`, catalogued on PulseMCP. Provides JSON-RPC control over KVM virtual machines through libvirt, enabling VM lifecycle management, VNC display access, and Fedora CoreOS deployment with Ignition configuration for automated infrastructure management.

## When to use it
Provides JSON-RPC control over KVM virtual machines through libvirt, enabling VM lifecycle management, VNC display access, and Fedora CoreOS deployment with Ignition configuration for automated infrastructure management.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/steveydevey/kvm-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/kvm-control). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
