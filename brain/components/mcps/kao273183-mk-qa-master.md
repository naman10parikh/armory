---
name: kao273183-mk-qa-master
type: mcps
description: >
  AI 測試大師 — end-to-end QA loop over MCP. Drives pytest / Jest / Cypress / Go / Maestro from one surface; analyzes URLs (Web DOM) or live mobile screens (`maestro hierarchy`) to extract testable modules, generates runnable pytest or Maestro YAML with real selectors (not `# TODO` stubs), runs with auto-retry, then writes a prioritized `optimization-plan.md` ranked by evidence (flaky vs broken vs coverage gap). Mobile-first: iOS Simulator, Android Emulator, real devices, and BlueStacks (`QA_ANDROID_HOST=127.0.0.1:5555`). Install via `uvx mk-qa-master`.
source_repo: kao273183/mk-qa-master
source_url: https://github.com/kao273183/mk-qa-master
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, developer-tools]
stars: 37
---
## What it is
AI 測試大師 — end-to-end QA loop over MCP. Drives pytest / Jest / Cypress / Go / Maestro from one surface; analyzes URLs (Web DOM) or live mobile screens (`maestro hierarchy`) to extract testable modules, generates runnable pytest or Maestro YAML with real selectors (not `# TODO` stubs), runs with auto-retry, then writes a prioritized `optimization-plan.md` ranked by evidence (flaky vs broken vs coverage gap). Mobile-first: iOS Simulator, Android Emulator, real devices, and BlueStacks (`QA_ANDROID_HOST=127.0.0.1:5555`). Install via `uvx mk-qa-master`.

## When to use it
When an agent needs the "Developer Tools" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Developer Tools). See https://github.com/kao273183/mk-qa-master. Pending verify -> promote.
