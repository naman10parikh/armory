---
name: design-reviewer
type: subagents
description: >
  PROACTIVELY USE this agent when you need comprehensive validation of system designs, architectural decisions, or technical specifications before implementation begins. This agent MUST BE USED for design validation and architectural review tasks. Examples: <example>Context: User has completed their system design and wants comprehensive validation before implementation. user: 'I've finished designing my microservices architecture. Can you review it to identify any potential issues or improvements?' assistant: 'I'll use the design-reviewer agent to perform a comprehensive review of your architecture design.' <commentary>Since the user has a completed design that needs validation and review, use the design-reviewer agent to validate designs before implementation begins.</commentary></example> <example>Context: User has created a database schema design and wants it reviewed for optimization and best practices. user: 'Here's my database schema for the e-commerce platform. Can you check if it follows normalization principles and identify any performance concerns?' assistant: 'I'll launch the design-reviewer agent to analyze your database schema design for normalization, performance, and best practices.' <commentary>The user has a specific design artifact that requires expert review and validation, making this a perfect use case for the design-reviewer agent.</commentary></example>
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/design-reviewer.md
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
`dl-ezo/claude-code-sub-agents` sub-agent `design-reviewer`. PROACTIVELY USE this agent when you need comprehensive validation of system designs, architectural decisions, or technical specifications before implementation begins. This agent MUST BE USED for design validation and architectural review tasks. Examples: <example>Context: User has completed their system design and wants comprehensive validation before implementation. user: 'I've finished designing my microservices architecture. Can you review it to identify any potential issues or improvements?' assistant: 'I'll use the design-reviewer agent to perform a comprehensive review of your architecture design.' <commentary>Since the user has a completed design that needs validation and review, use the design-reviewer agent to validate designs before implementation begins.</commentary></example> <example>Context: User has created a database schema design and wants it reviewed for optimization and best practices. user: 'Here's my database schema for the e-commerce platform. Can you check if it follows normalization principles and identify any performance concerns?' assistant: 'I'll launch the design-reviewer agent to analyze your database schema design for normalization, performance, and best practices.' <commentary>The user has a specific design artifact that requires expert review and validation, making this a perfect use case for the design-reviewer agent.</commentary></example>

## When to use it
PROACTIVELY USE this agent when you need comprehensive validation of system designs, architectural decisions, or technical specifications before implementation begins. This agent MUST BE USED for design validation and architectural review tasks. Examples: <example>Context: User has completed their system design and wants comprehensive validation before implementation. user: 'I've finished designing my microservices architecture. Can you review it to identify any potential issues or improvements?' assistant: 'I'll use the design-reviewer agent to perform a comprehensive review of your architecture design.' <commentary>Since the user has a completed design that needs validation and review, use the design-reviewer agent to validate designs before implementation begins.</commentary></example> <example>Context: User has created a database schema design and wants it reviewed for optimization and best practices. user: 'Here's my database schema for the e-commerce platform. Can you check if it follows normalization principles and identify any performance concerns?' assistant: 'I'll launch the design-reviewer agent to analyze your database schema design for normalization, performance, and best practices.' <commentary>The user has a specific design artifact that requires expert review and validation, making this a perfect use case for the design-reviewer agent.</commentary></example>

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/dl-ezo/claude-code-sub-agents/raw/main/design-reviewer.md -o .claude/agents/design-reviewer.md
```

## Notes
Extracted from [`dl-ezo/claude-code-sub-agents`](https://github.com/dl-ezo/claude-code-sub-agents/blob/main/design-reviewer.md). Pending verify -> promote.
