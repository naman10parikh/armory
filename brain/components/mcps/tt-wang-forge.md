---
name: tt-wang-forge
type: mcps
description: >
  Structured planning, parallel execution in git worktrees, and deep validation for Claude Code. Turns a one-line objective into a validated DAG of modules executed by worker agents, each self-checked and cross-module-reviewed before merge-back. 7 MCP tools: `validate`, `validate_plan`, `memory_recall`, `memory_save`, `iteration_state` (per-run scoped, with stagnation/velocity/oscillation detection), `forge_logs`, `session_state`. Stdio-only. Zero telemetry.
source_repo: TT-Wang/forge
source_url: https://github.com/TT-Wang/forge
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, coding-agents]
stars: 34
forks: 0
pushed_at: "2026-09-02T00:33:46Z"
---
## What it is
Structured planning, parallel execution in git worktrees, and deep validation for Claude Code. Turns a one-line objective into a validated DAG of modules executed by worker agents, each self-checked and cross-module-reviewed before merge-back. 7 MCP tools: `validate`, `validate_plan`, `memory_recall`, `memory_save`, `iteration_state` (per-run scoped, with stagnation/velocity/oscillation detection), `forge_logs`, `session_state`. Stdio-only. Zero telemetry.

## When to use it
When an agent needs the "Coding Agents" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Coding Agents). See https://github.com/TT-Wang/forge. Pending verify -> promote.
