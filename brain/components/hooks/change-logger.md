---
name: change-logger
type: hooks
description: >
  Log every file mutation to CSV for demo prep. Records timestamp, tool, file path, action, and details for Edit, MultiEdit, Write, and Bash operations. Output: .claude/critical_log_changes.csv
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/change-logger.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [automation, hooks]
---
## What it is
Log every file mutation to CSV for demo prep. Records timestamp, tool, file path, action, and details for Edit, MultiEdit, Write, and Bash operations. Output: .claude/critical_log_changes.csv

## When to use it
Log every file mutation to CSV for demo prep. Records timestamp, tool, file path, action, and details for Edit, MultiEdit, Write, and Bash operations. Output: .claude/critical_log_changes.csv

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/change-logger.json -o .claude/hooks/change-logger.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/change-logger.json) — automation category. Type: hooks. Pending verify -> promote.
