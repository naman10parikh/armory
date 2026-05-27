---
name: senior-code-reviewer
type: subagents
description: >
  Use this agent when you need comprehensive code review from a senior fullstack developer perspective, including analysis of code quality, architecture decisions, security vulnerabilities, performance implications, and adherence to best practices. Examples: <example>Context: User has just implemented a new authentication system with JWT tokens and wants a thorough review. user: 'I just finished implementing JWT authentication for our API. Here's the code...' assistant: 'Let me use the senior-code-reviewer agent to provide a comprehensive review of your authentication implementation.' <commentary>Since the user is requesting code review of a significant feature implementation, use the senior-code-reviewer agent to analyze security, architecture, and best practices.</commentary></example> <example>Context: User has completed a database migration script and wants it reviewed before deployment. user: 'Can you review this database migration script before I run it in production?' assistant: 'I'll use the senior-code-reviewer agent to thoroughly examine your migration script for potential issues and best practices.' <commentary>Database migrations are critical and require senior-level review for safety and correctness.</commentary></example>
source_repo: hesreallyhim/awesome-claude-code-agents
source_url: https://github.com/hesreallyhim/awesome-claude-code-agents/blob/main/agents/senior-code-reviewer.md
license: unknown
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [hrh, subagents]
---
## What it is
`hesreallyhim/awesome-claude-code-agents` sub-agent `senior-code-reviewer`. Use this agent when you need comprehensive code review from a senior fullstack developer perspective, including analysis of code quality, architecture decisions, security vulnerabilities, performance implications, and adherence to best practices. Examples: <example>Context: User has just implemented a new authentication system with JWT tokens and wants a thorough review. user: 'I just finished implementing JWT authentication for our API. Here's the code...' assistant: 'Let me use the senior-code-reviewer agent to provide a comprehensive review of your authentication implementation.' <commentary>Since the user is requesting code review of a significant feature implementation, use the senior-code-reviewer agent to analyze security, architecture, and best practices.</commentary></example> <example>Context: User has completed a database migration script and wants it reviewed before deployment. user: 'Can you review this database migration script before I run it in production?' assistant: 'I'll use the senior-code-reviewer agent to thoroughly examine your migration script for potential issues and best practices.' <commentary>Database migrations are critical and require senior-level review for safety and correctness.</commentary></example>

## When to use it
Use this agent when you need comprehensive code review from a senior fullstack developer perspective, including analysis of code quality, architecture decisions, security vulnerabilities, performance implications, and adherence to best practices. Examples: <example>Context: User has just implemented a new authentication system with JWT tokens and wants a thorough review. user: 'I just finished implementing JWT authentication for our API. Here's the code...' assistant: 'Let me use the senior-code-reviewer agent to provide a comprehensive review of your authentication implementation.' <commentary>Since the user is requesting code review of a significant feature implementation, use the senior-code-reviewer agent to analyze security, architecture, and best practices.</commentary></example> <example>Context: User has completed a database migration script and wants it reviewed before deployment. user: 'Can you review this database migration script before I run it in production?' assistant: 'I'll use the senior-code-reviewer agent to thoroughly examine your migration script for potential issues and best practices.' <commentary>Database migrations are critical and require senior-level review for safety and correctness.</commentary></example>

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/hesreallyhim/awesome-claude-code-agents/raw/main/agents/senior-code-reviewer.md -o .claude/agents/senior-code-reviewer.md
```

## Notes
Extracted from [`hesreallyhim/awesome-claude-code-agents`](https://github.com/hesreallyhim/awesome-claude-code-agents/blob/main/agents/senior-code-reviewer.md). Pending verify -> promote.
