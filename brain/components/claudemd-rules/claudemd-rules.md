---
type: moc
title: CLAUDE.md Rules — category hub
created: 2026-05-26
tags: [moc, claudemd-rules]
---

# claudemd-rules

CLAUDE.md / AGENTS.md rule packs and behavior norms — the always-on instructions an agent loads at session start.
Rules are glob-loaded markdown that override default model behavior: they encode operating discipline (think before
coding, debate before building), quality gates (test before build, QA zero tolerance), and meta-discipline
(one source of truth, extract a rule from every error). Unlike skills, rules are not invoked on demand — they are
the standing constitution the agent obeys on every turn.

## Engrams

- [[karpathy-coding-discipline]] — THE FOUR THINGS (the constitution)
- [[socratic-thinking]] — debate before building
- [[ralph-loop]] — relentless execution until DONE
- [[qa-zero-tolerance]] — test end-to-end as a user before shipping
- [[error-post-mortem]] — extract a rule from every error
- [[test-before-build]] — verify P0 features as a user before new work
- [[batch-operations]] — one message = all related operations
- [[consolidate-never-expand]] — one source of truth per topic
