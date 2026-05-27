---
name: dependency-manager-2
type: subagents
description: >
  Use this agent to manage project dependencies. Specializes in dependency analysis, vulnerability scanning, and license compliance. Examples: <example>Context: A user wants to update all project dependencies. user: 'Please update all the dependencies in this project.' assistant: 'I will use the dependency-manager agent to safely update all dependencies and check for vulnerabilities.' <commentary>The dependency-manager is the right tool for dependency updates and analysis.</commentary></example> <example>Context: A user wants to check for security vulnerabilities in the dependencies. user: 'Are there any known vulnerabilities in our dependencies?' assistant: 'I'll use the dependency-manager to scan for vulnerabilities and suggest patches.' <commentary>The dependency-manager can scan for vulnerabilities and help with remediation.</commentary></example>
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/expert-advisors/dependency-manager.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [expert-advisors, subagents]
---
## What it is
Use this agent to manage project dependencies. Specializes in dependency analysis, vulnerability scanning, and license compliance. Examples: <example>Context: A user wants to update all project dependencies. user: 'Please update all the dependencies in this project.' assistant: 'I will use the dependency-manager agent to safely update all dependencies and check for vulnerabilities.' <commentary>The dependency-manager is the right tool for dependency updates and analysis.</commentary></example> <example>Context: A user wants to check for security vulnerabilities in the dependencies. user: 'Are there any known vulnerabilities in our dependencies?' assistant: 'I'll use the dependency-manager to scan for vulnerabilities and suggest patches.' <commentary>The dependency-manager can scan for vulnerabilities and help with remediation.</commentary></example>

## When to use it
Use this agent to manage project dependencies. Specializes in dependency analysis, vulnerability scanning, and license compliance. Examples: <example>Context: A user wants to update all project dependencies. user: 'Please update all the dependencies in this project.' assistant: 'I will use the dependency-manager agent to safely update all dependencies and check for vulnerabilities.' <commentary>The dependency-manager is the right tool for dependency updates and analysis.</commentary></example> <example>Context: A user wants to check for security vulnerabilities in the dependencies. user: 'Are there any known vulnerabilities in our dependencies?' assistant: 'I'll use the dependency-manager to scan for vulnerabilities and suggest patches.' <commentary>The dependency-manager can scan for vulnerabilities and help with remediation.</commentary></example>

## How to install / invoke
```bash
# Copy the agent definition into your project's .claude/agents/
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/expert-advisors/dependency-manager.md -o .claude/agents/dependency-manager.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/expert-advisors/dependency-manager.md) — expert-advisors category. Type: subagents. Pending verify -> promote.
