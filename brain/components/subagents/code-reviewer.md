---
name: code-reviewer
type: subagents
description: >
  Spawn after writing or changing code to get an independent review — it checks correctness, flags anti-patterns,
  and suggests improvements against the project's conventions, without editing the files itself.
source_repo: naman10parikh/agentswarm
source_url: https://github.com/naman10parikh/agentswarm
license: MIT
cli_compat: [claude]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [architect, security-reviewer, test-writer]
tags: [code-review, quality, review, sub-agent]
---

## What it is
A sub-agent persona that reviews a diff or a set of files for correctness, adherence to project conventions, and
common anti-patterns, returning structured findings. It is a reviewer, not an editor — the parent applies any fixes.

## When to use it
After a worker finishes a change and before it signals done, to catch bugs and style drift that the author missed.
The trigger is "review this before we ship it."

## How to install / invoke
Add the agent definition to `.claude/agents/` and spawn it with the changed file paths or diff. Feed its findings
back to the author worker to fix in place.

## Notes
Most effective when scoped to a specific diff rather than a whole repo. Complements `security-reviewer` (auth/data
risks) and `test-writer` (coverage) for a full pre-merge gate.
