---
name: autolab-nightly
type: evals
description: >
  Adopt as the nightly loop that improves a harness and proves it — run experiments against the eval rubric, keep
  the changes that raise the score, and track the climb over time, so the harness gets better while you sleep.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: beta
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [agentbench, harness-rubric, golden-tasks, self-improve]
tags: [eval, autolab, nightly, self-improvement, scoring]
---

## What it is
A nightly harness-improvement engine. On a schedule it proposes scaffold changes, scores them against the rubric and
golden tasks, and adopts the ones that raise the score — recording each harness's score over time. It operationalizes
"the harness improves itself," with evals as the gate that keeps it honest.

## When to use it
When you want continuous, accountable harness improvement rather than ad-hoc tweaks. The trigger is "make the harness
self-improving, and prove each step helped."

## How to install / invoke
Run it as a scheduled job (e.g. a nightly CI workflow) that drives the propose → score → adopt cycle against your
rubric and golden tasks, persisting scores to a registry.

## Notes
Self-improvement without scoring is drift; scoring without self-improvement is a static report. This loop is the
union of the two. Pair with a self-improve skill (what to change) and a benchmark (whether it helped).
