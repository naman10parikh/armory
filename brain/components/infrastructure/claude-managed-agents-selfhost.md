---
name: claude-managed-agents-selfhost
type: infrastructure
description: >
  Use for enterprise hosted-control agents — the agent loop runs at the provider while execution happens on your own
  infrastructure — when you want a managed control plane but data and code must stay on your machines.
source_repo: anthropics/anthropic-sdk-python
source_url: https://github.com/anthropics/anthropic-sdk-python
license: MIT
cli_compat: [claude]
maturity: beta
stars: 3876
eval_score: null
verified_at: 2026-05-26
related: [e2b-sandbox, microsandbox, mcp-tunnels-cloudflared]
tags: [managed-agents, hosted-control, enterprise, self-hosted-execution, runtime]
forks: 836
pushed_at: "2026-09-01T19:59:24Z"
---

## What it is
A hosted-control runtime pattern: the agent's reasoning loop is managed by the provider, but the actual execution
(tool calls, code, data access) happens on infrastructure you operate. It separates the control plane (managed) from
the data plane (yours) — the enterprise answer to "we want managed orchestration without sending our data out."

## When to use it
For enterprise deployments where a managed agent loop is desirable for reliability and updates, but data residency
and execution must remain on-premises. The trigger is "managed brains, our hands."

## How to install / invoke
Run a worker that polls the provider for work using an environment key, and execute the dispatched actions on your
infra, with the appropriate beta API header set. Pair with tunnels to reach your private MCP servers.

## Notes
This is the hosted-control point on the spectrum between fully managed sandboxes and fully self-hosted ones. Choose
it when control-plane convenience and data-plane ownership both matter. This space moves fast — re-check the
current API surface before committing.
