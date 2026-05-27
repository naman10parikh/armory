---
name: desktop-notification-on-stop
type: hooks
description: >
  Sends a native desktop notification when Claude Code finishes responding. Uses the Stop hook event so you get a single notification per response instead of one per tool call (which is very noisy with PostToolUse). Supports macOS (osascript) and Linux (notify-send). Useful when you switch to another window while Claude works — you'll get a notification when it's ready for your input.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/monitoring/desktop-notification-on-stop.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [monitoring, hooks]
---
## What it is
Sends a native desktop notification when Claude Code finishes responding. Uses the Stop hook event so you get a single notification per response instead of one per tool call (which is very noisy with PostToolUse). Supports macOS (osascript) and Linux (notify-send). Useful when you switch to another window while Claude works — you'll get a notification when it's ready for your input.

## When to use it
Sends a native desktop notification when Claude Code finishes responding. Uses the Stop hook event so you get a single notification per response instead of one per tool call (which is very noisy with PostToolUse). Supports macOS (osascript) and Linux (notify-send). Useful when you switch to another window while Claude works — you'll get a notification when it's ready for your input.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/monitoring/desktop-notification-on-stop.json -o .claude/hooks/desktop-notification-on-stop.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/monitoring/desktop-notification-on-stop.json) — monitoring category. Type: hooks. Pending verify -> promote.
