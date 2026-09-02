---
name: gautamrajur-infra-archaeology
type: mcps
description: >
  Tracks AWS resource ownership and creation history by searching CloudTrail logs to identify who created EC2 instances, RDS databases, and S3 buckets with timestamps, creation methods, and source IP addresses.
source_repo: gautamrajur/infra-archaeology-mcp
source_url: https://github.com/gautamrajur/infra-archaeology-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 1
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 0
pushed_at: "2026-01-13T05:52:10Z"
---
## What it is
MCP server `Infrastructure Archaeology`, catalogued on PulseMCP. Tracks AWS resource ownership and creation history by searching CloudTrail logs to identify who created EC2 instances, RDS databases, and S3 buckets with timestamps, creation methods, and source IP addresses.

## When to use it
Tracks AWS resource ownership and creation history by searching CloudTrail logs to identify who created EC2 instances, RDS databases, and S3 buckets with timestamps, creation methods, and source IP addresses.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/gautamrajur/infra-archaeology-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/gautamrajur-infra-archaeology). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
