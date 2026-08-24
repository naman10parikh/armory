---
name: obsidian-mcpvault
type: mcps
description: >
  Use to let an agent read and write an Obsidian vault — search notes, follow wikilinks, and update frontmatter — so
  a markdown knowledge graph becomes a first-class agent surface.
source_repo: bitbonsai/mcpvault
source_url: https://github.com/bitbonsai/mcpvault
license: MIT
cli_compat: [claude]
maturity: beta
stars: 1630
eval_score: null
verified_at: 2026-05-26
related: [server-memory, wikimem, four-layer-memory]
tags: [obsidian, vault, notes, knowledge-graph, wikilinks]
---

## What it is
An MCP server that connects an agent to an Obsidian vault. It can read and write notes, search across them, traverse
wikilinks, and update YAML frontmatter — making the vault a navigable knowledge graph the agent can both consume and
maintain.

## When to use it
When your second brain lives in Obsidian and you want the agent to keep it current — adding notes, linking concepts,
updating a map-of-content. The trigger is "update the vault" or "what do we already know about X?"

## How to install / invoke
Add `@bitbonsai/mcpvault` to your MCP config, pointed at the vault path. Use it to write navigation notes that link
to source files rather than duplicating their content.

## Notes
Treat the vault as navigation, not duplication: notes should link to the authoritative source file via frontmatter.
The vault is the graph; the repo is the source of truth.
