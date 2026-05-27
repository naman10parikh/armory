---
name: dependency-manager
type: subagents
description: >
  PROACTIVELY USE this agent when you need to manage project dependencies, resolve version conflicts, identify security vulnerabilities in packages, or optimize dependency configurations. This agent MUST BE USED for any dependency management or package optimization tasks. Examples: <example>Context: User has added new dependencies and wants to ensure they don't conflict with existing ones. user: 'I just added React Router v6 to my project that already uses React 18. Can you check for any conflicts?' assistant: 'I'll use the dependency-manager agent to analyze your package.json and check for potential conflicts between React Router v6 and your existing dependencies.' <commentary>Since the user needs dependency conflict analysis, use the dependency-manager agent to examine the dependency tree and identify potential issues.</commentary></example> <example>Context: User wants to update their project dependencies safely. user: 'My project hasn't been updated in 6 months. Can you help me update the dependencies safely?' assistant: 'I'll use the dependency-manager agent to analyze your current dependencies, identify outdated packages, and create a safe update strategy.' <commentary>Since the user needs dependency updates and safety analysis, use the dependency-manager agent to handle the complex task of version management.</commentary></example>
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/dependency-manager.md
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
`dl-ezo/claude-code-sub-agents` sub-agent `dependency-manager`. PROACTIVELY USE this agent when you need to manage project dependencies, resolve version conflicts, identify security vulnerabilities in packages, or optimize dependency configurations. This agent MUST BE USED for any dependency management or package optimization tasks. Examples: <example>Context: User has added new dependencies and wants to ensure they don't conflict with existing ones. user: 'I just added React Router v6 to my project that already uses React 18. Can you check for any conflicts?' assistant: 'I'll use the dependency-manager agent to analyze your package.json and check for potential conflicts between React Router v6 and your existing dependencies.' <commentary>Since the user needs dependency conflict analysis, use the dependency-manager agent to examine the dependency tree and identify potential issues.</commentary></example> <example>Context: User wants to update their project dependencies safely. user: 'My project hasn't been updated in 6 months. Can you help me update the dependencies safely?' assistant: 'I'll use the dependency-manager agent to analyze your current dependencies, identify outdated packages, and create a safe update strategy.' <commentary>Since the user needs dependency updates and safety analysis, use the dependency-manager agent to handle the complex task of version management.</commentary></example>

## When to use it
PROACTIVELY USE this agent when you need to manage project dependencies, resolve version conflicts, identify security vulnerabilities in packages, or optimize dependency configurations. This agent MUST BE USED for any dependency management or package optimization tasks. Examples: <example>Context: User has added new dependencies and wants to ensure they don't conflict with existing ones. user: 'I just added React Router v6 to my project that already uses React 18. Can you check for any conflicts?' assistant: 'I'll use the dependency-manager agent to analyze your package.json and check for potential conflicts between React Router v6 and your existing dependencies.' <commentary>Since the user needs dependency conflict analysis, use the dependency-manager agent to examine the dependency tree and identify potential issues.</commentary></example> <example>Context: User wants to update their project dependencies safely. user: 'My project hasn't been updated in 6 months. Can you help me update the dependencies safely?' assistant: 'I'll use the dependency-manager agent to analyze your current dependencies, identify outdated packages, and create a safe update strategy.' <commentary>Since the user needs dependency updates and safety analysis, use the dependency-manager agent to handle the complex task of version management.</commentary></example>

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/dl-ezo/claude-code-sub-agents/raw/main/dependency-manager.md -o .claude/agents/dependency-manager.md
```

## Notes
Extracted from [`dl-ezo/claude-code-sub-agents`](https://github.com/dl-ezo/claude-code-sub-agents/blob/main/dependency-manager.md). Pending verify -> promote.
