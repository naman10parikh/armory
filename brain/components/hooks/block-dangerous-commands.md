---
name: block-dangerous-commands
type: hooks
description: >
  Wire to the PreToolUse(Bash) event to hard-block destructive shell commands before they run — recursive root
  deletes, sudo wipes, unconfirmed force-pushes — so an autonomous agent can't catastrophically damage the system.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [enforce-agentgrid, security-reviewer, post-push-verify]
tags: [hook, pretooluse, safety, guardrail, bash]
forks: 0
pushed_at: "2026-06-10T03:59:01Z"
---

## What it is
A PreToolUse hook matched to Bash that inspects a command before execution and blocks the genuinely dangerous ones —
`rm -rf /`, `sudo rm -rf`, and force-pushes without confirmation — while letting everything else through. It is the
safety floor under an agent with broad shell permissions.

## When to use it
In any setup where the agent runs with permissions largely bypassed for autonomy. The trigger is structural — it
fires before every Bash call and vetoes the catastrophic ones.

## How to install / invoke
Register a command hook on `PreToolUse` with a Bash matcher, pointing at the block script. It returns a block
decision for matched dangerous patterns and allows the rest.

## Notes
Block only the truly destructive set — over-blocking makes an autonomous agent useless. This is the deny-list that
lets you safely grant broad permissions everywhere else.
