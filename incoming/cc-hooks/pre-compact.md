---
name: pre-compact
type: hooks
description: >
  Run before context compaction, to flush state to disk so nothing is lost.
source_repo: disler/claude-code-hooks-mastery
source_url: https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/pre_compact.py
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
A Claude Code hook from [`disler/claude-code-hooks-mastery`](https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/pre_compact.py). Run before context compaction, to flush state to disk so nothing is lost.

## When to use it
Run before context compaction, to flush state to disk so nothing is lost.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/disler/claude-code-hooks-mastery/raw/main/.claude/hooks/pre_compact.py -o .claude/hooks/pre-compact.py
```

## Notes
Extracted from `.claude/hooks/pre_compact.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: Log pre-compact event to logs directory. Pending verify -> promote.
