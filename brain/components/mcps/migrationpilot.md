---
name: migrationpilot
type: mcps
description: >
  Blocks unsafe PostgreSQL migrations before an AI agent writes or runs them. check_before_apply returns a pass/fail gate; reads the real Postgres parser, classifies the lock each statement takes, checks 112 safety rules. Runs offline, no database required.
source_repo: mickelsamuel/migrationpilot
source_url: https://github.com/mickelsamuel/migrationpilot
license: MIT License
cli_compat: [claude, cursor, codex, opencode, gemini]
maturity: experimental
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [glama, mcp]
---
## What it is
Blocks unsafe PostgreSQL migrations before an AI agent writes or runs them. check_before_apply returns a pass/fail gate; reads the real Postgres parser, classifies the lock each statement takes, checks 112 safety rules. Runs offline, no database required.

## When to use it
Blocks unsafe PostgreSQL migrations before an AI agent writes or runs them. check_before_apply returns a pass/fail gate; reads the real Postgres parser, classifies the lock each statement takes, checks 112 safety rules. Runs offline, no database required.

## How to install / invoke
See [Glama](https://glama.ai/mcp/servers/oi4wl6cg9n) for the install config.

## Notes
Discovered via the Glama MCP registry (live API). Pending verify -> promote.
