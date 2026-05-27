---
name: commit-guardian
type: subagents
description: >
  Pre-commit verification agent that runs 10 automated checks before every git commit. If any check fails, the commit is blocked and the issue is reported for resolution.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/git/commit-guardian.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [git, subagents]
---
## What it is
Pre-commit verification agent that runs 10 automated checks before every git commit. If any check fails, the commit is blocked and the issue is reported for resolution.

## When to use it
Pre-commit verification agent that runs 10 automated checks before every git commit. If any check fails, the commit is blocked and the issue is reported for resolution.

## How to install / invoke
```bash
# Copy the agent definition into your project's .claude/agents/
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/git/commit-guardian.md -o .claude/agents/commit-guardian.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/git/commit-guardian.md) — git category. Type: subagents. Pending verify -> promote.
