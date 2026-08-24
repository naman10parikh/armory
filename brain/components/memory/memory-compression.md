---
name: memory-compression
type: memory
description: >
  Use when a memory log grows too large to be useful — archive old entries and consolidate patterns so recall stays
  fast and the bootstrap context stays small, without losing the history.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [four-layer-memory, learnings-append-only, consolidate-never-expand]
tags: [memory, compression, archival, consolidation, maintenance]
---

## What it is
A memory-maintenance routine. When a learnings log or memory store crosses a size threshold, it archives older
entries and consolidates recurring patterns into fewer, denser notes — keeping recall fast and the always-loaded
bootstrap small. History is moved to an archive, never deleted.

## When to use it
When a memory file has grown past the point where loading or searching it is cheap (e.g. a learnings log over a few
hundred lines). The trigger is "memory is getting bloated — compress it."

## How to install / invoke
Run the compression routine on a schedule or trigger it from a pre-compaction hook when the log exceeds its
threshold. It archives by age and merges duplicate patterns.

## Notes
Compression is consolidation, not loss — old entries go to an archive that's still searchable. Pair with an
append-only learnings discipline so the raw record is always there to compress from.
