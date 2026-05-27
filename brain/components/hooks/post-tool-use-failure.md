---
name: post-tool-use-failure
type: hooks
description: >
  Run when a tool call fails, to capture the error, notify, or trigger recovery.
source_repo: disler/claude-code-hooks-mastery
source_url: https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/post_tool_use_failure.py
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
A Claude Code hook from [`disler/claude-code-hooks-mastery`](https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/post_tool_use_failure.py). Run when a tool call fails, to capture the error, notify, or trigger recovery.

## When to use it
Run when a tool call fails, to capture the error, notify, or trigger recovery.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/disler/claude-code-hooks-mastery/raw/main/.claude/hooks/post_tool_use_failure.py -o .claude/hooks/post-tool-use-failure.py
```

## Notes
Extracted from `.claude/hooks/post_tool_use_failure.py`. See the repo for the settings.json wiring and full implementation. Pending verify -> promote.
