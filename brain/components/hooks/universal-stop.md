---
name: universal-stop
type: hooks
description: >
  Universal Stop dispatcher using hierarchical config.
source_repo: decider/claude-hooks
source_url: https://github.com/decider/claude-hooks/blob/main/hooks/universal-stop.py
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: []
tags: [hook, decider]
---
## What it is
A Claude Code hook from [`decider/claude-hooks`](https://github.com/decider/claude-hooks/blob/main/hooks/universal-stop.py). Universal Stop dispatcher using hierarchical config.

## When to use it
Universal Stop dispatcher using hierarchical config.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/decider/claude-hooks/raw/main/hooks/universal-stop.py -o .claude/hooks/universal-stop.py
```

## Notes
Extracted from `hooks/universal-stop.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: Universal Stop dispatcher using hierarchical config. Pending verify -> promote.
