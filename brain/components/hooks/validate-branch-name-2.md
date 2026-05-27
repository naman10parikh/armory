---
name: validate-branch-name-2
type: hooks
description: >
  ❌ Invalid Git Flow branch name: {branch_name} Git Flow branches must follow these patterns: • feature/<descriptive-name> • release/v<MAJOR>.<MINOR>.<PATCH> • hotfix/<descriptive-name> Examples: ✅ feature/user-authentication ✅ release/v1.2.0 ✅ hotfix/critical-security-fix Invalid: ❌ {branch_name} (missing Git Flow prefix) ❌ feat/something (use 'feature/' not 'feat/') ❌ fix/bug (use 'hotfix/' not 'fix/') 💡 Use Git Flow commands instead: /feature <name> - Create feature branch /release <version> - Create release branch /hotfix <name> - Create hotfix branch
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/git/validate-branch-name.py
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
❌ Invalid Git Flow branch name: {branch_name} Git Flow branches must follow these patterns: • feature/<descriptive-name> • release/v<MAJOR>.<MINOR>.<PATCH> • hotfix/<descriptive-name> Examples: ✅ feature/user-authentication ✅ release/v1.2.0 ✅ hotfix/critical-security-fix Invalid: ❌ {branch_name} (missing Git Flow prefix) ❌ feat/something (use 'feature/' not 'feat/') ❌ fix/bug (use 'hotfix/' not 'fix/') 💡 Use Git Flow commands instead: /feature <name> - Create feature branch /release <version> - Create release branch /hotfix <name> - Create hotfix branch

## When to use it
❌ Invalid Git Flow branch name: {branch_name} Git Flow branches must follow these patterns: • feature/<descriptive-name> • release/v<MAJOR>.<MINOR>.<PATCH> • hotfix/<descriptive-name> Examples: ✅ feature/user-authentication ✅ release/v1.2.0 ✅ hotfix/critical-security-fix Invalid: ❌ {branch_name} (missing Git Flow prefix) ❌ feat/something (use 'feature/' not 'feat/') ❌ fix/bug (use 'hotfix/' not 'fix/') 💡 Use Git Flow commands instead: /feature <name> - Create feature branch /release <version> - Create release branch /hotfix <name> - Create hotfix branch

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/git/validate-branch-name.py -o .claude/hooks/validate-branch-name.py
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/git/validate-branch-name.py) — git category. Type: hooks. Pending verify -> promote.
