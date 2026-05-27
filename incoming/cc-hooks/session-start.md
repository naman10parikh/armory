---
name: session-start
type: hooks
description: >
  Run at session start, to load context, memory, or environment state.
source_repo: disler/claude-code-hooks-mastery
source_url: https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/session_start.py
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
A Claude Code hook from [`disler/claude-code-hooks-mastery`](https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/session_start.py). Run at session start, to load context, memory, or environment state.

## When to use it
Run at session start, to load context, memory, or environment state.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/disler/claude-code-hooks-mastery/raw/main/.claude/hooks/session_start.py -o .claude/hooks/session-start.py
```

## Notes
Extracted from `.claude/hooks/session_start.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: Log session start event to logs directory. Pending verify -> promote.
