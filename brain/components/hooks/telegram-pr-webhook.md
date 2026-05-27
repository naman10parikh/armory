---
name: telegram-pr-webhook
type: hooks
description: >
  Send Telegram notification when a new PR is created via gh pr create. Includes PR URL and Vercel preview URL. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables. Optionally set VERCEL_PROJECT_NAME and VERCEL_TEAM_SLUG to construct the Vercel preview URL automatically.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/telegram-pr-webhook.json
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
Send Telegram notification when a new PR is created via gh pr create. Includes PR URL and Vercel preview URL. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables. Optionally set VERCEL_PROJECT_NAME and VERCEL_TEAM_SLUG to construct the Vercel preview URL automatically.

## When to use it
Send Telegram notification when a new PR is created via gh pr create. Includes PR URL and Vercel preview URL. Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables. Optionally set VERCEL_PROJECT_NAME and VERCEL_TEAM_SLUG to construct the Vercel preview URL automatically.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/telegram-pr-webhook.json -o .claude/hooks/telegram-pr-webhook.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/telegram-pr-webhook.json) — automation category. Type: hooks. Pending verify -> promote.
