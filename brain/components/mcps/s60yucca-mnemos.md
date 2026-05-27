---
name: s60yucca-mnemos
type: mcps
description: >
  Persistent memory engine for AI coding agents. Stores architecture decisions, bug root causes, and project conventions across sessions. Single Go binary with embedded SQLite, FTS5 search, context assembly within token budgets, and autopilot setup for Claude Code, Kiro, and Cursor.
source_repo: s60yucca/mnemos
source_url: https://github.com/s60yucca/mnemos
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, knowledge-memory]
---
## What it is
Persistent memory engine for AI coding agents. Stores architecture decisions, bug root causes, and project conventions across sessions. Single Go binary with embedded SQLite, FTS5 search, context assembly within token budgets, and autopilot setup for Claude Code, Kiro, and Cursor.

## When to use it
When an agent needs the "Knowledge & Memory" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Knowledge & Memory). See https://github.com/s60yucca/mnemos. Pending verify -> promote.
