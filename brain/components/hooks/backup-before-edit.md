---
name: backup-before-edit
type: hooks
description: >
  Create automatic backup of files before any Edit operation for safety. This hook creates a timestamped backup copy (filename.backup.timestamp) of any existing file before Claude modifies it. Provides a safety net to recover previous versions if needed. Only backs up existing files, includes error suppression to handle edge cases gracefully.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/pre-tool/backup-before-edit.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [pre-tool, hooks]
---
## What it is
Create automatic backup of files before any Edit operation for safety. This hook creates a timestamped backup copy (filename.backup.timestamp) of any existing file before Claude modifies it. Provides a safety net to recover previous versions if needed. Only backs up existing files, includes error suppression to handle edge cases gracefully.

## When to use it
Create automatic backup of files before any Edit operation for safety. This hook creates a timestamped backup copy (filename.backup.timestamp) of any existing file before Claude modifies it. Provides a safety net to recover previous versions if needed. Only backs up existing files, includes error suppression to handle edge cases gracefully.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/pre-tool/backup-before-edit.json -o .claude/hooks/backup-before-edit.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/pre-tool/backup-before-edit.json) — pre-tool category. Type: hooks. Pending verify -> promote.
