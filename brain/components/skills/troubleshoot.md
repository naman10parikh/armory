---
name: troubleshoot
type: skills
description: >
  Invoke when an agent is stuck on a repeating error to run layered recovery — check the learnings log, then docs,
  then web search, then a research sub-agent, then the browser — instead of retrying the same failing approach.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [error-post-mortem, ralph-loop, research-agent]
tags: [error-recovery, debugging, escalation, resilience]
---

## What it is
A multi-layer error-recovery skill. When an approach fails, it walks an escalation ladder — prior learnings,
official docs (via a docs MCP), web search, a research sub-agent, and finally a real browser used like a human —
rather than failing or retrying the same command. It embodies "there is always a solution."

## When to use it
The moment an agent has hit the same error twice. The hard rule it enforces: never retry the same approach three
times; switch layers instead.

## How to install / invoke
Add to `.claude/skills/` and invoke when blocked. It composes with a docs-search MCP and a research sub-agent; the
final fallback is driving a browser directly.

## Notes
Pairs tightly with `error-post-mortem` — once unblocked, extract the rule so the same error never blocks again.
