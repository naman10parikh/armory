---
name: discord-detailed-notifications
type: hooks
description: >
  Send detailed Discord notifications with session information when Claude Code finishes. Includes working directory, session duration, and system info with rich embeds. Requires DISCORD_WEBHOOK_URL environment variable.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/discord-detailed-notifications.json
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
Send detailed Discord notifications with session information when Claude Code finishes. Includes working directory, session duration, and system info with rich embeds. Requires DISCORD_WEBHOOK_URL environment variable.

## When to use it
Send detailed Discord notifications with session information when Claude Code finishes. Includes working directory, session duration, and system info with rich embeds. Requires DISCORD_WEBHOOK_URL environment variable.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/discord-detailed-notifications.json -o .claude/hooks/discord-detailed-notifications.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/discord-detailed-notifications.json) — automation category. Type: hooks. Pending verify -> promote.
