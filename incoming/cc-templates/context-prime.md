---
name: context-prime
type: workflows
description: >
  Read README.md, THEN run `git ls-files | grep -v -f (sed 's|^|^|; s|$|/|' .cursorignore | psub)` to understand the context of the project
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/commands/utilities/context-prime.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [utilities, workflows]
---
## What it is
Read README.md, THEN run `git ls-files | grep -v -f (sed 's|^|^|; s|$|/|' .cursorignore | psub)` to understand the context of the project

## When to use it
Read README.md, THEN run `git ls-files | grep -v -f (sed 's|^|^|; s|$|/|' .cursorignore | psub)` to understand the context of the project

## How to install / invoke
```bash
# Copy the command into your project's .claude/commands/
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/commands/utilities/context-prime.md -o .claude/commands/context-prime.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/commands/utilities/context-prime.md) — utilities category. Type: workflows. Pending verify -> promote.
