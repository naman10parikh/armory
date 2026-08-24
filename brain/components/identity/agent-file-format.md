---
name: agent-file-format
type: identity
description: >
  Adopt when defining an agent as a set of files rather than code — a standard layout (soul, skills, memory,
  heartbeat, brand) so any tool can read, audit, and run the agent, and so the agent can introspect itself.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: beta
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [soul-md-spec, agentdial-identity, agent-auditor]
tags: [identity, agent-format, spec, files, dogfood]
---

## What it is
A convention that defines an agent as a directory of files: an identity/soul document, a skills folder (one skill
per file), a memory bootstrap, a heartbeat (scheduled checks), and a brand. Because the agent is just files, it is
portable, version-controllable, auditable, and self-inspectable.

## When to use it
When you want agents to be first-class artifacts — reviewed in PRs, audited by other agents, and run by any
compatible tool — instead of opaque scripts. The trigger is "make this agent a defined, portable thing."

## How to install / invoke
Lay out the agent directory per the format (identity, skills/, memory, heartbeat, brand) and reference the format
constant in code rather than hardcoding a file extension.

## Notes
The dogfooding insight: a harness directory IS an agent directory — the same file layout describes both the builder
and the built. An agent-auditor can validate any agent against this format.
