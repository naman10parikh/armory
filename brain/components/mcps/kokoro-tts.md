---
name: kokoro-tts
type: mcps
description: >
  Converts text to speech using the Kokoro TTS engine with configurable voices, speeds, and languages, supporting both local storage and S3 cloud integration with automatic file cleanup.
source_repo: mberg/kokoro-tts-mcp
source_url: https://github.com/mberg/kokoro-tts-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 78
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Kokoro TTS`, catalogued on PulseMCP. Converts text to speech using the Kokoro TTS engine with configurable voices, speeds, and languages, supporting both local storage and S3 cloud integration with automatic file cleanup.

## When to use it
Converts text to speech using the Kokoro TTS engine with configurable voices, speeds, and languages, supporting both local storage and S3 cloud integration with automatic file cleanup.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/mberg/kokoro-tts-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/kokoro-tts). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
