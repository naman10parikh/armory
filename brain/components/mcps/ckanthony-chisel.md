---
name: ckanthony-chisel
type: mcps
description: >
  Reduce context usage on file use. Send only unified diffs instead of full files (up to 20-100× fewer tokens), and read large files with targeted `grep`/`sed` instead of full reads (up to 500×). Kernel-enforced path confinement hard-locks the agent to a configured root: no accidental reads or writes outside scope. Standalone for your file access or embed in any MCP server (Rust, Node.js, Python via WASM).
source_repo: ckanthony/Chisel
source_url: https://github.com/ckanthony/Chisel
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, file-systems]
stars: 17
---
## What it is
Reduce context usage on file use. Send only unified diffs instead of full files (up to 20-100× fewer tokens), and read large files with targeted `grep`/`sed` instead of full reads (up to 500×). Kernel-enforced path confinement hard-locks the agent to a configured root: no accidental reads or writes outside scope. Standalone for your file access or embed in any MCP server (Rust, Node.js, Python via WASM).

## When to use it
When an agent needs the "File Systems" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: File Systems). See https://github.com/ckanthony/Chisel. Pending verify -> promote.
