---
name: pschina-deepseek-as-subagent
type: mcps
description: >
  Run DeepSeek as a real sub-agent inside Claude Code / Codex CLI. DeepSeek gets its own 7-tool agent loop (Read/Write/Edit/Bash/Glob/Grep/NotebookEdit) in a sandboxed workspace, not just a single LLM call. Includes token-based command sandbox, pre-flight web-search pattern, and cross-platform installer.
source_repo: PsChina/deepseek-as-subagent
source_url: https://github.com/PsChina/deepseek-as-subagent
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, coding-agents]
stars: 27
---
## What it is
Run DeepSeek as a real sub-agent inside Claude Code / Codex CLI. DeepSeek gets its own 7-tool agent loop (Read/Write/Edit/Bash/Glob/Grep/NotebookEdit) in a sandboxed workspace, not just a single LLM call. Includes token-based command sandbox, pre-flight web-search pattern, and cross-platform installer.

## When to use it
When an agent needs the "Coding Agents" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Coding Agents). See https://github.com/PsChina/deepseek-as-subagent. Pending verify -> promote.
