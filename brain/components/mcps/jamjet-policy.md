---
name: jamjet-policy
type: mcps
description: >
  Drop-in stdio interceptor that gates MCP tools/call requests through a YAML policy (block / require_approval / audit / budget cap) before they reach the real server. The same policy file is reused by @jamjet/claude-code-hook and @jamjet/openai-guardrail, so one rule set covers Claude Desktop, Cursor
source_repo: jamjet-labs/jamjet-policy
source_url: https://github.com/jamjet-labs/jamjet-policy
license: Apache 2.0
cli_compat: [claude, cursor, codex, opencode, gemini]
maturity: experimental
stars: 2
eval_score: null
verified_at: 2026-05-27
related: []
tags: [glama, mcp]
---
## What it is
Drop-in stdio interceptor that gates MCP tools/call requests through a YAML policy (block / require_approval / audit / budget cap) before they reach the real server. The same policy file is reused by @jamjet/claude-code-hook and @jamjet/openai-guardrail, so one rule set covers Claude Desktop, Cursor

## When to use it
Drop-in stdio interceptor that gates MCP tools/call requests through a YAML policy (block / require_approval / audit / budget cap) before they reach the real server. The same policy file is reused by @jamjet/claude-code-hook and @jamjet/openai-guardrail, so one rule set covers Claude Desktop, Cursor

## How to install / invoke
See [Glama](https://glama.ai/mcp/servers/jnw1k4xc4w) for the install config.

## Notes
Discovered via the Glama MCP registry (live API). Pending verify -> promote.
