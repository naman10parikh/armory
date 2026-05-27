---
name: conventional-commits
type: hooks
description: >
  Enforce conventional commit message format for all git commits. Validates commit messages follow the pattern: type(scope): description. Supported types: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert. Ensures consistent commit history for changelog generation and semantic versioning.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/git/conventional-commits.json
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
Enforce conventional commit message format for all git commits. Validates commit messages follow the pattern: type(scope): description. Supported types: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert. Ensures consistent commit history for changelog generation and semantic versioning.

## When to use it
Enforce conventional commit message format for all git commits. Validates commit messages follow the pattern: type(scope): description. Supported types: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert. Ensures consistent commit history for changelog generation and semantic versioning.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/git/conventional-commits.json -o .claude/hooks/conventional-commits.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/git/conventional-commits.json) — git category. Type: hooks. Pending verify -> promote.
