---
name: agentdial
type: clis-tools
description: >
  Use to give an agent a universal identity and reachable channels — a stable handle the agent presents across
  surfaces — when agents need to be addressable and authenticated, not anonymous processes.
source_repo: naman10parikh/agentdial
source_url: https://github.com/naman10parikh/agentdial
license: MIT
cli_compat: [claude, codex]
maturity: beta
stars: 0
eval_score: 1
verified_at: 2026-05-26
related: [agentdial-identity, soul-md-spec, agent-file-format]
tags: [identity, channels, agent-protocol, addressing]
forks: 0
pushed_at: "2026-06-10T03:28:27Z"
---

## What it is
A CLI implementing an agent identity protocol. It gives an agent a universal, stable identity and a set of channels
through which it can be reached and can act — the addressing-and-identity layer for a fleet of agents that need to
be more than anonymous processes.

## When to use it
When agents must be individually identifiable and reachable — multi-agent systems, agents that act on a user's
behalf, or fleets where "which agent did this?" matters. The trigger is "give this agent an identity."

## How to install / invoke
Install globally and use it to provision an identity and channels for an agent. It complements the agent's static
identity files (its SOUL/persona) with a runtime, addressable handle.

## Notes
Identity is the foundation of trust and auditability in a multi-agent system. Pair the runtime identity here with
the static `soul-md-spec` identity files for a complete identity layer.
