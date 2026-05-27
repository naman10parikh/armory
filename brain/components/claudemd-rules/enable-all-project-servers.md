---
name: enable-all-project-servers
type: claudemd-rules
description: >
  Automatically approve and enable all MCP servers defined in project .mcp.json files. This setting bypasses manual approval prompts for project-defined MCP servers, streamlining development workflow in trusted environments.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/mcp/enable-all-project-servers.json
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
Automatically approve and enable all MCP servers defined in project .mcp.json files. This setting bypasses manual approval prompts for project-defined MCP servers, streamlining development workflow in trusted environments.

## When to use it
Automatically approve and enable all MCP servers defined in project .mcp.json files. This setting bypasses manual approval prompts for project-defined MCP servers, streamlining development workflow in trusted environments.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/mcp/enable-all-project-servers.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/mcp/enable-all-project-servers.json) — mcp category. Type: claudemd-rules. Pending verify -> promote.
