---
name: notify-before-bash
type: hooks
description: >
  Show notification before any Bash command execution for security awareness. This hook displays a simple echo message '🔔 About to run bash command...' before Claude executes any bash command, giving you visibility into when system commands are about to run. Useful for monitoring and auditing command execution.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/pre-tool/notify-before-bash.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [pre-tool, hooks]
---
## What it is
Show notification before any Bash command execution for security awareness. This hook displays a simple echo message '🔔 About to run bash command...' before Claude executes any bash command, giving you visibility into when system commands are about to run. Useful for monitoring and auditing command execution.

## When to use it
Show notification before any Bash command execution for security awareness. This hook displays a simple echo message '🔔 About to run bash command...' before Claude executes any bash command, giving you visibility into when system commands are about to run. Useful for monitoring and auditing command execution.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/pre-tool/notify-before-bash.json -o .claude/hooks/notify-before-bash.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/pre-tool/notify-before-bash.json) — pre-tool category. Type: hooks. Pending verify -> promote.
