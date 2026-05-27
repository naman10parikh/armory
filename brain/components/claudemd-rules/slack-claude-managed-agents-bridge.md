---
name: slack-claude-managed-agents-bridge
type: claudemd-rules
description: >
  Stateless webhook bridge: Slack `app_mention` → CMA session (with routing metadata) → `session.status_idled` webhook → `chat.postMessage` in-thread.
source_repo: anthropics/claude-cookbook
source_url: https://github.com/anthropics/claude-cookbook/blob/main/managed_agents/slack/CLAUDE.md
license: unknown
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [claude-cookbook, claudemd-rules, managed-agents]
---
## What it is
Stateless webhook bridge: Slack `app_mention` → CMA session (with routing metadata) → `session.status_idled` webhook → `chat.postMessage` in-thread.

## When to use it
Stateless webhook bridge: Slack `app_mention` → CMA session (with routing metadata) → `session.status_idled` webhook → `chat.postMessage` in-thread.

## How to install / invoke
```bash
# Download the file into your project
curl -sL https://github.com/anthropics/claude-cookbook/raw/main/managed_agents/slack/CLAUDE.md -o CLAUDE.md
```

## Notes
Extracted from [`anthropics/claude-cookbook`](https://github.com/anthropics/claude-cookbook/blob/main/managed_agents/slack/CLAUDE.md). Merge relevant sections into your project CLAUDE.md or .claude/rules/ to apply these harness conventions. Pending verify -> promote.
