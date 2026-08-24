---
name: microsandbox
type: infrastructure
description: >
  Use as the OSS self-hosted sandbox when you need to run agent code on your own infra — libkrun-based microVM
  isolation with no per-sandbox vendor cost, the escape hatch from a managed runtime at high volume.
source_repo: microsandbox/microsandbox
source_url: https://github.com/microsandbox/microsandbox
license: Apache-2.0
cli_compat: [claude, codex]
maturity: beta
stars: 7890
eval_score: null
verified_at: 2026-05-26
related: [e2b-sandbox, claude-managed-agents-selfhost]
tags: [sandbox, self-hosted, libkrun, microvm, oss]
---

## What it is
An open-source, self-hostable sandbox using libkrun for microVM-level isolation. It runs agent-generated code on
infrastructure you control, avoiding per-sandbox cloud fees. It is the OSS counterpart to a managed Firecracker
sandbox for teams that want to own the runtime.

## When to use it
When data residency, cost at high volume, or a no-vendor-lock-in requirement rules out a managed sandbox. The
trigger is "we need our own sandbox infra, self-hosted." Past a break-even of roughly thousands of sandbox-hours a
month, self-hosting wins on cost.

## How to install / invoke
Self-host the sandbox per its deployment docs and point the agent's execution layer at it instead of a managed
provider. The code path the agent uses stays largely the same.

## Notes
Trade managed convenience for control and cost. Daytona is a comparable OSS alternative. Below the break-even
volume, a managed sandbox is usually the simpler and cheaper choice.
