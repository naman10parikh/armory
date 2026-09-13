---
name: yylo
type: clis-tools
description: >
  Reach for when coding-agent work needs typed task, validation, merge, and release-readiness
  boundaries — each task in a dedicated branch/worktree behind a merge queue that owns risk-based
  review, with receipt-backed repository changes — instead of ad-hoc agent sessions on a shared branch.
source_repo: yylo-dev/yylo
source_url: https://github.com/yylo-dev/yylo
license: MIT
cli_compat: [claude, codex]
maturity: beta
stars: 59
eval_score: null
verified_at: 2026-09-11
related: [claude-squad, crystal, claude-task-master, claude-code-flow]
tags: [orchestration, coding-agents, worktrees, merge-queue, task-management, evidence]
---

## What it is
A command-line orchestrator for coding agents, repeatable workflows, and receipt-backed repository changes (npm `@yylo/cli`; commands `yylo` and `yy` are equivalent). Every task gets a dedicated branch/worktree; the merge queue owns risk-based review (no semantic reviewer at low risk, at most one at normal risk, two sequential at high risk); each change is retained as hash-linked receipts, manifests, and evidence. Ships skills for `.claude/skills` and `.pi/skills`, and orchestrates Pi and Codex subagents.

## When to use it
When parallel coding-agent tasks must land in one repository with real boundaries — a typed lifecycle (`task start → run → status → preflight → finish`), validation gates before merge, risk-scaled review, and immutable evidence — rather than free-form agent edits.

## How to install / invoke
```bash
npm install --global '@yylo/cli@latest'   # Node.js 20.10+
yy init --task "Document the onboarding path" --subagent pi
yy task start <TASK_ID>   # then implement in the returned worktree
yy task preflight <TASK_ID> && yy task finish <TASK_ID>
```

## Notes
MIT, 59★ at verify time, pushed daily since 2026-01. YYLO Ledger (git-native Kanban/task store) and YYLO Benchmark (evaluation/evidence) are independent siblings; `yy ledger` and `yy benchmark` delegate to those separately installed CLIs.
