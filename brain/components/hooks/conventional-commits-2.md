---
name: conventional-commits-2
type: hooks
description: >
  ❌ Invalid commit message format Your message: {commit_msg} Commit messages must follow Conventional Commits: type(scope): description Types: feat: New feature fix: Bug fix docs: Documentation changes style: Code style changes (formatting) refactor: Code refactoring perf: Performance improvements test: Adding or updating tests chore: Maintenance tasks ci: CI/CD changes build: Build system changes revert: Revert previous commit Examples: ✅ feat: add user authentication ✅ feat(auth): implement JWT tokens ✅ fix: resolve memory leak in parser ✅ fix(api): handle null responses ✅ docs: update API documentation Invalid: ❌ Added new feature (no type) ❌ feat:add feature (missing space after colon) ❌ feature: add login (wrong type, use 'feat') 💡 Tip: Start your message with one of the types above followed by a colon and space.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/git/conventional-commits.py
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
❌ Invalid commit message format Your message: {commit_msg} Commit messages must follow Conventional Commits: type(scope): description Types: feat: New feature fix: Bug fix docs: Documentation changes style: Code style changes (formatting) refactor: Code refactoring perf: Performance improvements test: Adding or updating tests chore: Maintenance tasks ci: CI/CD changes build: Build system changes revert: Revert previous commit Examples: ✅ feat: add user authentication ✅ feat(auth): implement JWT tokens ✅ fix: resolve memory leak in parser ✅ fix(api): handle null responses ✅ docs: update API documentation Invalid: ❌ Added new feature (no type) ❌ feat:add feature (missing space after colon) ❌ feature: add login (wrong type, use 'feat') 💡 Tip: Start your message with one of the types above followed by a colon and space.

## When to use it
❌ Invalid commit message format Your message: {commit_msg} Commit messages must follow Conventional Commits: type(scope): description Types: feat: New feature fix: Bug fix docs: Documentation changes style: Code style changes (formatting) refactor: Code refactoring perf: Performance improvements test: Adding or updating tests chore: Maintenance tasks ci: CI/CD changes build: Build system changes revert: Revert previous commit Examples: ✅ feat: add user authentication ✅ feat(auth): implement JWT tokens ✅ fix: resolve memory leak in parser ✅ fix(api): handle null responses ✅ docs: update API documentation Invalid: ❌ Added new feature (no type) ❌ feat:add feature (missing space after colon) ❌ feature: add login (wrong type, use 'feat') 💡 Tip: Start your message with one of the types above followed by a colon and space.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/git/conventional-commits.py -o .claude/hooks/conventional-commits.py
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/git/conventional-commits.py) — git category. Type: hooks. Pending verify -> promote.
