---
name: test-before-build
type: claudemd-rules
description: >
  Add to CLAUDE.md to block building new features until existing P0 functionality is tested from the user's
  perspective with documented evidence — the highest-priority rule, overriding velocity.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [qa-zero-tolerance, ralph-loop, playwright-cli]
tags: [testing, quality-gate, prioritization, user-testing]
forks: 0
pushed_at: "2026-06-10T03:59:01Z"
---

## What it is
A priority rule: do NOT develop new features until the features you already built are tested from the user's point
of view with evidence. At every juncture the agent asks — what is the most important P0 functionality, did I test it
like a user, did I capture a screenshot — and if any answer is no, it keeps working on that one thing in a loop.

## When to use it
Whenever an agent is tempted to start feature #2 before feature #1 is user-verified, or to report "N tasks complete"
without clicking a single button. This rule outranks the urge to look busy.

## How to install / invoke
Add the priority rule to `CLAUDE.md` near the top so it visibly outranks feature work. Combine with a browser skill
to actually exercise flows and capture screenshots as the required evidence.

## Notes
Born from a real failure: hundreds of tasks "completed" while the core feature didn't work in most panes. You are
rewarded for impact, not for being busy. "Build passing" ≠ "working product".
