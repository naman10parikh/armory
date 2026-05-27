---
name: context7-mcp
type: mcps
description: >
  Use whenever an agent needs current, version-accurate docs for a library, framework, SDK, or API — it fetches
  live documentation so the agent isn't relying on stale training data.
source_repo: upstash/context7
source_url: https://github.com/upstash/context7
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [troubleshoot, github-mcp, firecrawl-mcp]
tags: [documentation, docs, api-reference, research]
---

## What it is
An MCP server that pulls up-to-date documentation for libraries and frameworks on demand, resolving a library name
to its current docs and returning the relevant sections. It closes the gap between an agent's training cutoff and
the actual current API surface.

## When to use it
Any time you're about to write or debug code against a library — even a well-known one like React or Next.js — where
recent changes might bite you. The trigger is "what does the current API actually look like?"

## How to install / invoke
Add `@upstash/context7-mcp` to your MCP config. Resolve the library, then query its docs as a tool call before
coding against it.

## Notes
Prefer this over a generic web search for library docs — it's targeted and current. Not for general programming
concepts or business-logic debugging.
