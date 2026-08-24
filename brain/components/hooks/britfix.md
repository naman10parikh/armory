---
name: britfix
type: hooks
description: >
  Claude outputs American spellings by default, which can have an impact on: professional credibility, compliance, documentation, and more. Britfix converts to British English, with a Claude Code hook for automatic conversion as files are written. Context-aware: handles code files intelligently by only converting comments and docstrings, never identifiers or string literals.
source_repo: Talieisin/britfix
source_url: https://github.com/Talieisin/britfix
license: MIT
cli_compat: [claude]
maturity: beta
verified_at: 2026-05-26
related: [cc-notify, claude-code-hook-comms-hcom]
tags: [claude-code, hooks]
stars: 18
---
## What it is
Claude outputs American spellings by default, which can have an impact on: professional credibility, compliance, documentation, and more. Britfix converts to British English, with a Claude Code hook for automatic conversion as files are written. Context-aware: handles code files intelligently by only converting comments and docstrings, never identifiers or string literals.

## When to use it
When working in Claude Code and you need the "Hooks" resource this provides.

## Source
Migrated from the awesome-claude-code resources table (category: Hooks). See https://github.com/Talieisin/britfix. Pending verify -> promote.
