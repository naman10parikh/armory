---
name: taniwhaai-arai
type: mcps
description: >
  Policy enforcement for AI coding agents derived from existing instruction files (CLAUDE.md, .cursorrules, .windsurfrules, .github/copilot-instructions.md) — no separate YAML to maintain. Rules with prohibitive predicates (`never`, `forbids`, `must_not`) emit `permissionDecision: deny` to block tool calls in Claude Code; advisory rules inject context. PostToolUse is correlated with PreToolUse to produce per-rule obeyed/ignored compliance verdicts in a local JSONL audit log. MCP tools — `arai_add_guard` (register rules mid-session), `arai_list_guards`, `arai_recent_decisions` — work in any MCP client (Claude Desktop, Cursor, Windsurf, Cline). No network on the hook hot path; opt-out anonymous telemetry.
source_repo: taniwhaai/arai
source_url: https://github.com/taniwhaai/arai
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, security]
stars: 7
---
## What it is
Policy enforcement for AI coding agents derived from existing instruction files (CLAUDE.md, .cursorrules, .windsurfrules, .github/copilot-instructions.md) — no separate YAML to maintain. Rules with prohibitive predicates (`never`, `forbids`, `must_not`) emit `permissionDecision: deny` to block tool calls in Claude Code; advisory rules inject context. PostToolUse is correlated with PreToolUse to produce per-rule obeyed/ignored compliance verdicts in a local JSONL audit log. MCP tools — `arai_add_guard` (register rules mid-session), `arai_list_guards`, `arai_recent_decisions` — work in any MCP client (Claude Desktop, Cursor, Windsurf, Cline). No network on the hook hot path; opt-out anonymous telemetry.

## When to use it
When an agent needs the "Security" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Security). See https://github.com/taniwhaai/arai. Pending verify -> promote.
