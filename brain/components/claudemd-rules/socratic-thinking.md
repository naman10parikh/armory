---
name: socratic-thinking
type: claudemd-rules
description: >
  Add to CLAUDE.md to force an agent to debate its own assumptions before building anything non-trivial —
  list assumptions, name failure modes, seek a simpler path, check prior art, then act.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [karpathy-coding-discipline, deep-think, test-before-build]
tags: [reasoning, planning, discipline, second-order-effects]
---

## What it is
A five-gate rule run before every decision: (1) What am I assuming? (2) What could go wrong? (3) Is there a simpler
approach? (4) Have we solved this before? (5) What would a harsh reviewer critique? It makes the agent its own
devil's advocate before it commits to an architecture or writes more than a trivial amount of code.

## When to use it
Apply before choosing an architecture, spawning a worker grid, writing more than ~50 lines, or creating a new file.
Especially valuable when the agent feels certain — certainty without a checked assumption is the failure mode.

## How to install / invoke
Add the five gates to `CLAUDE.md` as a standing rule. For hard decisions, escalate to the `deep-think` skill, which
runs the same debate at greater depth (self-critique, adversarial sub-agent, third-order effects).

## Notes
The single most-repeated cognitive pattern in the source harness. Lightweight as a rule; pairs with `deep-think`
when a decision warrants a full multi-modal debate.
