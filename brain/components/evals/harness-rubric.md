---
name: harness-rubric
type: evals
description: >
  Use to define what "good" means for a harness before you score it — a per-domain YAML rubric of weighted criteria —
  so eval scores measure the qualities you actually care about, not arbitrary ones.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: [agentbench, golden-tasks, autolab-nightly]
tags: [eval, rubric, criteria, scoring, quality]
---

## What it is
A structured rubric (typically YAML) that encodes the weighted criteria a harness is judged on, tuned per domain —
a design harness, a content harness, and a research harness each value different things. It is the definition of
quality that a benchmark scores against.

## When to use it
Before scoring any harness, and whenever you stand up a new domain harness that needs its own definition of good.
The trigger is "what does a good harness for this domain even look like?"

## How to install / invoke
Author a `rubric.yaml` of weighted criteria for the domain and feed it to the benchmark as the scoring basis. Keep
one rubric per domain harness and a registry that tracks each harness's current score.

## Notes
The rubric is where subjectivity gets pinned down — argue about the criteria once, then let the score be objective.
Pair with golden tasks (the inputs) and a benchmark (the scorer).
