---
type: moc
title: Sub-agents — category hub
created: 2026-05-26
tags: [moc, subagents]
---

# subagents

Specialized agent roles spawned with their own context window to do focused, bounded work — research, review, or
audit — and report back to the parent. The discipline that makes them safe: sub-agents research and plan; the parent
implements. They protect the parent's context window (a research dump never pollutes the main thread) and let an
orchestrator fan out work. Each role here is a reusable persona with a clear charter and an expected output format.

## Components

- [[architect]] — system-design and trade-off review
- [[code-reviewer]] — review changes for correctness and patterns
- [[security-reviewer]] — vulnerability and auth-exposure audit
- [[test-writer]] — generate test suites and edge-case coverage
- [[performance-analyzer]] — profile code and find bottlenecks
- [[research-agent]] — deep background research and synthesis
- [[agent-auditor]] — validate agent definitions and harness files
