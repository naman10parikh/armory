---
name: claude-pace
type: observability
description: >
  A lightweight Bash + jq statusline for Claude Code that displays rate limit pace delta (burn rate vs. time remaining), 5h/7d usage percentage, context window usage, git branch and diff stats. Compares current consumption rate against time remaining in each rate limit window to indicate whether quota is being used faster or slower than the window allows. Single file with no external dependencies beyond jq.
source_repo: Astro-Han/claude-pace
source_url: https://github.com/Astro-Han/claude-pace
license: MIT
cli_compat: [claude]
maturity: beta
verified_at: 2026-05-26
related: [ccometixline-claude-code-statusline, claude-powerline]
tags: [claude-code, status-lines]
stars: 229
forks: 19
pushed_at: "2026-07-28T06:23:06Z"
---
## What it is
A lightweight Bash + jq statusline for Claude Code that displays rate limit pace delta (burn rate vs. time remaining), 5h/7d usage percentage, context window usage, git branch and diff stats. Compares current consumption rate against time remaining in each rate limit window to indicate whether quota is being used faster or slower than the window allows. Single file with no external dependencies beyond jq.

## When to use it
When working in Claude Code and you need the "Status Lines" resource this provides.

## Source
Migrated from the awesome-claude-code resources table (category: Status Lines). See https://github.com/Astro-Han/claude-pace. Pending verify -> promote.
