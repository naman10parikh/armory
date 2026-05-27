---
name: ypollak2-llm-router
type: mcps
description: >
  Subscription-aware LLM router for Claude Code. Routes tasks to 20+ providers (OpenAI, Gemini, Groq, Ollama, Codex) based on complexity classification, Claude subscription pressure, and cost. Free tasks stay on Claude subscription; expensive tasks fall back to the cheapest capable model. Includes 30 MCP tools, 6 auto-routing hooks, semantic dedup cache, prompt caching, daily spend cap, and a live web dashboard.
source_repo: ypollak2/llm-router
source_url: https://github.com/ypollak2/llm-router
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, developer-tools]
---
## What it is
Subscription-aware LLM router for Claude Code. Routes tasks to 20+ providers (OpenAI, Gemini, Groq, Ollama, Codex) based on complexity classification, Claude subscription pressure, and cost. Free tasks stay on Claude subscription; expensive tasks fall back to the cheapest capable model. Includes 30 MCP tools, 6 auto-routing hooks, semantic dedup cache, prompt caching, daily spend cap, and a live web dashboard.

## When to use it
When an agent needs the "Developer Tools" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Developer Tools). See https://github.com/ypollak2/llm-router. Pending verify -> promote.
