---
name: user-prompt-submit
type: hooks
description: >
  Run when the user submits a prompt, to log it or inject extra context before the model sees it.
source_repo: disler/claude-code-hooks-mastery
source_url: https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/user_prompt_submit.py
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
A Claude Code hook from [`disler/claude-code-hooks-mastery`](https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/hooks/user_prompt_submit.py). Run when the user submits a prompt, to log it or inject extra context before the model sees it.

## When to use it
Run when the user submits a prompt, to log it or inject extra context before the model sees it.

## How to install / invoke
```bash
# wire the script into .claude/settings.json hooks for the matching event
curl -sL https://github.com/disler/claude-code-hooks-mastery/raw/main/.claude/hooks/user_prompt_submit.py -o .claude/hooks/user-prompt-submit.py
```

## Notes
Extracted from `.claude/hooks/user_prompt_submit.py`. See the repo for the settings.json wiring and full implementation.

Source docstring: Log user prompt to logs directory. Pending verify -> promote.
