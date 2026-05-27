---
name: dangerous-command-blocker
type: hooks
description: >
  Advanced protection against dangerous shell commands with multi-level security. Blocks catastrophic operations (rm -rf /, dd, mkfs), protects critical paths (.claude/, .git/, node_modules/), and warns about suspicious patterns. Features: catastrophic command blocking, critical path protection, smart pattern detection, and detailed safety messages.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/security/dangerous-command-blocker.json
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
Advanced protection against dangerous shell commands with multi-level security. Blocks catastrophic operations (rm -rf /, dd, mkfs), protects critical paths (.claude/, .git/, node_modules/), and warns about suspicious patterns. Features: catastrophic command blocking, critical path protection, smart pattern detection, and detailed safety messages.

## When to use it
Advanced protection against dangerous shell commands with multi-level security. Blocks catastrophic operations (rm -rf /, dd, mkfs), protects critical paths (.claude/, .git/, node_modules/), and warns about suspicious patterns. Features: catastrophic command blocking, critical path protection, smart pattern detection, and detailed safety messages.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/security/dangerous-command-blocker.json -o .claude/hooks/dangerous-command-blocker.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/security/dangerous-command-blocker.json) — security category. Type: hooks. Pending verify -> promote.
