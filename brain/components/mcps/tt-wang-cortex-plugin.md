---
name: tt-wang-cortex-plugin
type: mcps
description: >
  Persistent, self-evolving memory plugin for Claude Code. Background miner extracts durable lessons (decisions, conventions, bug fixes) from completed sessions via Claude Haiku, stores them as human-readable markdown in an Obsidian vault, and assembles query-tailored context briefings at session start. Local-first, no cloud, no API keys. Self-healing install via uv bootstrap shim, `/cortex-doctor` preflight, graceful FTS-only degraded mode when `claude` CLI missing. MIT.
source_repo: TT-Wang/cortex-plugin
source_url: https://github.com/TT-Wang/cortex-plugin
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, knowledge-memory]
stars: 31
---
## What it is
Persistent, self-evolving memory plugin for Claude Code. Background miner extracts durable lessons (decisions, conventions, bug fixes) from completed sessions via Claude Haiku, stores them as human-readable markdown in an Obsidian vault, and assembles query-tailored context briefings at session start. Local-first, no cloud, no API keys. Self-healing install via uv bootstrap shim, `/cortex-doctor` preflight, graceful FTS-only degraded mode when `claude` CLI missing. MIT.

## When to use it
When an agent needs the "Knowledge & Memory" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Knowledge & Memory). See https://github.com/TT-Wang/cortex-plugin. Pending verify -> promote.
