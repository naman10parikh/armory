---
name: setup
type: hooks
description: >
  Run on setup/initialization to prepare the hook environment.
source_repo: disler/claude-code-hooks-mastery
source_url: https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/setup.py
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
A Claude Code hook from [`disler/claude-code-hooks-mastery`](https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/setup.py). Run on setup/initialization to prepare the hook environment.

## When to use it
Run on setup/initialization to prepare the hook environment.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/disler/claude-code-hooks-mastery/raw/main/.claude/hooks/setup.py -o .claude/hooks/setup.py
```

## Notes
Extracted from `.claude/hooks/setup.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: Log setup event to logs directory. Pending verify -> promote.
