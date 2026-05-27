---
name: da-colon-prompt-cleaner
type: mcps
description: >
  Sanitizes and redacts sensitive information from user prompts using OpenAI-compatible APIs to intelligently clean text while detecting and removing API keys, tokens, emails, and other secrets before processing.
source_repo: dacebt/prompt-cleaner-mcp
source_url: https://github.com/dacebt/prompt-cleaner-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 1
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Prompt Cleaner`, catalogued on PulseMCP. Sanitizes and redacts sensitive information from user prompts using OpenAI-compatible APIs to intelligently clean text while detecting and removing API keys, tokens, emails, and other secrets before processing.

## When to use it
Sanitizes and redacts sensitive information from user prompts using OpenAI-compatible APIs to intelligently clean text while detecting and removing API keys, tokens, emails, and other secrets before processing.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/dacebt/prompt-cleaner-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/da-colon-prompt-cleaner). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
