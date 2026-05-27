---
name: create-worktrees
type: workflows
description: >
  This command fetches all open pull requests using GitHub CLI, then creates a git worktree for each PR's branch in the `./tree/<BRANCH_NAME>` directory.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/commands/git-workflow/create-worktrees.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [git-workflow, workflows]
---
## What it is
This command fetches all open pull requests using GitHub CLI, then creates a git worktree for each PR's branch in the `./tree/<BRANCH_NAME>` directory.

## When to use it
This command fetches all open pull requests using GitHub CLI, then creates a git worktree for each PR's branch in the `./tree/<BRANCH_NAME>` directory.

## How to install / invoke
```bash
# Copy the command into your project's .claude/commands/
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/commands/git-workflow/create-worktrees.md -o .claude/commands/create-worktrees.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/commands/git-workflow/create-worktrees.md) — git-workflow category. Type: workflows. Pending verify -> promote.
