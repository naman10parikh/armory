---
name: golden-tasks
type: evals
description: >
  Use as the fixed input set for evaluating an agent — a small bank of representative tasks with known-good
  outcomes — so every harness change is tested against the same bar and regressions are caught immediately.
source_repo: naman10parikh/agentbench
source_url: https://github.com/naman10parikh/agentbench
license: MIT
cli_compat: [claude, codex]
maturity: beta
stars: 0
eval_score: null
verified_at: 2026-05-26
related: [agentbench, harness-rubric, test-writer]
tags: [eval, golden-tasks, regression, benchmark, fixtures]
forks: 0
pushed_at: "2026-06-10T03:29:08Z"
---

## What it is
A curated set of representative tasks with expected outcomes — the fixed inputs an eval runs against. A handful of
well-chosen golden tasks, scored against a threshold (e.g. an F1 gate), acts as an agent's immune system: any change
that breaks them is caught before it ships.

## When to use it
As the standing regression suite for an agent or harness — run after building the core and after every extension.
The trigger is "did this change break anything we already do well?"

## How to install / invoke
Define the task bank with expected outputs and a pass threshold, and run it as the canonical eval after each change.
Keep the set small enough to run cheaply and often.

## Notes
Run the golden tasks as a regression check after every extension, not just once — that is what makes them an immune
system rather than a one-time benchmark. Pair with a rubric for graded quality beyond pass/fail.
