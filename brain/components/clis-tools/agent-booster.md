---
name: agent-booster
type: clis-tools
description: >
  Use to apply deterministic, zero-LLM code transforms — fast, repeatable edits that don't need a model — so an
  agent offloads mechanical changes to a cheap tool instead of spending tokens reasoning through them.
source_repo: naman10parikh/agent-booster
source_url: https://github.com/naman10parikh/agent-booster
license: MIT
cli_compat: [claude, codex, cursor]
maturity: beta
stars: 0
eval_score: null
verified_at: 2026-05-26
related: [batch-operations, claude-harness]
tags: [code-transform, deterministic, zero-llm, tooling, efficiency]
forks: 0
pushed_at: "2026-06-10T03:27:01Z"
---

## What it is
A CLI of zero-LLM code transforms. It performs mechanical, deterministic edits — the kind that are pure functions of
their input — without calling a model. It lets an agent route rote transformations to a fast tool and reserve its
reasoning budget for decisions that actually need it.

## When to use it
When an edit is deterministic and repeatable (a rename pattern, a structural rewrite) and using a model would be
slow, costly, and error-prone. The trigger is "this transform is mechanical — don't reason it, run it."

## How to install / invoke
Install globally and invoke the relevant transform against the target files. Slot it into a worker's pipeline so
deterministic steps are tool calls, not model turns.

## Notes
The principle: when output is a deterministic function of input, prefer a tool (or a generator) over a model. This
is the same logic as preferring idempotent generators over fanning out sub-agents for templated output.
