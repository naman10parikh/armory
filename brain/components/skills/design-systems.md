---
name: design-systems
type: skills
description: >
  Invoke for any non-trivial UI work to run a discovery-gated design pipeline — brief first, then a depth-first
  build with OKLCH color, serif+sans pairing, asymmetric layouts, and a 12-dimension binary audit before shipping.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [anthropic-frontend-design, playwright-cli, qa-zero-tolerance]
tags: [design, ui, frontend, design-systems, audit]
---

## What it is
A design harness skill that produces world-class UI for any vertical. It gates on a discovery brief, runs a
depth-first design-and-build pipeline, and finishes with a 12-dimension binary audit (each dimension passes or
fails). It encodes anti-AI-look defaults — warm backgrounds over pure black, serif display + sans body pairing,
asymmetric bento layouts, OKLCH color scales, and purposeful micro-interactions.

## When to use it
Before building or beautifying any web UI, page, or component. The trigger is "make this look production-grade, not
AI-generated."

## How to install / invoke
Add to `.claude/skills/` and invoke at the start of a design task. Pair with a browser skill to screenshot and
verify both light and dark modes against the audit.

## Notes
The single highest-impact anti-AI-look change is the serif+sans pairing. The binary audit is the gate — a design is
not done until every dimension passes.
