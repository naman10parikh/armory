---
name: silent-failure-hunter
type: subagents
description: >
  Review code for silent failures, swallowed errors, bad fallbacks, and
  missing error propagation.
source_repo: affaan-m/ecc
source_url: https://github.com/affaan-m/ecc/blob/main/agents/silent-failure-hunter.md
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [errors, review, reliability]
---

## What it is
ECC sub-agent `silent-failure-hunter`, shipped with a prompt-injection "Prompt Defense Baseline". Review code for silent failures, swallowed errors, bad fallbacks, and missing error propagation.

## When to use it
Review code for silent failures, swallowed errors, bad fallbacks, and missing error propagation.

## Source
Extracted from [`affaan-m/ecc`](https://github.com/affaan-m/ecc/blob/main/agents/silent-failure-hunter.md). The source file carries the full system prompt, tool allowlist, and model assignment.
