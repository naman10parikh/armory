---
name: change-logger-2
type: hooks
description: >
  Change Logger Hook Logs every file mutation (Edit, Write, Bash) to a CSV file for demo prep and session review. Output: .claude/critical_log_changes.csv
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/change-logger.py
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
Change Logger Hook Logs every file mutation (Edit, Write, Bash) to a CSV file for demo prep and session review. Output: .claude/critical_log_changes.csv

## When to use it
Change Logger Hook Logs every file mutation (Edit, Write, Bash) to a CSV file for demo prep and session review. Output: .claude/critical_log_changes.csv

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/change-logger.py -o .claude/hooks/change-logger.py
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/change-logger.py) — automation category. Type: hooks. Pending verify -> promote.
