---
name: force-push-blocker
type: hooks
description: >
  Block git force push commands using the if condition for efficient filtering. Prevents accidental force pushes that can overwrite remote history. Covers --force, --force-with-lease, and the -f shorthand.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/security/force-push-blocker.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [security, hooks]
---
## What it is
Block git force push commands using the if condition for efficient filtering. Prevents accidental force pushes that can overwrite remote history. Covers --force, --force-with-lease, and the -f shorthand.

## When to use it
Block git force push commands using the if condition for efficient filtering. Prevents accidental force pushes that can overwrite remote history. Covers --force, --force-with-lease, and the -f shorthand.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/security/force-push-blocker.json -o .claude/hooks/force-push-blocker.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/security/force-push-blocker.json) — security category. Type: hooks. Pending verify -> promote.
