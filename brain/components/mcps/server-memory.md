---
name: server-memory
type: mcps
description: >
  Use to give an agent a persistent knowledge graph across sessions — store entities, relations, and observations
  that must survive context compaction and be queried later.
source_repo: modelcontextprotocol/servers
source_url: https://github.com/modelcontextprotocol/servers/tree/main/src/memory
license: MIT
cli_compat: [claude, codex, cursor]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [mem0-mcp, four-layer-memory, obsidian-mcpvault]
tags: [memory, knowledge-graph, persistence, entities]
---

## What it is
The reference MCP memory server: a simple, local entity-graph store. The agent creates entities, links them with
relations, and attaches observations, then reads or searches the graph in later turns. It is the canonical "facts
that must survive" layer.

## When to use it
When a fact must persist beyond the current context window — active task state, a decision, a relationship between
concepts — so a fresh session (or a post-compaction agent) can recover it. The trigger is "this must not be forgotten."

## How to install / invoke
Add the official `@modelcontextprotocol/server-memory` to your MCP config. Use `create_entities` / `create_relations`
to write and `search_nodes` / `read_graph` to recall.

## Notes
This is the foundational memory layer; richer stores (cross-session, semantic, full-text) build on the same idea.
Markdown files remain the source of truth — the graph is the queryable index over them.
