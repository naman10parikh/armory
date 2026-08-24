---
name: wei9072-aegis
type: mcps
description: >
  AI-agent admission-control MCP server: validates file edits against Ring 0 syntax + Ring 0.5 structural-cost regression + workspace boundary (path / glob / shell-redirect / symlink). Negative-space framing — emits BLOCK / WARN / PASS verdicts, never coaches the agent.
source_repo: wei9072/aegis
source_url: https://github.com/wei9072/aegis
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, security]
stars: 1
---
## What it is
AI-agent admission-control MCP server: validates file edits against Ring 0 syntax + Ring 0.5 structural-cost regression + workspace boundary (path / glob / shell-redirect / symlink). Negative-space framing — emits BLOCK / WARN / PASS verdicts, never coaches the agent.

## When to use it
When an agent needs the "Security" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Security). See https://github.com/wei9072/aegis. Pending verify -> promote.
