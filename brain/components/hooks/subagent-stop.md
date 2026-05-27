---
name: subagent-stop
type: hooks
description: >
  Run when a sub-agent finishes, to capture its output or chain follow-up work.
source_repo: disler/claude-code-hooks-mastery
source_url: https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/subagent_stop.py
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
A Claude Code hook from [`disler/claude-code-hooks-mastery`](https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/subagent_stop.py). Run when a sub-agent finishes, to capture its output or chain follow-up work.

## When to use it
Run when a sub-agent finishes, to capture its output or chain follow-up work.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/disler/claude-code-hooks-mastery/raw/main/.claude/hooks/subagent_stop.py -o .claude/hooks/subagent-stop.py
```

## Notes
Extracted from `.claude/hooks/subagent_stop.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: Write debug message to logs/subagent_debug.log Pending verify -> promote.
