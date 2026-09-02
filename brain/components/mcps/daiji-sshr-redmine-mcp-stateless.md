---
name: daiji-sshr-redmine-mcp-stateless
type: mcps
description: >
  Stateless Redmine MCP server. Credentials are passed per-request via HTTP headers and never stored on the server. Supports listing/creating/updating issues, full-text search across subjects, descriptions and comments, and editing journals (Redmine 5.0+). Deployable on RHEL (systemd) or Docker.
source_repo: daiji-sshr/redmine-mcp-stateless
source_url: https://github.com/daiji-sshr/redmine-mcp-stateless
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, product-management]
stars: 1
forks: 0
pushed_at: "2026-07-02T12:04:05Z"
---
## What it is
Stateless Redmine MCP server. Credentials are passed per-request via HTTP headers and never stored on the server. Supports listing/creating/updating issues, full-text search across subjects, descriptions and comments, and editing journals (Redmine 5.0+). Deployable on RHEL (systemd) or Docker.

## When to use it
When an agent needs the "Product Management" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Product Management). See https://github.com/daiji-sshr/redmine-mcp-stateless. Pending verify -> promote.
