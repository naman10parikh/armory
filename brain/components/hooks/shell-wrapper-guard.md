---
name: shell-wrapper-guard
type: hooks
description: >
  Detects destructive commands hidden inside shell wrappers (sh -c, bash -c, python3 -c, node -e, perl -e, ruby -e). Complements dangerous-command-blocker by catching bypass vectors like 'sh -c "rm -rf /"' that evade direct command checks. Covers 8 bypass patterns: interpreter one-liners, nested wrappers, pipe-to-shell, here-strings, and env-based wrappers.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/security/shell-wrapper-guard.json
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
Detects destructive commands hidden inside shell wrappers (sh -c, bash -c, python3 -c, node -e, perl -e, ruby -e). Complements dangerous-command-blocker by catching bypass vectors like 'sh -c "rm -rf /"' that evade direct command checks. Covers 8 bypass patterns: interpreter one-liners, nested wrappers, pipe-to-shell, here-strings, and env-based wrappers.

## When to use it
Detects destructive commands hidden inside shell wrappers (sh -c, bash -c, python3 -c, node -e, perl -e, ruby -e). Complements dangerous-command-blocker by catching bypass vectors like 'sh -c "rm -rf /"' that evade direct command checks. Covers 8 bypass patterns: interpreter one-liners, nested wrappers, pipe-to-shell, here-strings, and env-based wrappers.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/security/shell-wrapper-guard.json -o .claude/hooks/shell-wrapper-guard.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/security/shell-wrapper-guard.json) — security category. Type: hooks. Pending verify -> promote.
