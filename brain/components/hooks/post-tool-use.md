---
name: post-tool-use
type: hooks
description: >
  Run after every tool call to log, validate, or react to the tool's result.
source_repo: disler/claude-code-hooks-mastery
source_url: https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/post_tool_use.py
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
A Claude Code hook from [`disler/claude-code-hooks-mastery`](https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/post_tool_use.py). Run after every tool call to log, validate, or react to the tool's result.

## When to use it
Run after every tool call to log, validate, or react to the tool's result.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/disler/claude-code-hooks-mastery/raw/main/.claude/hooks/post_tool_use.py -o .claude/hooks/post-tool-use.py
```

## Notes
Extracted from `.claude/hooks/post_tool_use.py`. See the repo for the settings.json wiring and full implementation. Pending verify -> promote.
