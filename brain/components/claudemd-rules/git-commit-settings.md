---
name: git-commit-settings
type: claudemd-rules
description: >
  Configure git commit behavior including the co-authored-by signature. Disable the Claude co-authorship line if you prefer clean commit history or have organizational policies against AI attribution.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/global/git-commit-settings.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [global, claudemd-rules]
---
## What it is
Configure git commit behavior including the co-authored-by signature. Disable the Claude co-authorship line if you prefer clean commit history or have organizational policies against AI attribution.

## When to use it
Configure git commit behavior including the co-authored-by signature. Disable the Claude co-authorship line if you prefer clean commit history or have organizational policies against AI attribution.

## How to install / invoke
```bash
# Merge the settings block into your .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/settings/global/git-commit-settings.json | jq .
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/settings/global/git-commit-settings.json) — global category. Type: claudemd-rules. Pending verify -> promote.
