---
name: agent-auditor
type: subagents
description: >
  Spawn to validate an agent's own definition files — it checks the identity/soul, skills, and memory files for
  completeness and correctness against the agent-file-format spec, reporting gaps before the agent ships.
source_repo: naman10parikh/agentswarm
source_url: https://github.com/naman10parikh/agentswarm
license: MIT
cli_compat: [claude]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [harness-review, soul-md-spec, agent-file-format]
tags: [audit, agent-definition, validation, sub-agent, dogfood]
---

## What it is
A sub-agent persona that audits agent definition files. It validates an agent's identity/soul document, its skills,
and its memory bootstrap against the expected agent-file-format, flagging missing sections, malformed files, and
incomplete skills. It is the agent-introspection counterpart to a code reviewer.

## When to use it
Before deploying or registering a new agent, and when refactoring an agent's harness. The trigger is "is this agent
definition complete and well-formed?"

## How to install / invoke
Add the agent definition to `.claude/agents/` and spawn it against an agent directory. Pair with `harness-review`
for a full audit of both the agent files and the surrounding harness.

## Notes
This is dogfooding in action — the agent's own definition is just files, so an agent can audit another agent (or
itself). Validates against the SOUL/MEMORY/skills ordering of the agent-file-format.
