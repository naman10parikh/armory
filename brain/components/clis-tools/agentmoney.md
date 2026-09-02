---
name: agentmoney
type: clis-tools
description: >
  Use to track and cap what an agent run costs — meter token/compute spend, set budgets, and surface cost as a
  first-class signal so an autonomous agent doesn't quietly burn through its limit.
source_repo: naman10parikh/agentmoney
source_url: https://github.com/naman10parikh/agentmoney
license: MIT
cli_compat: [claude, codex]
maturity: beta
stars: 0
eval_score: null
verified_at: 2026-05-26
related: [agentbench, agentmoney-cost, stripe-agent-toolkit]
tags: [cost, budget, observability, metering, financial-rails]
forks: 0
pushed_at: "2026-06-10T03:44:00Z"
---

## What it is
A CLI for agent cost observability. It meters compute and token spend for an agent run, tracks it against a budget,
and exposes cost as an explicit signal — the financial-rails counterpart to performance metrics. It answers "how
much is this agent spending, and are we within budget?"

## When to use it
For any long-running or overnight agent where unbounded spend is a real risk, and when you want to ration a fixed
budget across a period. The trigger is "watch the cost" or "stay under this budget."

## How to install / invoke
Install globally and run it to meter a session or report spend against a budget. Feed its signal into a routing
policy that downshifts models as the budget tightens.

## Notes
Cost is an observability dimension, not an afterthought. Pairs with a model-routing policy (cheaper models as budget
shrinks) and with payment rails (the agent earning to fund its own spend).
