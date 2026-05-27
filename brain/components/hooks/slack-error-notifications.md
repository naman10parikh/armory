---
name: slack-error-notifications
type: hooks
description: >
  Send Slack notifications when Claude Code encounters long-running operations or when tools take significant time. Helps monitor productivity and catch potential issues. Requires SLACK_WEBHOOK_URL environment variable.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/slack-error-notifications.json
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
Send Slack notifications when Claude Code encounters long-running operations or when tools take significant time. Helps monitor productivity and catch potential issues. Requires SLACK_WEBHOOK_URL environment variable.

## When to use it
Send Slack notifications when Claude Code encounters long-running operations or when tools take significant time. Helps monitor productivity and catch potential issues. Requires SLACK_WEBHOOK_URL environment variable.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/slack-error-notifications.json -o .claude/hooks/slack-error-notifications.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/slack-error-notifications.json) — automation category. Type: hooks. Pending verify -> promote.
