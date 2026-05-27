---
name: additional-directories
type: claudemd-rules
description: >
  Grant access to additional directories outside the current project. Useful for monorepo setups, shared libraries, or when working with documentation stored in separate repositories.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/permissions/additional-directories.json
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
Grant access to additional directories outside the current project. Useful for monorepo setups, shared libraries, or when working with documentation stored in separate repositories.

## When to use it
Grant access to additional directories outside the current project. Useful for monorepo setups, shared libraries, or when working with documentation stored in separate repositories.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/permissions/additional-directories.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/permissions/additional-directories.json) — permissions category. Type: claudemd-rules. Pending verify -> promote.
