---
name: code-simplifier
type: subagents
description: >
  Simplifies and refines code for clarity, consistency, and maintainability
  while preserving behavior. Focuses on recently modified code unless
  instructed otherwise.
source_repo: affaan-m/ecc
source_url: https://github.com/affaan-m/ecc/blob/main/agents/code-simplifier.md
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [refactor, simplify, quality]
---

## What it is
ECC sub-agent `code-simplifier`, shipped with a prompt-injection "Prompt Defense Baseline". Simplifies and refines code for clarity, consistency, and maintainability while preserving behavior. Focuses on recently modified code unless instructed otherwise.

## When to use it
Simplifies and refines code for clarity, consistency, and maintainability while preserving behavior. Focuses on recently modified code unless instructed otherwise.

## Source
Extracted from [`affaan-m/ecc`](https://github.com/affaan-m/ecc/blob/main/agents/code-simplifier.md). The source file carries the full system prompt, tool allowlist, and model assignment.
