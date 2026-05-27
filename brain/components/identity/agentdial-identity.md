---
name: agentdial-identity
type: identity
description: >
  Use to give an agent a universal, addressable runtime identity and channels — a stable handle across surfaces —
  so a fleet of agents can be authenticated, reached, and audited rather than running anonymously.
source_repo: naman10parikh/agentdial
source_url: https://github.com/naman10parikh/agentdial
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: [agentdial, soul-md-spec, agent-file-format]
tags: [identity, channels, protocol, addressing, trust]
---

## What it is
The identity-protocol concept behind a universal agent identity: a stable handle plus the channels through which an
agent is reachable and can act. It is the runtime, addressable counterpart to an agent's static soul/persona files —
the part that makes "which agent did this, and how do I reach it?" answerable.

## When to use it
When agents must be individually identifiable and reachable — multi-agent fleets, agents acting on a user's behalf,
or any system where auditability of agent actions matters. The trigger is "give this agent a real, addressable identity."

## How to install / invoke
Provision the identity and channels via the agent-identity CLI, then reference the identity from the agent's static
files so its runtime handle and its defined persona line up.

## Notes
Identity underpins trust and auditability. Combine the runtime handle here with the `soul-md-spec` static identity
for a complete picture — who the agent is, and how the world addresses it.
