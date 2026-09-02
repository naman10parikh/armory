---
name: skillsmith
type: clis-tools
description: >
  Use to author, test, and share agent skills from the command line — scaffold a SKILL.md, validate its structure,
  and package it for reuse, turning a one-off procedure into a portable capability.
source_repo: naman10parikh/skillsmith
source_url: https://github.com/naman10parikh/skillsmith
license: MIT
cli_compat: [claude, codex]
maturity: beta
stars: 0
eval_score: null
verified_at: 2026-05-26
related: [skill-creator, self-improve, claude-harness]
tags: [skills, authoring, cli, sharing, meta]
forks: 0
pushed_at: "2026-06-10T03:24:43Z"
---

## What it is
A CLI for the skills lifecycle. It scaffolds a new skill (trigger description + step procedure + model-tier hints),
validates that a skill is well-formed, and packages skills for sharing across harnesses. It is the command-line
counterpart to the in-agent skill-creator.

## When to use it
When you want to create or maintain skills outside an agent session — building a skill library, validating a batch
of skills, or sharing skills between projects. The trigger is "make this a proper, portable skill."

## How to install / invoke
Install globally and run its create/test commands against a skill folder. It produces the same `SKILL.md` shape an
agent's skill-creator emits, so skills are interchangeable.

## Notes
The CLI form lets skills live in version control and CI, separate from any single agent run. Pair with a
self-improvement loop that proposes new skills from session patterns.
