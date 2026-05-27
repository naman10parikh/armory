---
name: session-end
type: hooks
description: >
  Run at session end, to flush logs, persist memory, or clean up.
source_repo: disler/claude-code-hooks-mastery
source_url: https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/session_end.py
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
A Claude Code hook from [`disler/claude-code-hooks-mastery`](https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/session_end.py). Run at session end, to flush logs, persist memory, or clean up.

## When to use it
Run at session end, to flush logs, persist memory, or clean up.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/disler/claude-code-hooks-mastery/raw/main/.claude/hooks/session_end.py -o .claude/hooks/session-end.py
```

## Notes
Extracted from `.claude/hooks/session_end.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: Log session end event to logs directory. Pending verify -> promote.
