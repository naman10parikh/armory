---
name: post-push-verify
type: hooks
description: >
  Wire to the PostToolUse(Bash) event so that after every `git push` the harness automatically verifies production
  actually deployed (curl the live endpoint) — closing the gap between "pushed" and "live and working."
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: [block-dangerous-commands, qa-zero-tolerance, test-before-build]
tags: [hook, posttooluse, deploy, verification, ci-cd]
---

## What it is
A PostToolUse hook matched to Bash. After a `git push`, it checks that the deployment succeeded — typically by
curling the production endpoint for a healthy status — and flags the agent if the deploy didn't land. It enforces
"nothing is done until it's live and verified on prod."

## When to use it
In any project with continuous deployment, where pushing to a branch triggers a deploy that can silently fail. The
trigger is the push itself — the hook fires automatically.

## How to install / invoke
Register a command hook on `PostToolUse` with a Bash matcher, pointing at the verify script that detects a push and
curls the prod URL. Configure it with the endpoint to check.

## Notes
Local-only or "pushed but unverified" work is invisible work. This hook makes deploy verification automatic instead
of a step the agent might skip. Pair with user-level QA on the deployed URL.
