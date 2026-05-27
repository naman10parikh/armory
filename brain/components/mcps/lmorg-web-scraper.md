---
name: lmorg-web-scraper
type: mcps
description: >
  Provides web scraping capabilities using Chrome's headless browser with automatic HTTP fallback, handling JavaScript-heavy sites and single-page applications while extracting article content and stripping HTML tags to reduce token count for LLM processing.
source_repo: lmorg/mcp-web-scraper
source_url: https://github.com/lmorg/mcp-web-scraper
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 3
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `Web Scraper`, catalogued on PulseMCP. Provides web scraping capabilities using Chrome's headless browser with automatic HTTP fallback, handling JavaScript-heavy sites and single-page applications while extracting article content and stripping HTML tags to reduce token count for LLM processing.

## When to use it
Provides web scraping capabilities using Chrome's headless browser with automatic HTTP fallback, handling JavaScript-heavy sites and single-page applications while extracting article content and stripping HTML tags to reduce token count for LLM processing.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/lmorg/mcp-web-scraper

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/lmorg-web-scraper). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
