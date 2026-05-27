---
name: portable-quality-validator
type: hooks
description: >
  Portable code quality validator - main handler.
source_repo: decider/claude-hooks
source_url: https://github.com/decider/claude-hooks/blob/main/hooks/portable-quality-validator.py
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: [check-package-age, post-tool-hook]
tags: [hook, decider]
---
## What it is
A Claude Code hook from [`decider/claude-hooks`](https://github.com/decider/claude-hooks/blob/main/hooks/portable-quality-validator.py). Portable code quality validator - main handler.

## When to use it
Portable code quality validator - main handler.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/decider/claude-hooks/raw/main/hooks/portable-quality-validator.py -o .claude/hooks/portable-quality-validator.py
```

## Notes
Extracted from `hooks/portable-quality-validator.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: Portable code quality validator - main handler. Pending verify -> promote.
