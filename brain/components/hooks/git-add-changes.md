---
name: git-add-changes
type: hooks
description: >
  Automatically stage changes in git after file modifications for easier commit workflow. This hook runs 'git add' on any file that Claude edits or writes, automatically staging changes for the next commit. Includes error suppression so it won't fail in non-git repositories. Helps streamline the development workflow by preparing files for commit.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/post-tool/git-add-changes.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [post-tool, hooks]
---
## What it is
Automatically stage changes in git after file modifications for easier commit workflow. This hook runs 'git add' on any file that Claude edits or writes, automatically staging changes for the next commit. Includes error suppression so it won't fail in non-git repositories. Helps streamline the development workflow by preparing files for commit.

## When to use it
Automatically stage changes in git after file modifications for easier commit workflow. This hook runs 'git add' on any file that Claude edits or writes, automatically staging changes for the next commit. Includes error suppression so it won't fail in non-git repositories. Helps streamline the development workflow by preparing files for commit.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/post-tool/git-add-changes.json -o .claude/hooks/git-add-changes.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/post-tool/git-add-changes.json) — post-tool category. Type: hooks. Pending verify -> promote.
