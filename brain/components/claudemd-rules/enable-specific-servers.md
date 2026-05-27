---
name: enable-specific-servers
type: claudemd-rules
description: >
  Enable only specific MCP servers from .mcp.json files. This provides granular control over which MCP integrations are active, allowing you to selectively enable trusted or required servers while blocking others.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/mcp/enable-specific-servers.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [mcp, claudemd-rules]
---
## What it is
Enable only specific MCP servers from .mcp.json files. This provides granular control over which MCP integrations are active, allowing you to selectively enable trusted or required servers while blocking others.

## When to use it
Enable only specific MCP servers from .mcp.json files. This provides granular control over which MCP integrations are active, allowing you to selectively enable trusted or required servers while blocking others.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/mcp/enable-specific-servers.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/mcp/enable-specific-servers.json) — mcp category. Type: claudemd-rules. Pending verify -> promote.
