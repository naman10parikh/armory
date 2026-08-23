---
name: agent-guardrail
type: mcps
description: >
  A runtime gate for coding agents. Blocks the tool calls that wreck a repo (force-push main, rm -rf, secret exfiltration, CI wipe) and lets normal build and commit work through. Machine-checked git-branch core (z3); the rest is high-precision heuristics. Tested on 3,790 real CI commands, 0 false bloc
source_repo: ss1738/agent-guardrail
source_url: https://github.com/ss1738/agent-guardrail
license: unknown
cli_compat: [claude, cursor, codex, opencode, gemini]
maturity: experimental
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [glama, mcp]
---
## What it is
A runtime gate for coding agents. Blocks the tool calls that wreck a repo (force-push main, rm -rf, secret exfiltration, CI wipe) and lets normal build and commit work through. Machine-checked git-branch core (z3); the rest is high-precision heuristics. Tested on 3,790 real CI commands, 0 false bloc

## When to use it
A runtime gate for coding agents. Blocks the tool calls that wreck a repo (force-push main, rm -rf, secret exfiltration, CI wipe) and lets normal build and commit work through. Machine-checked git-branch core (z3); the rest is high-precision heuristics. Tested on 3,790 real CI commands, 0 false bloc

## How to install / invoke
See [Glama](https://glama.ai/mcp/servers/fda5dqbvtj) for the install config.

## Notes
Discovered via the Glama MCP registry (live API). Pending verify -> promote.
