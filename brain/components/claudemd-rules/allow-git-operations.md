---
name: allow-git-operations
type: claudemd-rules
description: >
  Allow common git operations for version control workflow. Permits git status, diff, add, commit, and push operations while maintaining security by requiring explicit permission for potentially destructive operations.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/permissions/allow-git-operations.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [permissions, claudemd-rules]
---
## What it is
Allow common git operations for version control workflow. Permits git status, diff, add, commit, and push operations while maintaining security by requiring explicit permission for potentially destructive operations.

## When to use it
Allow common git operations for version control workflow. Permits git status, diff, add, commit, and push operations while maintaining security by requiring explicit permission for potentially destructive operations.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/permissions/allow-git-operations.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/permissions/allow-git-operations.json) — permissions category. Type: claudemd-rules. Pending verify -> promote.
