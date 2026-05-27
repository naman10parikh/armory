---
name: azure-iac-exporter
type: subagents
description: >
  Export existing Azure resources to Infrastructure as Code templates via Azure Resource Graph analysis, Azure Resource Manager API calls, and azure-iac-generator integration. Use this skill when the user asks to export, convert, migrate, or extract existing Azure resources to IaC templates (Bicep, ARM Templates, Terraform, Pulumi).
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/devops-infrastructure/azure-iac-exporter.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [devops-infrastructure, subagents]
---
## What it is
Export existing Azure resources to Infrastructure as Code templates via Azure Resource Graph analysis, Azure Resource Manager API calls, and azure-iac-generator integration. Use this skill when the user asks to export, convert, migrate, or extract existing Azure resources to IaC templates (Bicep, ARM Templates, Terraform, Pulumi).

## When to use it
Export existing Azure resources to Infrastructure as Code templates via Azure Resource Graph analysis, Azure Resource Manager API calls, and azure-iac-generator integration. Use this skill when the user asks to export, convert, migrate, or extract existing Azure resources to IaC templates (Bicep, ARM Templates, Terraform, Pulumi).

## How to install / invoke
```bash
# Copy the agent definition into your project's .claude/agents/
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/devops-infrastructure/azure-iac-exporter.md -o .claude/agents/azure-iac-exporter.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/devops-infrastructure/azure-iac-exporter.md) — devops-infrastructure category. Type: subagents. Pending verify -> promote.
