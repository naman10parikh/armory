---
name: post-tool-hook
type: hooks
description: >
  Check if we should run validation for this tool use.
source_repo: decider/claude-hooks
source_url: https://github.com/decider/claude-hooks/blob/main/hooks/post-tool-hook.py
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: [check-package-age, portable-quality-validator]
tags: [hook, decider]
---
## What it is
A Claude Code hook from [`decider/claude-hooks`](https://github.com/decider/claude-hooks/blob/main/hooks/post-tool-hook.py). Check if we should run validation for this tool use.

## When to use it
Check if we should run validation for this tool use.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/decider/claude-hooks/raw/main/hooks/post-tool-hook.py -o .claude/hooks/post-tool-hook.py
```

## Notes
Extracted from `hooks/post-tool-hook.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: Check if we should run validation for this tool use. Pending verify -> promote.
