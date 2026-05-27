---
name: telegram-error-notifications
type: hooks
description: >
  Send Telegram notifications when Claude Code encounters long-running operations or when tools take significant time. Helps monitor productivity and catch potential issues. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/telegram-error-notifications.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [automation, hooks]
---
## What it is
Send Telegram notifications when Claude Code encounters long-running operations or when tools take significant time. Helps monitor productivity and catch potential issues. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.

## When to use it
Send Telegram notifications when Claude Code encounters long-running operations or when tools take significant time. Helps monitor productivity and catch potential issues. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/telegram-error-notifications.json -o .claude/hooks/telegram-error-notifications.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/telegram-error-notifications.json) — automation category. Type: hooks. Pending verify -> promote.
