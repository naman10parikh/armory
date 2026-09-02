---
name: emberian-crate-public-api
type: mcps
description: >
  Exposes Rust crate public APIs to language models by listing project dependencies and generating documentation for specific crates using cargo's resolution system and rustdoc JSON generation.
source_repo: emberian/crate-mcp
source_url: https://github.com/emberian/crate-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 4
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 1
pushed_at: "2025-03-28T22:13:43Z"
---
## What it is
MCP server `Crate Public API`, catalogued on PulseMCP. Exposes Rust crate public APIs to language models by listing project dependencies and generating documentation for specific crates using cargo's resolution system and rustdoc JSON generation.

## When to use it
Exposes Rust crate public APIs to language models by listing project dependencies and generating documentation for specific crates using cargo's resolution system and rustdoc JSON generation.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/emberian/crate-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/emberian-crate-public-api). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
