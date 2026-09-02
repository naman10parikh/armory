---
name: ralph-loop
type: claudemd-rules
description: >
  Add to CLAUDE.md to make an agent execute relentlessly until a task is truly DONE — do, self-test, iterate,
  and try lateral approaches when stuck, instead of stopping at "good enough" or asking "should I continue?".
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [test-before-build, qa-zero-tolerance, error-post-mortem]
tags: [autonomy, execution, persistence, overnight]
mentions: null
forks: 0
pushed_at: "2026-06-10T03:59:01Z"
---

## What it is
The "Ralph Wiggum" relentless-execution loop: do the work, self-test the output, iterate if quality is below
investor-grade, and never stop until acceptance criteria are met. If stuck three times on the same approach, switch
tools or angles rather than retrying. If genuinely blocked, signal for help and move to a different task — never go idle.

## When to use it
For any autonomous or overnight task where the agent must keep working without a human in the loop. Pair it with a
quality gate so "never stop" does not become "never test".

## How to install / invoke
Add the loop protocol to `CLAUDE.md` and include a RALPH LOOP section in every worker mission. For recurring
in-session execution, drive it from a loop/cron primitive that re-feeds the same prompt each iteration.

## Notes
Relentlessness without quality gates is dangerous — always combine with `test-before-build` and `qa-zero-tolerance`
so iteration converges on a tested deliverable, not just more output.
