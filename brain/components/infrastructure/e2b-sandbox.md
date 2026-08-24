---
name: e2b-sandbox
type: infrastructure
description: >
  Use as the default runtime when an agent must execute untrusted code or commands — Firecracker microVMs with
  ~150ms cold start give each run an isolated, disposable computer.
source_repo: e2b-dev/E2B
source_url: https://github.com/e2b-dev/E2B
license: Apache-2.0
cli_compat: [claude, codex]
maturity: stable
stars: 13531
eval_score: null
verified_at: 2026-05-26
related: [microsandbox, claude-managed-agents-selfhost, browserbase-bb]
tags: [sandbox, runtime, firecracker, microvm, code-execution]
---

## What it is
A managed sandbox built on Firecracker microVMs with very fast (~150ms) cold starts. It gives an agent an isolated,
disposable Linux environment to run code, install packages, and execute shell commands without risk to the host. It
is the default product-runtime for agent code execution.

## When to use it
Whenever an agent generates and runs code, or executes commands you don't fully trust, and you need strong isolation
with low latency. The trigger is "the agent needs its own computer to run this."

## How to install / invoke
Use the E2B CLI plus its SDK to spawn and drive sandboxes from agent code. Keep it as the default; reach for a
self-hosted OSS sandbox only when economics or data residency demand it.

## Notes
Never mask errors inside sandbox commands (no `; exit 0`, no swallowing stderr) — silent failures in a sandbox are
expensive to debug. For high-volume self-hosting, an OSS sandbox can be cheaper past a break-even point.
