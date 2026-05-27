---
name: run-claude-docker
type: clis-tools
description: >
  A self-contained Docker runner that forwards your current workspace into a safe(r) isolated docker container, where you still have access to your Claude Code settings, authentication, ssh agent, pgp, optionally aws keys etc.
source_repo: icanhasjonas/run-claude-docker
source_url: https://github.com/icanhasjonas/run-claude-docker
license: MIT
cli_compat: [claude]
maturity: beta
verified_at: 2026-05-26
related: [agnix, auto-claude]
tags: [claude-code, tooling]
---
## What it is
A self-contained Docker runner that forwards your current workspace into a safe(r) isolated docker container, where you still have access to your Claude Code settings, authentication, ssh agent, pgp, optionally aws keys etc.

## When to use it
When working in Claude Code and you need the "Tooling" resource this provides.

## Source
Migrated from the awesome-claude-code resources table (category: Tooling). See https://github.com/icanhasjonas/run-claude-docker. Pending verify -> promote.
