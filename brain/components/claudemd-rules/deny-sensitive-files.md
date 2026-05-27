---
name: deny-sensitive-files
type: claudemd-rules
description: >
  Deny access to sensitive files like environment variables and secrets.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/permissions/deny-sensitive-files.json
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
Deny access to sensitive files like environment variables and secrets.

## When to use it
Deny access to sensitive files like environment variables and secrets.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/permissions/deny-sensitive-files.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/permissions/deny-sensitive-files.json) — permissions category. Type: claudemd-rules. Pending verify -> promote.
