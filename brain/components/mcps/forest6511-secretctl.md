---
name: forest6511-secretctl
type: mcps
description: >
  AI-safe secrets manager with MCP integration. Run commands with credentials injected as environment variables - AI agents never see plaintext secrets. Features output sanitization, AES-256-GCM encryption, and Argon2id key derivation.
source_repo: forest6511/secretctl
source_url: https://github.com/forest6511/secretctl
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, security]
---
## What it is
AI-safe secrets manager with MCP integration. Run commands with credentials injected as environment variables - AI agents never see plaintext secrets. Features output sanitization, AES-256-GCM encryption, and Argon2id key derivation.

## When to use it
When an agent needs the "Security" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Security). See https://github.com/forest6511/secretctl. Pending verify -> promote.
