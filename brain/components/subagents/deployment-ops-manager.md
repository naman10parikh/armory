---
name: deployment-ops-manager
type: subagents
description: >
  PROACTIVELY USE this agent when you need to deploy applications to production environments, set up infrastructure, configure monitoring systems, manage operational aspects of deployed applications, handle scaling decisions, or respond to production incidents. This agent MUST BE USED for production deployment and operational management tasks. This agent specializes in the complete lifecycle of production operations from initial deployment through ongoing maintenance. Examples: <example>Context: The user has completed development and testing of an application and needs to deploy it to production with proper monitoring and operational procedures. user: 'The application is ready for production. Set up the deployment pipeline and monitoring.' assistant: 'I'll use the deployment-ops-manager agent to handle the production deployment setup and establish comprehensive monitoring.' <commentary>Since the user needs production deployment and operational setup, use the deployment-ops-manager agent to handle infrastructure provisioning, deployment automation, and monitoring configuration.</commentary></example> <example>Context: A production application is experiencing performance issues and needs operational intervention. user: 'Our production app is running slow and we need to investigate and scale if necessary.' assistant: 'I'll use the deployment-ops-manager agent to analyze the performance issues and implement scaling solutions.' <commentary>Since this involves production operational management and scaling decisions, use the deployment-ops-manager agent to diagnose and resolve the performance issues.</commentary></example>
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/deployment-ops-manager.md
license: unknown
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [dlezo, subagents]
---
## What it is
`dl-ezo/claude-code-sub-agents` sub-agent `deployment-ops-manager`. PROACTIVELY USE this agent when you need to deploy applications to production environments, set up infrastructure, configure monitoring systems, manage operational aspects of deployed applications, handle scaling decisions, or respond to production incidents. This agent MUST BE USED for production deployment and operational management tasks. This agent specializes in the complete lifecycle of production operations from initial deployment through ongoing maintenance. Examples: <example>Context: The user has completed development and testing of an application and needs to deploy it to production with proper monitoring and operational procedures. user: 'The application is ready for production. Set up the deployment pipeline and monitoring.' assistant: 'I'll use the deployment-ops-manager agent to handle the production deployment setup and establish comprehensive monitoring.' <commentary>Since the user needs production deployment and operational setup, use the deployment-ops-manager agent to handle infrastructure provisioning, deployment automation, and monitoring configuration.</commentary></example> <example>Context: A production application is experiencing performance issues and needs operational intervention. user: 'Our production app is running slow and we need to investigate and scale if necessary.' assistant: 'I'll use the deployment-ops-manager agent to analyze the performance issues and implement scaling solutions.' <commentary>Since this involves production operational management and scaling decisions, use the deployment-ops-manager agent to diagnose and resolve the performance issues.</commentary></example>

## When to use it
PROACTIVELY USE this agent when you need to deploy applications to production environments, set up infrastructure, configure monitoring systems, manage operational aspects of deployed applications, handle scaling decisions, or respond to production incidents. This agent MUST BE USED for production deployment and operational management tasks. This agent specializes in the complete lifecycle of production operations from initial deployment through ongoing maintenance. Examples: <example>Context: The user has completed development and testing of an application and needs to deploy it to production with proper monitoring and operational procedures. user: 'The application is ready for production. Set up the deployment pipeline and monitoring.' assistant: 'I'll use the deployment-ops-manager agent to handle the production deployment setup and establish comprehensive monitoring.' <commentary>Since the user needs production deployment and operational setup, use the deployment-ops-manager agent to handle infrastructure provisioning, deployment automation, and monitoring configuration.</commentary></example> <example>Context: A production application is experiencing performance issues and needs operational intervention. user: 'Our production app is running slow and we need to investigate and scale if necessary.' assistant: 'I'll use the deployment-ops-manager agent to analyze the performance issues and implement scaling solutions.' <commentary>Since this involves production operational management and scaling decisions, use the deployment-ops-manager agent to diagnose and resolve the performance issues.</commentary></example>

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/dl-ezo/claude-code-sub-agents/raw/main/deployment-ops-manager.md -o .claude/agents/deployment-ops-manager.md
```

## Notes
Extracted from [`dl-ezo/claude-code-sub-agents`](https://github.com/dl-ezo/claude-code-sub-agents/blob/main/deployment-ops-manager.md). Pending verify -> promote.
