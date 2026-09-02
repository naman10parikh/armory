---
name: mem0-mcp
type: mcps
description: >
  Use to give an agent long-term, cross-session memory backed by a managed service — store and semantically recall
  facts about a user or project that should persist across days and machines.
source_repo: mem0ai/mem0
source_url: https://github.com/mem0ai/mem0
license: Apache-2.0
cli_compat: [claude, codex, cursor]
maturity: stable
stars: 64545
eval_score: null
verified_at: 2026-05-26
related: [server-memory, four-layer-memory, wikimem]
tags: [memory, long-term, semantic, cross-session, personalization]
forks: 7563
pushed_at: "2026-09-01T17:30:53Z"
mentions: 20
---

## What it is
An MCP server over the Mem0 memory layer: it stores facts and retrieves them by semantic relevance, providing
durable cross-session memory that survives beyond a single machine or conversation. It is the managed,
personalization-oriented memory tier.

## When to use it
When an agent should remember a user's preferences, project facts, or prior decisions across many sessions — the
kind of long-term memory a local per-session store can't provide. The trigger is "remember this about me/the project."

## How to install / invoke
Add the Mem0 MCP server to your MCP config with an API key. Write facts with the add-memory tool and recall with the
search-memories tool.

## Notes
One layer in a memory stack: pair a local entity graph (immediate persistence) with a managed semantic store
(long-term recall). Be deliberate about what you persist — store durable facts, not transient chatter.
