---
name: notification
type: hooks
description: >
  Run on Claude Code notification events to surface alerts (e.g. text-to-speech, desktop toast).
source_repo: disler/claude-code-hooks-mastery
source_url: https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/notification.py
license: unknown
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: []
tags: [hook, disler]
---
## What it is
A Claude Code hook from [`disler/claude-code-hooks-mastery`](https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/notification.py). Run on Claude Code notification events to surface alerts (e.g. text-to-speech, desktop toast).

## When to use it
Run on Claude Code notification events to surface alerts (e.g. text-to-speech, desktop toast).

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/disler/claude-code-hooks-mastery/raw/main/.claude/hooks/notification.py -o .claude/hooks/notification.py
```

## Notes
Extracted from `.claude/hooks/notification.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: Determine which TTS script to use based on available API keys. Priority order: ElevenLabs > OpenAI > pyttsx3 Pending verify -> promote.
