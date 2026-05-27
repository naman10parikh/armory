---
name: brucepro-buildautomata-memory
type: mcps
description: >
  Provides persistent memory storage with temporal versioning, semantic search, and automatic decay using SQLite for reliability and Qdrant for vector similarity search to maintain context across conversations and learn from past interactions.
source_repo: brucepro/buildautomata_memory_mcp
source_url: https://github.com/brucepro/buildautomata_memory_mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 14
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `BuildAutomata Memory`, catalogued on PulseMCP. Provides persistent memory storage with temporal versioning, semantic search, and automatic decay using SQLite for reliability and Qdrant for vector similarity search to maintain context across conversations and learn from past interactions.

## When to use it
Provides persistent memory storage with temporal versioning, semantic search, and automatic decay using SQLite for reliability and Qdrant for vector similarity search to maintain context across conversations and learn from past interactions.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/brucepro/buildautomata_memory_mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/brucepro-buildautomata-memory). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
