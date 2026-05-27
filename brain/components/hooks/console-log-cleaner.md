---
name: console-log-cleaner
type: hooks
description: >
  Warns about console.log statements when editing files on production branches (main/master). Helps prevent debug code from reaching production.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/pre-tool/console-log-cleaner.json
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
Warns about console.log statements when editing files on production branches (main/master). Helps prevent debug code from reaching production.

## When to use it
Warns about console.log statements when editing files on production branches (main/master). Helps prevent debug code from reaching production.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/pre-tool/console-log-cleaner.json -o .claude/hooks/console-log-cleaner.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/pre-tool/console-log-cleaner.json) — pre-tool category. Type: hooks. Pending verify -> promote.
