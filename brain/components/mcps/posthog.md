---
name: posthog
type: mcps
description: >
  Integrates with PostHog product analytics to query analytics data, manage feature flags, create insights, run experiments, and track errors.
source_repo: posthog/posthog
source_url: https://github.com/posthog/posthog/tree/HEAD/services/mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 34696
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
mentions: 18
---
## What it is
MCP server `PostHog`, catalogued on PulseMCP. Integrates with PostHog product analytics to query analytics data, manage feature flags, create insights, run experiments, and track errors.

## When to use it
Integrates with PostHog product analytics to query analytics data, manage feature flags, create insights, run experiments, and track errors.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/posthog/posthog/tree/HEAD/services/mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/posthog). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
