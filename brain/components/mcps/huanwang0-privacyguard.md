---
name: huanwang0-privacyguard
type: mcps
description: >
  Routes sensitive prompts to local Ollama instances instead of cloud LLMs using keyword-based pattern matching for PII, PHI, and credential detection.
source_repo: johnwoth/privacyguard-mcp
source_url: https://github.com/johnwoth/privacyguard-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 1
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `PrivacyGuard`, catalogued on PulseMCP. Routes sensitive prompts to local Ollama instances instead of cloud LLMs using keyword-based pattern matching for PII, PHI, and credential detection.

## When to use it
Routes sensitive prompts to local Ollama instances instead of cloud LLMs using keyword-based pattern matching for PII, PHI, and credential detection.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/johnwoth/privacyguard-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/huanwang0-privacyguard). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
