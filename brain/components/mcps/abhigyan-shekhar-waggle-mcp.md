---
name: abhigyan-shekhar-waggle-mcp
type: mcps
description: >
  Persistent graph memory for AI agents. Drop a conversation turn in via `observe_conversation()` and facts are auto-extracted, stored as typed graph nodes with local semantic embeddings (no API key). Supports temporal queries ("what did we decide last week?"), conflict detection, and context priming. One-command setup with `waggle-mcp init`. SQLite locally, Neo4j in production.
source_repo: Abhigyan-Shekhar/Waggle-mcp
source_url: https://github.com/Abhigyan-Shekhar/Waggle-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, knowledge-memory]
stars: 37
---
## What it is
Persistent graph memory for AI agents. Drop a conversation turn in via `observe_conversation()` and facts are auto-extracted, stored as typed graph nodes with local semantic embeddings (no API key). Supports temporal queries ("what did we decide last week?"), conflict detection, and context priming. One-command setup with `waggle-mcp init`. SQLite locally, Neo4j in production.

## When to use it
When an agent needs the "Knowledge & Memory" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Knowledge & Memory). See https://github.com/Abhigyan-Shekhar/Waggle-mcp. Pending verify -> promote.
