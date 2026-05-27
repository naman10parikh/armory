---
name: prevent-direct-push-2
type: hooks
description: >
  ❌ Direct push to main/develop is not allowed! Protected branches: - main (production) - develop (integration) Git Flow workflow: 1. Create a feature branch: /feature <name> 2. Make your changes and commit 3. Push feature branch: git push origin feature/<name> 4. Create pull request: gh pr create 5. After approval, merge with: /finish For releases: /release <version> → PR → /finish For hotfixes: /hotfix <name> → PR → /finish Current branch: {current_branch} 💡 Use feature/release/hotfix branches instead of pushing directly to main/develop.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/git/prevent-direct-push.py
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
❌ Direct push to main/develop is not allowed! Protected branches: - main (production) - develop (integration) Git Flow workflow: 1. Create a feature branch: /feature <name> 2. Make your changes and commit 3. Push feature branch: git push origin feature/<name> 4. Create pull request: gh pr create 5. After approval, merge with: /finish For releases: /release <version> → PR → /finish For hotfixes: /hotfix <name> → PR → /finish Current branch: {current_branch} 💡 Use feature/release/hotfix branches instead of pushing directly to main/develop.

## When to use it
❌ Direct push to main/develop is not allowed! Protected branches: - main (production) - develop (integration) Git Flow workflow: 1. Create a feature branch: /feature <name> 2. Make your changes and commit 3. Push feature branch: git push origin feature/<name> 4. Create pull request: gh pr create 5. After approval, merge with: /finish For releases: /release <version> → PR → /finish For hotfixes: /hotfix <name> → PR → /finish Current branch: {current_branch} 💡 Use feature/release/hotfix branches instead of pushing directly to main/develop.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/git/prevent-direct-push.py -o .claude/hooks/prevent-direct-push.py
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/git/prevent-direct-push.py) — git category. Type: hooks. Pending verify -> promote.
