---
name: batch-operations
type: claudemd-rules
description: >
  Add to CLAUDE.md to make an agent batch all independent operations into a single message (parallel tool calls)
  instead of N sequential round-trips — cutting redundant context reloads and token spend by 50-75%.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [consolidate-never-expand, karpathy-coding-discipline]
tags: [efficiency, tokens, parallelism, cost-optimization]
---

## What it is
A token-efficiency rule: every worker batches related operations into one message. Independent reads, independent
bash commands, multiple sub-agent spawns, and bulk memory writes all go in a single round-trip as parallel tool
calls. Only operations with a true data dependency (B needs A's result) are sequenced.

## When to use it
Any time an agent is about to issue several independent operations one at a time. Each extra message reloads the full
system prompt and context — batching eliminates that tax.

## How to install / invoke
Add the "1 MESSAGE = ALL RELATED OPERATIONS" rule to `CLAUDE.md`. The pattern: message 1 fires all independent
ops in parallel; message 2 processes the combined results.

## Notes
Estimated 50-75% token reduction at scale. Do NOT batch when operation B depends on operation A's output, or when
each result must be checked before continuing.
