---
name: stop
type: hooks
description: >
  Run when the main agent finishes responding, to announce completion or run end-of-turn checks.
source_repo: disler/claude-code-hooks-mastery
source_url: https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/stop.py
license: unknown
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: [notification, permission-request]
tags: [hook, disler]
---
## What it is
A Claude Code hook from [`disler/claude-code-hooks-mastery`](https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/stop.py). Run when the main agent finishes responding, to announce completion or run end-of-turn checks.

## When to use it
Run when the main agent finishes responding, to announce completion or run end-of-turn checks.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/disler/claude-code-hooks-mastery/raw/main/.claude/hooks/stop.py -o .claude/hooks/stop.py
```

## Notes
Extracted from `.claude/hooks/stop.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: Return list of friendly completion messages. Pending verify -> promote.
