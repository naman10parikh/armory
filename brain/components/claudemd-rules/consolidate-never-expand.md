---
name: consolidate-never-expand
type: claudemd-rules
description: >
  Add to CLAUDE.md to keep one source of truth per topic — weave new information into the existing document, never
  create v2/v3 files or standalone daily reports, and archive (don't delete) superseded content.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [batch-operations, error-post-mortem, four-layer-memory]
tags: [documentation, knowledge-management, single-source-of-truth]
forks: 0
pushed_at: "2026-06-10T03:59:01Z"
---

## What it is
A documentation-hygiene rule: before creating any new file, search for an existing home and update it in place.
Never produce `research-2026-xx.md`, `synthesis.md`, or `architecture-v3.md` for daily intake. Route content by
category to its canonical surface (vision doc, learnings log, rule file, design rules). Archive old content; never delete.

## When to use it
Every time an agent is about to create a new markdown file. The test: "Could I find this if I left for a week and
came back?" If finding it requires checking five similar docs, consolidation has failed.

## How to install / invoke
Add the routing table and the "update in place, no v2/v3" rule to `CLAUDE.md`. Combine with a resource-integration
workflow that dedups before writing.

## Notes
Prevents the slow death of a knowledge base into three files that all explain the same thing. One source of truth
per topic — enhance, restructure, or archive, but do not fork.
