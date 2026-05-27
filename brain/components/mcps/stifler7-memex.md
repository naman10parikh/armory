---
name: stifler7-memex
type: mcps
description: >
  Developer context continuity system. Watches your git repos and builds a temporal knowledge graph of modules, symbols, decisions, and open problems via Graphiti + Neo4j, then serves it to any AI coding agent over MCP. Every edge carries a validity window and a confidence score that decays over time. 12 tools across read and write. Install via `npx -y stifler-memex-mcp`. MIT licensed.
source_repo: STiFLeR7/memex
source_url: https://github.com/STiFLeR7/memex
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, knowledge-memory]
---
## What it is
Developer context continuity system. Watches your git repos and builds a temporal knowledge graph of modules, symbols, decisions, and open problems via Graphiti + Neo4j, then serves it to any AI coding agent over MCP. Every edge carries a validity window and a confidence score that decays over time. 12 tools across read and write. Install via `npx -y stifler-memex-mcp`. MIT licensed.

## When to use it
When an agent needs the "Knowledge & Memory" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Knowledge & Memory). See https://github.com/STiFLeR7/memex. Pending verify -> promote.
