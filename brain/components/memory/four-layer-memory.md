---
name: four-layer-memory
type: memory
description: >
  Adopt as the architecture for agent memory — markdown as source of truth, a search index over it, MCP stores for
  graph/semantic recall, and fleet memory — so an agent recalls the right thing at the right cost.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [memory-compression, learnings-append-only, server-memory, mem0-mcp]
tags: [memory, architecture, layers, persistence, knowledge]
forks: 0
pushed_at: "2026-06-10T03:59:01Z"
---

## What it is
A layered memory model. Layer 0: markdown files (learnings, daily logs, topic notes) as the authoritative source of
truth. Layer 1: a full-text/BM25 search index over those files. Layer 2: MCP memory servers (an entity graph,
semantic/long-term stores). Layer 3: fleet memory shared across agents. Each layer trades cost against recall power.

## When to use it
When designing how a persistent agent stores and retrieves knowledge across sessions. The trigger is "we need
memory that survives, is searchable, and doesn't drown the context window."

## How to install / invoke
Keep markdown as the canonical store; add a search index for fast lookup; wire MCP memory servers for graph and
semantic recall; reserve a fleet layer for cross-agent sharing. Compress aging entries so the layers stay lean.

## Notes
Files are the source of truth — the graph and semantic stores are indexes over them, not replacements. The cheapest
layer that answers the question wins; reach for the heavier stores only when search isn't enough.
