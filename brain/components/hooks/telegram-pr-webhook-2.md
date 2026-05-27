---
name: telegram-pr-webhook-2
type: hooks
description: >
  Telegram PR Webhook Hook Sends a Telegram notification when a new PR is created via `gh pr create`. Includes the PR URL and the Vercel preview URL. Required environment variables: TELEGRAM_BOT_TOKEN - Bot token from @BotFather TELEGRAM_CHAT_ID - Chat ID for notifications Optional environment variables: VERCEL_PROJECT_NAME - Vercel project name (for preview URL) VERCEL_TEAM_SLUG - Vercel team slug (for preview URL)
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/telegram-pr-webhook.py
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
Telegram PR Webhook Hook Sends a Telegram notification when a new PR is created via `gh pr create`. Includes the PR URL and the Vercel preview URL. Required environment variables: TELEGRAM_BOT_TOKEN - Bot token from @BotFather TELEGRAM_CHAT_ID - Chat ID for notifications Optional environment variables: VERCEL_PROJECT_NAME - Vercel project name (for preview URL) VERCEL_TEAM_SLUG - Vercel team slug (for preview URL)

## When to use it
Telegram PR Webhook Hook Sends a Telegram notification when a new PR is created via `gh pr create`. Includes the PR URL and the Vercel preview URL. Required environment variables: TELEGRAM_BOT_TOKEN - Bot token from @BotFather TELEGRAM_CHAT_ID - Chat ID for notifications Optional environment variables: VERCEL_PROJECT_NAME - Vercel project name (for preview URL) VERCEL_TEAM_SLUG - Vercel team slug (for preview URL)

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/telegram-pr-webhook.py -o .claude/hooks/telegram-pr-webhook.py
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/telegram-pr-webhook.py) — automation category. Type: hooks. Pending verify -> promote.
