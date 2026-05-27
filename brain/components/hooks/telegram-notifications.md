---
name: telegram-notifications
type: hooks
description: >
  Send Telegram notifications when Claude Code finishes working. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables. Get bot token from @BotFather, get chat ID by messaging the bot and visiting https://api.telegram.org/bot<TOKEN>/getUpdates
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/telegram-notifications.json
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
Send Telegram notifications when Claude Code finishes working. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables. Get bot token from @BotFather, get chat ID by messaging the bot and visiting https://api.telegram.org/bot<TOKEN>/getUpdates

## When to use it
Send Telegram notifications when Claude Code finishes working. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables. Get bot token from @BotFather, get chat ID by messaging the bot and visiting https://api.telegram.org/bot<TOKEN>/getUpdates

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/telegram-notifications.json -o .claude/hooks/telegram-notifications.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/telegram-notifications.json) — automation category. Type: hooks. Pending verify -> promote.
