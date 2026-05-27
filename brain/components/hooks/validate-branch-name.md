---
name: validate-branch-name
type: hooks
description: >
  Validate Git Flow branch naming conventions before checkout. Ensures branches follow the pattern: feature/*, release/v*.*.*, hotfix/*. Prevents creation of branches that don't follow Git Flow standards.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/git/validate-branch-name.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [git, hooks]
---
## What it is
Validate Git Flow branch naming conventions before checkout. Ensures branches follow the pattern: feature/*, release/v*.*.*, hotfix/*. Prevents creation of branches that don't follow Git Flow standards.

## When to use it
Validate Git Flow branch naming conventions before checkout. Ensures branches follow the pattern: feature/*, release/v*.*.*, hotfix/*. Prevents creation of branches that don't follow Git Flow standards.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/git/validate-branch-name.json -o .claude/hooks/validate-branch-name.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/git/validate-branch-name.json) — git category. Type: hooks. Pending verify -> promote.
