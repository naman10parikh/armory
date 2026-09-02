---
name: wikimem
type: memory
description: >
  Use to give an agent a queryable wiki knowledge base — ingest files, folders, and URLs into a linked vault, then
  search or ask it in natural language — when memory should be a navigable knowledge graph, not just a flat log.
source_repo: naman10parikh/wikimem
source_url: https://github.com/naman10parikh/wikimem
license: MIT
cli_compat: [claude]
maturity: beta
stars: 7
eval_score: null
verified_at: 2026-05-26
related: [obsidian-mcpvault, four-layer-memory, mem0-mcp]
tags: [memory, knowledge-base, wiki, ingest, search, vault]
forks: 4
pushed_at: "2026-06-10T03:35:06Z"
---

## What it is
A wiki-style knowledge base for agents. It ingests files, folders, and URLs into a linked markdown vault, lints the
vault for health, and serves search and natural-language Q&A over it via CLI or MCP. It is the brain/knowledge-base
memory tier — structured, linked recall rather than a chronological log.

## When to use it
When an agent needs to accumulate and query a body of knowledge — docs, research, project context — as a connected
graph it can search or ask questions against. The trigger is "build a knowledge base the agent can query."

## How to install / invoke
Use the wiki CLI (or its MCP tools) to ingest sources into a vault, then search or ask it questions. It can also run
an observer/self-improvement pass over the vault to keep it connected and current.

## Notes
Complements an append-only learnings log: the log is the chronological record, the wiki is the navigable graph.
Treat the vault as navigation that links to sources, not a duplicate of them.
