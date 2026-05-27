---
name: error-post-mortem
type: claudemd-rules
description: >
  Add to CLAUDE.md to require a four-question post-mortem after every error fix (what broke, root cause, prevention
  rule, which rule file to update) and to ban retrying the same failing approach three times.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [ralph-loop, consolidate-never-expand, self-improve]
tags: [error-handling, learning, self-improvement, post-mortem]
---

## What it is
A discipline that turns every error into a permanent rule. After any fix, answer four questions: What broke (one
sentence)? Root cause (not the symptom)? What rule prevents recurrence (append it to a learnings log)? Should a rule
file be updated? It also encodes an escalation ladder: try a different approach, then check learnings, then docs,
then web search, then a research sub-agent — never retry the same command three times expecting a different result.

## When to use it
Immediately after fixing any error, however small. The anti-pattern it kills is "fix and move on" — which is how a
codebase repeats the same mistake forever.

## How to install / invoke
Add the four-question template and the escalation ladder to `CLAUDE.md`. Wire it to a self-improvement skill that
extracts the rule into the harness automatically.

## Notes
Bans `; exit 0` and `2>/dev/null` masking, swallowing exceptions, and deleting the thing that errored without
understanding why. Every error is a gift — extract the rule, prevent the repeat.
