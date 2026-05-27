---
name: env-file-protection
type: hooks
description: >
  Prevent writing to .env files using the if condition for lightweight filtering. Blocks any Write tool call targeting .env* files, protecting secrets from accidental overwrites. Uses the if field to avoid spawning a process unless the file pattern matches.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/security/env-file-protection.json
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
Prevent writing to .env files using the if condition for lightweight filtering. Blocks any Write tool call targeting .env* files, protecting secrets from accidental overwrites. Uses the if field to avoid spawning a process unless the file pattern matches.

## When to use it
Prevent writing to .env files using the if condition for lightweight filtering. Blocks any Write tool call targeting .env* files, protecting secrets from accidental overwrites. Uses the if field to avoid spawning a process unless the file pattern matches.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/security/env-file-protection.json -o .claude/hooks/env-file-protection.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/security/env-file-protection.json) — security category. Type: hooks. Pending verify -> promote.
