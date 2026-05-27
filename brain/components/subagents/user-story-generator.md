---
name: user-story-generator
type: subagents
description: >
  PROACTIVELY USE this agent when you need to convert high-level requirements, feature requests, or functional specifications into development-ready user stories following agile methodologies. This agent MUST BE USED for user story creation and agile planning tasks. This includes breaking down complex features into manageable stories, creating acceptance criteria, and planning sprint backlogs. Examples: <example>Context: User has functional requirements and needs them converted to agile user stories. user: 'I need to implement user authentication with email verification and password reset functionality' assistant: 'I'll use the user-story-generator agent to break this down into detailed user stories with acceptance criteria.' <commentary>Since the user has requirements that need to be converted into development-ready user stories, use the user-story-generator agent.</commentary></example> <example>Context: Product manager provides a feature description that needs to be broken into sprint-ready stories. user: 'We need a shopping cart feature that allows users to add items, modify quantities, apply discounts, and checkout' assistant: 'Let me use the user-story-generator agent to create comprehensive user stories for this shopping cart feature with proper acceptance criteria and edge cases.' <commentary>The user has a complex feature that needs to be decomposed into manageable user stories following agile practices.</commentary></example>
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/user-story-generator.md
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
`dl-ezo/claude-code-sub-agents` sub-agent `user-story-generator`. PROACTIVELY USE this agent when you need to convert high-level requirements, feature requests, or functional specifications into development-ready user stories following agile methodologies. This agent MUST BE USED for user story creation and agile planning tasks. This includes breaking down complex features into manageable stories, creating acceptance criteria, and planning sprint backlogs. Examples: <example>Context: User has functional requirements and needs them converted to agile user stories. user: 'I need to implement user authentication with email verification and password reset functionality' assistant: 'I'll use the user-story-generator agent to break this down into detailed user stories with acceptance criteria.' <commentary>Since the user has requirements that need to be converted into development-ready user stories, use the user-story-generator agent.</commentary></example> <example>Context: Product manager provides a feature description that needs to be broken into sprint-ready stories. user: 'We need a shopping cart feature that allows users to add items, modify quantities, apply discounts, and checkout' assistant: 'Let me use the user-story-generator agent to create comprehensive user stories for this shopping cart feature with proper acceptance criteria and edge cases.' <commentary>The user has a complex feature that needs to be decomposed into manageable user stories following agile practices.</commentary></example>

## When to use it
PROACTIVELY USE this agent when you need to convert high-level requirements, feature requests, or functional specifications into development-ready user stories following agile methodologies. This agent MUST BE USED for user story creation and agile planning tasks. This includes breaking down complex features into manageable stories, creating acceptance criteria, and planning sprint backlogs. Examples: <example>Context: User has functional requirements and needs them converted to agile user stories. user: 'I need to implement user authentication with email verification and password reset functionality' assistant: 'I'll use the user-story-generator agent to break this down into detailed user stories with acceptance criteria.' <commentary>Since the user has requirements that need to be converted into development-ready user stories, use the user-story-generator agent.</commentary></example> <example>Context: Product manager provides a feature description that needs to be broken into sprint-ready stories. user: 'We need a shopping cart feature that allows users to add items, modify quantities, apply discounts, and checkout' assistant: 'Let me use the user-story-generator agent to create comprehensive user stories for this shopping cart feature with proper acceptance criteria and edge cases.' <commentary>The user has a complex feature that needs to be decomposed into manageable user stories following agile practices.</commentary></example>

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/dl-ezo/claude-code-sub-agents/raw/main/user-story-generator.md -o .claude/agents/user-story-generator.md
```

## Notes
Extracted from [`dl-ezo/claude-code-sub-agents`](https://github.com/dl-ezo/claude-code-sub-agents/blob/main/user-story-generator.md). Pending verify -> promote.
