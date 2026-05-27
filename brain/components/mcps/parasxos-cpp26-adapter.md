---
name: parasxos-cpp26-adapter
type: mcps
description: >
  C++26 paper reference MCP (`cpp26-ref`) backing a Claude Code plugin: `lookup_paper`, fuzzy `search`, `compiler_status` over a 216-paper ISO/IEC 14882:2026 corpus. The plugin's skill + reviewer subagent use these tools to bias Claude toward reflection, contracts, `std::execution` senders, `#embed`, expansion statements — even when the local compiler lags. 95% on a held 39-task eval gate.
source_repo: parasxos/cpp26-adapter
source_url: https://github.com/parasxos/cpp26-adapter
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, developer-tools]
---
## What it is
C++26 paper reference MCP (`cpp26-ref`) backing a Claude Code plugin: `lookup_paper`, fuzzy `search`, `compiler_status` over a 216-paper ISO/IEC 14882:2026 corpus. The plugin's skill + reviewer subagent use these tools to bias Claude toward reflection, contracts, `std::execution` senders, `#embed`, expansion statements — even when the local compiler lags. 95% on a held 39-task eval gate.

## When to use it
When an agent needs the "Developer Tools" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Developer Tools). See https://github.com/parasxos/cpp26-adapter. Pending verify -> promote.
