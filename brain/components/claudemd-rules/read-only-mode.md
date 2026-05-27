---
name: read-only-mode
type: claudemd-rules
description: >
  Restrict Claude to read-only operations for code review and analysis. Prevents any file modifications or command executions, making it safe for exploring unfamiliar codebases or conducting security audits.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/permissions/read-only-mode.json
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
Restrict Claude to read-only operations for code review and analysis. Prevents any file modifications or command executions, making it safe for exploring unfamiliar codebases or conducting security audits.

## When to use it
Restrict Claude to read-only operations for code review and analysis. Prevents any file modifications or command executions, making it safe for exploring unfamiliar codebases or conducting security audits.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/permissions/read-only-mode.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/permissions/read-only-mode.json) — permissions category. Type: claudemd-rules. Pending verify -> promote.
