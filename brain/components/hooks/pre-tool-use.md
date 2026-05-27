---
name: pre-tool-use
type: hooks
description: >
  Run before every tool call to inspect, gate, or block the tool input (e.g. veto dangerous shell commands).
source_repo: disler/claude-code-hooks-mastery
source_url: https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/pre_tool_use.py
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
A Claude Code hook from [`disler/claude-code-hooks-mastery`](https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/pre_tool_use.py). Run before every tool call to inspect, gate, or block the tool input (e.g. veto dangerous shell commands).

## When to use it
Run before every tool call to inspect, gate, or block the tool input (e.g. veto dangerous shell commands).

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/disler/claude-code-hooks-mastery/raw/main/.claude/hooks/pre_tool_use.py -o .claude/hooks/pre-tool-use.py
```

## Notes
Extracted from `.claude/hooks/pre_tool_use.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: Comprehensive detection of dangerous rm commands. Matches various forms of rm -rf and similar destructive patterns. Pending verify -> promote.
