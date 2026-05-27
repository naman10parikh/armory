---
name: slack-detailed-notifications
type: hooks
description: >
  Send detailed Slack notifications with session information when Claude Code finishes. Includes working directory, session duration, and system info. Requires SLACK_WEBHOOK_URL environment variable.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/slack-detailed-notifications.json
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
Send detailed Slack notifications with session information when Claude Code finishes. Includes working directory, session duration, and system info. Requires SLACK_WEBHOOK_URL environment variable.

## When to use it
Send detailed Slack notifications with session information when Claude Code finishes. Includes working directory, session duration, and system info. Requires SLACK_WEBHOOK_URL environment variable.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/slack-detailed-notifications.json -o .claude/hooks/slack-detailed-notifications.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/slack-detailed-notifications.json) — automation category. Type: hooks. Pending verify -> promote.
