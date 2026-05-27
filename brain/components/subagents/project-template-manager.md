---
name: project-template-manager
type: subagents
description: >
  PROACTIVELY USE this agent when starting new projects that require comprehensive agent ecosystems deployed quickly, especially for common project patterns like web applications, mobile apps, data platforms, or SaaS systems. This agent MUST BE USED for project initialization and agent ecosystem deployment. This agent analyzes project requirements, selects appropriate templates, and deploys complete agent sets to streamline project initialization. Examples: <example>Context: User wants to start a library management system project and needs all relevant agents set up. user: 'I'm starting a library management web application project. Set up all the agents I'll need.' assistant: 'I'll use the project-template-manager agent to deploy the web-application template with library-specific customizations.' Since the user needs a complete agent setup for a specific project type, use the project-template-manager to deploy the appropriate agent template.</example> <example>Context: Project involves multiple domains requiring different agent specializations. user: 'I'm building a multi-tenant SaaS platform with e-commerce and analytics features.' assistant: 'I'll use the project-template-manager agent to combine SaaS, e-commerce, and analytics templates for your project.' Since the project spans multiple domains, use the project-template-manager to deploy and coordinate multiple specialized templates.</example>
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/project-template-manager.md
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
`dl-ezo/claude-code-sub-agents` sub-agent `project-template-manager`. PROACTIVELY USE this agent when starting new projects that require comprehensive agent ecosystems deployed quickly, especially for common project patterns like web applications, mobile apps, data platforms, or SaaS systems. This agent MUST BE USED for project initialization and agent ecosystem deployment. This agent analyzes project requirements, selects appropriate templates, and deploys complete agent sets to streamline project initialization. Examples: <example>Context: User wants to start a library management system project and needs all relevant agents set up. user: 'I'm starting a library management web application project. Set up all the agents I'll need.' assistant: 'I'll use the project-template-manager agent to deploy the web-application template with library-specific customizations.' Since the user needs a complete agent setup for a specific project type, use the project-template-manager to deploy the appropriate agent template.</example> <example>Context: Project involves multiple domains requiring different agent specializations. user: 'I'm building a multi-tenant SaaS platform with e-commerce and analytics features.' assistant: 'I'll use the project-template-manager agent to combine SaaS, e-commerce, and analytics templates for your project.' Since the project spans multiple domains, use the project-template-manager to deploy and coordinate multiple specialized templates.</example>

## When to use it
PROACTIVELY USE this agent when starting new projects that require comprehensive agent ecosystems deployed quickly, especially for common project patterns like web applications, mobile apps, data platforms, or SaaS systems. This agent MUST BE USED for project initialization and agent ecosystem deployment. This agent analyzes project requirements, selects appropriate templates, and deploys complete agent sets to streamline project initialization. Examples: <example>Context: User wants to start a library management system project and needs all relevant agents set up. user: 'I'm starting a library management web application project. Set up all the agents I'll need.' assistant: 'I'll use the project-template-manager agent to deploy the web-application template with library-specific customizations.' Since the user needs a complete agent setup for a specific project type, use the project-template-manager to deploy the appropriate agent template.</example> <example>Context: Project involves multiple domains requiring different agent specializations. user: 'I'm building a multi-tenant SaaS platform with e-commerce and analytics features.' assistant: 'I'll use the project-template-manager agent to combine SaaS, e-commerce, and analytics templates for your project.' Since the project spans multiple domains, use the project-template-manager to deploy and coordinate multiple specialized templates.</example>

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/dl-ezo/claude-code-sub-agents/raw/main/project-template-manager.md -o .claude/agents/project-template-manager.md
```

## Notes
Extracted from [`dl-ezo/claude-code-sub-agents`](https://github.com/dl-ezo/claude-code-sub-agents/blob/main/project-template-manager.md). Pending verify -> promote.
