---
name: sonaiengine-graph-tool-call
type: mcps
description: >
  When tool count exceeds LLM context limits, accuracy collapses (248 tools → 12%). graph-tool-call builds a tool graph from OpenAPI/MCP specs and retrieves multi-step workflows via hybrid search (BM25 + graph traversal + embedding), recovering accuracy to 82% with 79% fewer tokens. Zero dependencies. Also works as an MCP Proxy — aggregate multiple MCP servers behind 3 meta-tools.
source_repo: SonAIengine/graph-tool-call
source_url: https://github.com/SonAIengine/graph-tool-call
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, frameworks]
---
## What it is
When tool count exceeds LLM context limits, accuracy collapses (248 tools → 12%). graph-tool-call builds a tool graph from OpenAPI/MCP specs and retrieves multi-step workflows via hybrid search (BM25 + graph traversal + embedding), recovering accuracy to 82% with 79% fewer tokens. Zero dependencies. Also works as an MCP Proxy — aggregate multiple MCP servers behind 3 meta-tools.

## When to use it
When an agent needs the "Frameworks" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Frameworks). See https://github.com/SonAIengine/graph-tool-call. Pending verify -> promote.
