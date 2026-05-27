---
name: update-search-year
type: hooks
description: >
  Automatically adds current year to WebSearch queries when no year is specified. This hook intercepts WebSearch tool usage and appends the current year to queries that don't already contain a year, ensuring search results are current and relevant.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/pre-tool/update-search-year.json
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
Automatically adds current year to WebSearch queries when no year is specified. This hook intercepts WebSearch tool usage and appends the current year to queries that don't already contain a year, ensuring search results are current and relevant.

## When to use it
Automatically adds current year to WebSearch queries when no year is specified. This hook intercepts WebSearch tool usage and appends the current year to queries that don't already contain a year, ensuring search results are current and relevant.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/pre-tool/update-search-year.json -o .claude/hooks/update-search-year.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/pre-tool/update-search-year.json) — pre-tool category. Type: hooks. Pending verify -> promote.
