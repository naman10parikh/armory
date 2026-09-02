---
name: iwarapter-gpg-commit
type: mcps
description: >
  Enables GPG-signed commits and SSH-authenticated pushes from Claude Code without exposing key material, delegating to the local gpg-agent and ssh-agent.
source_repo: iwarapter/gpg-commit-mcp
source_url: https://github.com/iwarapter/gpg-commit-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 4
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 2
pushed_at: "2026-04-09T17:50:27Z"
---
## What it is
MCP server `GPG Commit`, catalogued on PulseMCP. Enables GPG-signed commits and SSH-authenticated pushes from Claude Code without exposing key material, delegating to the local gpg-agent and ssh-agent.

## When to use it
Enables GPG-signed commits and SSH-authenticated pushes from Claude Code without exposing key material, delegating to the local gpg-agent and ssh-agent.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/iwarapter/gpg-commit-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/iwarapter-gpg-commit). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
