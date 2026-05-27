---
name: check-package-age
type: hooks
description: >
  Claude Code Hook: Prevent installation of outdated packages.
source_repo: decider/claude-hooks
source_url: https://github.com/decider/claude-hooks/blob/main/hooks/check-package-age.py
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: [portable-quality-validator, post-tool-hook]
tags: [hook, decider]
---
## What it is
A Claude Code hook from [`decider/claude-hooks`](https://github.com/decider/claude-hooks/blob/main/hooks/check-package-age.py). Claude Code Hook: Prevent installation of outdated packages.

## When to use it
Claude Code Hook: Prevent installation of outdated packages.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/decider/claude-hooks/raw/main/hooks/check-package-age.py -o .claude/hooks/check-package-age.py
```

## Notes
Extracted from `hooks/check-package-age.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: Claude Code Hook: Prevent installation of outdated packages. Pending verify -> promote.
