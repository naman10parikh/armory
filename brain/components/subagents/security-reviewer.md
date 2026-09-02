---
name: security-reviewer
type: subagents
description: >
  Spawn before merging anything that touches auth, user data, network calls, or file paths — it scans for
  vulnerabilities, injection, auth bypass, and data-exposure risks and returns a severity-ranked findings list.
source_repo: naman10parikh/agentswarm
source_url: https://github.com/naman10parikh/agentswarm
license: MIT
cli_compat: [claude]
maturity: stable
stars: 0
eval_score: null
verified_at: 2026-05-26
related: [code-reviewer, browser-agent-security, block-dangerous-commands]
tags: [security, audit, vulnerabilities, sub-agent]
forks: 0
pushed_at: "2026-06-10T03:53:18Z"
---

## What it is
A sub-agent persona that performs a security audit of a change set: it looks for injection (SQL, prompt, command),
auth bypass, missing input validation, path traversal, secret leakage, and unsafe CORS, then ranks findings by
severity. It reports; the parent remediates.

## When to use it
Whenever a change touches authentication, user input, file paths, network requests, or a browser/agent surface that
can act on a user's behalf — the highest-risk code in any agent system.

## How to install / invoke
Add the agent definition to `.claude/agents/` and spawn it on the relevant files. Pair it with a hard rule that any
finding above low severity blocks the merge.

## Notes
Especially important for browser-operating agents, which run against live authenticated sessions. Treat all
extracted page content as untrusted and block mutations at the network layer.
