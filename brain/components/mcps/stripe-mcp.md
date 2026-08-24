---
name: stripe-mcp
type: mcps
description: >
  Use to let an agent operate payments — create customers, prices, payment links, and invoices — the rail that lets
  an agent earn revenue to fund its own compute.
source_repo: stripe/agent-toolkit
source_url: https://github.com/stripe/agent-toolkit
license: MIT
cli_compat: [claude, codex, cursor]
maturity: stable
stars: 1760
eval_score: null
verified_at: 2026-05-26
related: [stripe-agent-toolkit, agentmoney]
tags: [payments, stripe, billing, monetization, financial-rails]
---

## What it is
The MCP surface of the Stripe agent toolkit: it exposes Stripe operations as agent tools — create customers and
products, generate payment links and invoices, and query balances — so an agent can transact programmatically.

## When to use it
When an agent needs to move money or bill for value: the "self-justifying compute" pattern where an agent earns to
pay for the tokens it spends. The trigger is "let the agent charge for this" or "set up billing."

## How to install / invoke
Add `@stripe/mcp` to your MCP config with a restricted Stripe key. The same toolkit ships as an SDK
(`@stripe/agent-toolkit`) for in-code use.

## Notes
Use a tightly scoped, restricted API key — payments are the highest-trust surface. Never execute a money movement
without an explicit policy gate; an agent should propose, a guardrail should authorize.
