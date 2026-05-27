---
name: prevent-direct-push
type: hooks
description: >
  Prevent direct pushes to protected branches (main, develop). Blocks git push commands targeting main or develop branches to enforce Git Flow workflow. Requires using feature/release/hotfix branches and pull requests instead of direct commits to protected branches.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/git/prevent-direct-push.json
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
Prevent direct pushes to protected branches (main, develop). Blocks git push commands targeting main or develop branches to enforce Git Flow workflow. Requires using feature/release/hotfix branches and pull requests instead of direct commits to protected branches.

## When to use it
Prevent direct pushes to protected branches (main, develop). Blocks git push commands targeting main or develop branches to enforce Git Flow workflow. Requires using feature/release/hotfix branches and pull requests instead of direct commits to protected branches.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/git/prevent-direct-push.json -o .claude/hooks/prevent-direct-push.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/git/prevent-direct-push.json) — git category. Type: hooks. Pending verify -> promote.
