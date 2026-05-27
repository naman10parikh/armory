---
name: rdanieli-tentra-mcp
type: mcps
description: >
  AI-native architecture platform for engineering teams. Describe a system in natural language (e.g. "payment service with Stripe, Kafka, PostgreSQL") → get an interactive typed diagram with 167 cloud components → export to 14 production frameworks (Java Spring Boot, Python FastAPI, Go chi, Rust Axum, .NET, Kotlin Ktor, Ruby Rails, Elixir Phoenix, Docker Compose, Terraform, Mermaid, ADR, and more). Drift detection (`sync_architecture`) scores saved diagrams against live code 0–100 with a structured diff. 9 quality-lint rules catch orphans, SPOFs, god services. Also includes a secondary persistent code-graph layer for AI coding agents (free offline via `npx tentra-mcp --local init`). Agent-as-LLM pattern — zero LLM cost on our side, zero API key on yours. 35 MCP tools. Works in Cursor, Claude Code, Codex, Windsurf.
source_repo: rdanieli/tentra-mcp
source_url: https://github.com/rdanieli/tentra-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, architecture-design]
---
## What it is
AI-native architecture platform for engineering teams. Describe a system in natural language (e.g. "payment service with Stripe, Kafka, PostgreSQL") → get an interactive typed diagram with 167 cloud components → export to 14 production frameworks (Java Spring Boot, Python FastAPI, Go chi, Rust Axum, .NET, Kotlin Ktor, Ruby Rails, Elixir Phoenix, Docker Compose, Terraform, Mermaid, ADR, and more). Drift detection (`sync_architecture`) scores saved diagrams against live code 0–100 with a structured diff. 9 quality-lint rules catch orphans, SPOFs, god services. Also includes a secondary persistent code-graph layer for AI coding agents (free offline via `npx tentra-mcp --local init`). Agent-as-LLM pattern — zero LLM cost on our side, zero API key on yours. 35 MCP tools. Works in Cursor, Claude Code, Codex, Windsurf.

## When to use it
When an agent needs the "Architecture & Design" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Architecture & Design). See https://github.com/rdanieli/tentra-mcp. Pending verify -> promote.
