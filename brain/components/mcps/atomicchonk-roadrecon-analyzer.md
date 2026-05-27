---
name: atomicchonk-roadrecon-analyzer
type: mcps
description: >
  Exposes Azure AD security data collected by ROADrecon for analyzing tenant security posture, identifying privileged users, evaluating MFA status, detecting stale accounts, and assessing PIM implementation.
source_repo: atomicchonk/roadrecon_mcp_server
source_url: https://github.com/atomicchonk/roadrecon_mcp_server
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 50
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `ROADrecon Analyzer`, catalogued on PulseMCP. Exposes Azure AD security data collected by ROADrecon for analyzing tenant security posture, identifying privileged users, evaluating MFA status, detecting stale accounts, and assessing PIM implementation.

## When to use it
Exposes Azure AD security data collected by ROADrecon for analyzing tenant security posture, identifying privileged users, evaluating MFA status, detecting stale accounts, and assessing PIM implementation.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/atomicchonk/roadrecon_mcp_server

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/atomicchonk-roadrecon-analyzer). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
