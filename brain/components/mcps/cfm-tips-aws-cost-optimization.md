---
name: cfm-tips-aws-cost-optimization
type: mcps
description: >
  Integrates with AWS Cost Explorer, Compute Optimizer, and CloudWatch to analyze EC2, EBS, RDS, and Lambda resources for cost optimization recommendations including right-sizing, unused volume detection, and pricing calculations with intelligent fallback between premium and basic AWS services.
source_repo: aws-samples/sample-cfm-tips-mcp
source_url: https://github.com/aws-samples/sample-cfm-tips-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 32
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
---
## What it is
MCP server `AWS Cost Optimization Hub`, catalogued on PulseMCP. Integrates with AWS Cost Explorer, Compute Optimizer, and CloudWatch to analyze EC2, EBS, RDS, and Lambda resources for cost optimization recommendations including right-sizing, unused volume detection, and pricing calculations with intelligent fallback between premium and basic AWS services.

## When to use it
Integrates with AWS Cost Explorer, Compute Optimizer, and CloudWatch to analyze EC2, EBS, RDS, and Lambda resources for cost optimization recommendations including right-sizing, unused volume detection, and pricing calculations with intelligent fallback between premium and basic AWS services.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/aws-samples/sample-cfm-tips-mcp

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/cfm-tips-aws-cost-optimization). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
