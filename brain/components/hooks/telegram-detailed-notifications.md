---
name: telegram-detailed-notifications
type: hooks
description: >
  Send detailed Telegram notifications with session information when Claude Code finishes. Includes working directory, session duration, and system info. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/telegram-detailed-notifications.json
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
Send detailed Telegram notifications with session information when Claude Code finishes. Includes working directory, session duration, and system info. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.

## When to use it
Send detailed Telegram notifications with session information when Claude Code finishes. Includes working directory, session duration, and system info. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/telegram-detailed-notifications.json -o .claude/hooks/telegram-detailed-notifications.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/telegram-detailed-notifications.json) — automation category. Type: hooks. Pending verify -> promote.
