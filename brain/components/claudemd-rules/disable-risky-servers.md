---
name: disable-risky-servers
type: claudemd-rules
description: >
  Disable specific MCP servers that may pose security risks or are not needed for your workflow. This blacklist approach allows most servers while blocking potentially problematic integrations.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/mcp/disable-risky-servers.json
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
Disable specific MCP servers that may pose security risks or are not needed for your workflow. This blacklist approach allows most servers while blocking potentially problematic integrations.

## When to use it
Disable specific MCP servers that may pose security risks or are not needed for your workflow. This blacklist approach allows most servers while blocking potentially problematic integrations.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/mcp/disable-risky-servers.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/mcp/disable-risky-servers.json) — mcp category. Type: claudemd-rules. Pending verify -> promote.
