---
name: declade-lucairn-sdks
type: mcps
description: >
  Privacy-preserving AI gateway. Sanitises PII (German + English; Microsoft Presidio + custom recognisers) before prompts reach Anthropic / OpenAI / your LLM, then emits a signed cryptographic certificate per call (Ed25519 + RFC 3161 timestamp + Sigstore Rekor anchoring). EU GDPR + AI Act ready. Free tier 500 calls/month, BYOK. Install: `npx -y @lucairn/mcp-server`. Docs: https://lucairn.eu/developer/mcp.
source_repo: Declade/lucairn-sdks
source_url: https://github.com/Declade/lucairn-sdks
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, security]
---
## What it is
Privacy-preserving AI gateway. Sanitises PII (German + English; Microsoft Presidio + custom recognisers) before prompts reach Anthropic / OpenAI / your LLM, then emits a signed cryptographic certificate per call (Ed25519 + RFC 3161 timestamp + Sigstore Rekor anchoring). EU GDPR + AI Act ready. Free tier 500 calls/month, BYOK. Install: `npx -y @lucairn/mcp-server`. Docs: https://lucairn.eu/developer/mcp.

## When to use it
When an agent needs the "Security" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Security). See https://github.com/Declade/lucairn-sdks. Pending verify -> promote.
