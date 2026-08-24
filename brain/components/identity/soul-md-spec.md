---
name: soul-md-spec
type: identity
description: >
  Use to author an agent's core identity document in a fixed order — identity, then personality, then boundaries —
  so the agent's voice and limits are explicit and stable across sessions.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: beta
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [agent-file-format, agentdial-identity, agent-auditor]
tags: [identity, soul, persona, boundaries, spec]
---

## What it is
The spec for an agent's identity document. It is written in a deliberate order — who the agent is (identity), how it
behaves and speaks (personality), and what it will and won't do (boundaries). Defining boundaries last and
explicitly is what keeps an autonomous agent's behavior predictable.

## When to use it
When standing up a new agent and you need its character and limits pinned down before it acts. The trigger is
"define this agent's identity and guardrails."

## How to install / invoke
Author the identity document following the identity → personality → boundaries ordering and place it at the root of
the agent directory per the agent-file-format. Keep it tight and readable.

## Notes
The ordering matters: identity grounds personality, and boundaries constrain both. Pair with a runtime identity
handle so the agent is both well-defined and addressable.
