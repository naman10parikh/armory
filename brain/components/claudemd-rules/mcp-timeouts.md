---
name: mcp-timeouts
type: claudemd-rules
description: >
  Configure timeout settings for MCP server operations. Adjust startup and tool execution timeouts to accommodate slower systems or complex MCP server operations while preventing indefinite hangs.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/mcp/mcp-timeouts.json
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
Configure timeout settings for MCP server operations. Adjust startup and tool execution timeouts to accommodate slower systems or complex MCP server operations while preventing indefinite hangs.

## When to use it
Configure timeout settings for MCP server operations. Adjust startup and tool execution timeouts to accommodate slower systems or complex MCP server operations while preventing indefinite hangs.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/mcp/mcp-timeouts.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/mcp/mcp-timeouts.json) — mcp category. Type: claudemd-rules. Pending verify -> promote.
