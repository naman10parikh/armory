---
name: stripe-agent-toolkit
type: infrastructure
description: >
  Use as the payments rail when an agent should earn or spend money in code — create customers, prices, payment
  links, and usage-based billing — the infrastructure behind an agent that funds its own compute.
source_repo: stripe/agent-toolkit
source_url: https://github.com/stripe/agent-toolkit
license: MIT
cli_compat: [claude, codex]
maturity: stable
stars: 1760
eval_score: 1
verified_at: 2026-05-26
related: [stripe-mcp, agentmoney, agentmoney-cost]
tags: [payments, stripe, billing, financial-rails, monetization]
---

## What it is
Stripe's toolkit for agents, available as both an SDK and an MCP. It exposes payment operations as agent-callable
functions — customers, products and prices, payment links, invoices, usage-based billing — so an agent can transact
programmatically. It is the financial-rails infrastructure for self-justifying compute.

## When to use it
When an agent's value should be billable, or when you want the "agent earns to fund its own tokens" loop. The
trigger is "wire up payments" or "let the agent charge for what it does."

## How to install / invoke
Add the SDK as a dependency (or the MCP for tool access) with a restricted Stripe key, and call the billing
operations from the agent's tools/plugins layer.

## Notes
Payments are the highest-trust surface: use a tightly scoped key and gate every money movement behind an explicit
policy — the agent proposes, a guardrail authorizes. Cost-tracking tooling complements this on the spend side.
