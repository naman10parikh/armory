---
name: claude-rules-doctor
type: clis-tools
description: >
  CLI that detects dead `.claude/rules/` files by checking if `paths:` globs actually match files in your repo. Catches silent rule failures where renamed directories or typos in glob patterns cause rules to never apply. Features CI mode (exit 1 on dead rules), JSON output, and verbose mode showing matched files.
source_repo: nulone/claude-rules-doctor
source_url: https://github.com/nulone/claude-rules-doctor
license: MIT
cli_compat: [claude]
maturity: beta
verified_at: 2026-05-26
related: [agnix, auto-claude]
tags: [claude-code, tooling]
---
## What it is
CLI that detects dead `.claude/rules/` files by checking if `paths:` globs actually match files in your repo. Catches silent rule failures where renamed directories or typos in glob patterns cause rules to never apply. Features CI mode (exit 1 on dead rules), JSON output, and verbose mode showing matched files.

## When to use it
When working in Claude Code and you need the "Tooling" resource this provides.

## Source
Migrated from the awesome-claude-code resources table (category: Tooling). See https://github.com/nulone/claude-rules-doctor. Pending verify -> promote.
