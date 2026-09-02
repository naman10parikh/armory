---
name: agentbench
type: evals
description: >
  Use to put a number on harness quality — run an agent harness against a task set and get a score — so harness
  changes are validated by evidence, the eval backbone of a self-improving loop.
source_repo: naman10parikh/agentbench
source_url: https://github.com/naman10parikh/agentbench
license: MIT
cli_compat: [claude, codex]
maturity: beta
stars: 0
eval_score: null
verified_at: 2026-05-26
related: [harness-rubric, golden-tasks, autolab-nightly, harness-review]
tags: [eval, benchmark, scoring, harness, metrics]
forks: 0
pushed_at: "2026-06-10T03:29:08Z"
---

## What it is
A benchmarking harness that scores an agent harness against a task set, producing a single comparable quality
number. It is the measurement instrument for the "same model, different scaffold" thesis — the way you prove a
scaffold change moved the needle (e.g. a jump from a poor score to a strong one) rather than just claiming it did.

## When to use it
Whenever you change a harness and need to know if it improved or regressed, and as the scoring step in any automated
self-improvement loop. The trigger is "score this harness."

## How to install / invoke
Run the benchmark CLI against a harness with a defined task set and record the score. Track scores across versions
to watch the harness climb (or catch a regression early).

## Notes
A score is only as good as the rubric and tasks behind it — pair the benchmark with a clear rubric and a stable set
of golden tasks. This is the same tool listed under CLIs; here it is framed as the eval primitive.
