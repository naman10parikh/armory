---
name: edit-audit-log
type: hooks
description: >
  Log all file edits to a project-local audit file with timestamps. Records every Edit tool usage to .claude/edit-log.txt for tracking changes across sessions. Requires jq.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/development-tools/edit-audit-log.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [development-tools, hooks]
---
## What it is
Log all file edits to a project-local audit file with timestamps. Records every Edit tool usage to .claude/edit-log.txt for tracking changes across sessions. Requires jq.

## When to use it
Log all file edits to a project-local audit file with timestamps. Records every Edit tool usage to .claude/edit-log.txt for tracking changes across sessions. Requires jq.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/development-tools/edit-audit-log.json -o .claude/hooks/edit-audit-log.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/development-tools/edit-audit-log.json) — development-tools category. Type: hooks. Pending verify -> promote.
