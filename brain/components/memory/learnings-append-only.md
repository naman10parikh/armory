---
name: learnings-append-only
type: memory
description: >
  Adopt as the discipline for an agent's mistake log — append every lesson with a date and never rewrite history —
  so the agent accumulates hard-won rules and stops repeating the same errors across sessions.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [error-post-mortem, memory-compression, four-layer-memory]
tags: [memory, learnings, append-only, post-mortem, discipline]
forks: 0
pushed_at: "2026-06-10T03:59:01Z"
---

## What it is
A practice for the agent's long-term lessons file: it is append-only. Every error fix and every discovered pattern
is added with a date and a one-line summary; existing entries are never edited or deleted. The result is a durable,
chronological record of what the agent learned the hard way.

## When to use it
After every error post-mortem and whenever a useful pattern emerges. The trigger is "we learned something — write it
down so the next session knows."

## How to install / invoke
Keep a single learnings markdown file at Layer 0 of the memory stack and append to it; route compression to an
archive rather than in-place edits. Load it at session start so the agent boots aware of prior lessons.

## Notes
Append-only is what makes the record trustworthy — you can always compress it later, but you never lose a lesson.
This is the substrate the error-post-mortem rule writes to and the compression routine reads from.
