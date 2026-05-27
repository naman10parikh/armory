---
name: slack-notifications
type: hooks
description: >
  Send Slack notifications when Claude Code finishes working. Requires SLACK_WEBHOOK_URL environment variable. Get webhook URL from Slack App settings -> Incoming Webhooks.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/slack-notifications.json
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
Send Slack notifications when Claude Code finishes working. Requires SLACK_WEBHOOK_URL environment variable. Get webhook URL from Slack App settings -> Incoming Webhooks.

## When to use it
Send Slack notifications when Claude Code finishes working. Requires SLACK_WEBHOOK_URL environment variable. Get webhook URL from Slack App settings -> Incoming Webhooks.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/slack-notifications.json -o .claude/hooks/slack-notifications.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/slack-notifications.json) — automation category. Type: hooks. Pending verify -> promote.
