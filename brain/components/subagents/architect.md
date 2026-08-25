---
name: architect
type: subagents
description: >
  Spawn to validate an architecture decision before you build — it pressure-tests the design, surfaces
  second-order effects, and weighs trade-offs, then reports a recommendation without touching code.
source_repo: naman10parikh/agentswarm
source_url: https://github.com/naman10parikh/agentswarm
license: MIT
cli_compat: [claude]
maturity: stable
stars: 0
eval_score: null
verified_at: 2026-05-26
related: [deep-think, code-reviewer, agent-auditor]
tags: [architecture, review, design, sub-agent]
---

## What it is
A sub-agent persona that reviews a proposed system design. It catches second-order effects, names the trade-offs
explicitly, checks the decision against precedent, and returns a clear recommendation. It is research-and-advise
only — it never writes the implementation.

## When to use it
Before committing to a non-trivial architecture, or when a parent agent wants an independent second opinion on a
design without spending its own context window on the analysis.

## How to install / invoke
Add the agent definition to `.claude/agents/` and spawn it with the design question. Run it on the same strong model
as the parent so its reasoning is at full depth.

## Notes
Keep the charter tight: it advises, the parent decides and builds. Pair with the `deep-think` skill when the
decision warrants an adversarial debate as well.
