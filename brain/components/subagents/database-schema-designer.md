---
name: database-schema-designer
type: subagents
description: >
  PROACTIVELY USE this agent when you need to design database schemas, create migration files, optimize database queries, or ensure data integrity. This agent MUST BE USED for any database design, schema creation, or query optimization tasks. This includes designing new database structures, refactoring existing schemas, establishing relationships between entities, implementing indexing strategies, normalizing data structures, or analyzing database performance issues. Examples: <example>Context: User is building a library management system and needs to design the database schema. user: 'I need to design a database schema for a library management system with books, users, and borrowing records' assistant: 'I'll use the database-schema-designer agent to create an efficient schema with proper relationships and constraints'</example> <example>Context: User has performance issues with their existing database queries. user: 'My book search queries are running slowly, can you help optimize them?' assistant: 'Let me use the database-schema-designer agent to analyze your current schema and optimize the query performance'</example>
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/database-schema-designer.md
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
`dl-ezo/claude-code-sub-agents` sub-agent `database-schema-designer`. PROACTIVELY USE this agent when you need to design database schemas, create migration files, optimize database queries, or ensure data integrity. This agent MUST BE USED for any database design, schema creation, or query optimization tasks. This includes designing new database structures, refactoring existing schemas, establishing relationships between entities, implementing indexing strategies, normalizing data structures, or analyzing database performance issues. Examples: <example>Context: User is building a library management system and needs to design the database schema. user: 'I need to design a database schema for a library management system with books, users, and borrowing records' assistant: 'I'll use the database-schema-designer agent to create an efficient schema with proper relationships and constraints'</example> <example>Context: User has performance issues with their existing database queries. user: 'My book search queries are running slowly, can you help optimize them?' assistant: 'Let me use the database-schema-designer agent to analyze your current schema and optimize the query performance'</example>

## When to use it
PROACTIVELY USE this agent when you need to design database schemas, create migration files, optimize database queries, or ensure data integrity. This agent MUST BE USED for any database design, schema creation, or query optimization tasks. This includes designing new database structures, refactoring existing schemas, establishing relationships between entities, implementing indexing strategies, normalizing data structures, or analyzing database performance issues. Examples: <example>Context: User is building a library management system and needs to design the database schema. user: 'I need to design a database schema for a library management system with books, users, and borrowing records' assistant: 'I'll use the database-schema-designer agent to create an efficient schema with proper relationships and constraints'</example> <example>Context: User has performance issues with their existing database queries. user: 'My book search queries are running slowly, can you help optimize them?' assistant: 'Let me use the database-schema-designer agent to analyze your current schema and optimize the query performance'</example>

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/dl-ezo/claude-code-sub-agents/raw/main/database-schema-designer.md -o .claude/agents/database-schema-designer.md
```

## Notes
Extracted from [`dl-ezo/claude-code-sub-agents`](https://github.com/dl-ezo/claude-code-sub-agents/blob/main/database-schema-designer.md). Pending verify -> promote.
