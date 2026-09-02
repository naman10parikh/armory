---
name: stackloklabs-oci-registry
type: mcps
description: >
  Integrates with OCI registries to retrieve container image metadata, list repository tags, access manifests and configurations, and perform security analysis with support for multiple authentication methods.
source_repo: stackloklabs/ocireg-mcp
source_url: https://github.com/stackloklabs/ocireg-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 13
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 4
pushed_at: "2026-09-02T01:54:36Z"
---
## What it is
MCP server `OCI Registry`, catalogued on PulseMCP. Integrates with OCI registries to retrieve container image metadata, list repository tags, access manifests and configurations, and perform security analysis with support for multiple authentication methods.

## When to use it
Integrates with OCI registries to retrieve container image metadata, list repository tags, access manifests and configurations, and perform security analysis with support for multiple authentication methods.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/stackloklabs/ocireg-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/stackloklabs-oci-registry). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
