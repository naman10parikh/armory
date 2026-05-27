---
name: discord-error-notifications
type: hooks
description: >
  Send Discord notifications when Claude Code encounters long-running operations or when tools take significant time. Helps monitor productivity and catch potential issues with rich embeds. Requires DISCORD_WEBHOOK_URL environment variable.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/discord-error-notifications.json
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
Send Discord notifications when Claude Code encounters long-running operations or when tools take significant time. Helps monitor productivity and catch potential issues with rich embeds. Requires DISCORD_WEBHOOK_URL environment variable.

## When to use it
Send Discord notifications when Claude Code encounters long-running operations or when tools take significant time. Helps monitor productivity and catch potential issues with rich embeds. Requires DISCORD_WEBHOOK_URL environment variable.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/automation/discord-error-notifications.json -o .claude/hooks/discord-error-notifications.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/automation/discord-error-notifications.json) — automation category. Type: hooks. Pending verify -> promote.
