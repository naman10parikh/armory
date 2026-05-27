---
name: pulsemcp-claude-code-agent
type: mcps
description: >
  Solves tool overload by dynamically spawning Claude Code subagents with only task-relevant MCP servers, analyzing trusted server lists to create isolated instances with custom prompts and selective configurations for scaling to hundreds of servers without context window bloat.
source_repo: pulsemcp/mcp-servers
source_url: https://github.com/pulsemcp/mcp-servers/tree/HEAD/experimental/claude-code-agent
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 68
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Claude Code Agent`, catalogued on PulseMCP. Solves tool overload by dynamically spawning Claude Code subagents with only task-relevant MCP servers, analyzing trusted server lists to create isolated instances with custom prompts and selective configurations for scaling to hundreds of servers without context window bloat.

## When to use it
Solves tool overload by dynamically spawning Claude Code subagents with only task-relevant MCP servers, analyzing trusted server lists to create isolated instances with custom prompts and selective configurations for scaling to hundreds of servers without context window bloat.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/pulsemcp/mcp-servers/tree/HEAD/experimental/claude-code-agent

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/pulsemcp-claude-code-agent). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
