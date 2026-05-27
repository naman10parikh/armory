---
name: agentbench
type: clis-tools
description: >
  Use to benchmark and score an agent harness — run it against tasks and get a quality score, so you can prove that
  a scaffold change (same model, better harness) actually improved performance.
source_repo: naman10parikh/agentbench
source_url: https://github.com/naman10parikh/agentbench
license: MIT
cli_compat: [claude, codex]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: [agentmoney, harness-rubric, harness-review]
tags: [eval, benchmark, scoring, harness, cli]
---

## What it is
A CLI for harness scoring. It runs an agent harness against a set of tasks and produces a quality score, making
"the harness is better now" a measurable claim rather than a vibe. It is the eval/observer primitive for the harness
itself — the layer that quantifies "same model, different scaffold."

## When to use it
When you change a harness (add rules, swap skills, restructure prompts) and want evidence the change helped — or
regressed. The trigger is "did that harness change actually improve things?"

## How to install / invoke
Install globally and run it against a harness with a task set; read the score it emits. Track scores over time to
see a self-improving harness climb.

## Notes
Scoring is what turns a nightly self-improvement loop from hopeful to accountable. Pair with `harness-review` (find
gaps) and a rubric (define what "good" means) for a complete eval loop.
