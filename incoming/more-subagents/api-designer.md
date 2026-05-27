---
name: api-designer
type: subagents
description: >
  PROACTIVELY USE this agent when you need to design new RESTful APIs, create or update OpenAPI specifications, standardize existing API endpoints, plan API versioning strategies, or ensure consistent API patterns across your application. This agent MUST BE USED for any API design or endpoint creation tasks. Examples: <example>Context: User is building a library management system and needs to design API endpoints for book management. user: 'I need to create API endpoints for managing books in my library system - CRUD operations, search, and filtering' assistant: 'I'll use the api-designer agent to create a comprehensive RESTful API design for your book management system' <commentary>Since the user needs API design for book management, use the api-designer agent to create proper REST endpoints with HTTP methods, status codes, and data structures.</commentary></example> <example>Context: User has inconsistent API patterns across their application and wants to standardize them. user: 'My existing APIs are inconsistent - some use different naming conventions and HTTP status codes. Can you help standardize them?' assistant: 'I'll use the api-designer agent to analyze your current APIs and create a standardized design pattern' <commentary>Since the user needs API standardization, use the api-designer agent to review existing patterns and create consistent API guidelines.</commentary></example>
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/api-designer.md
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
`dl-ezo/claude-code-sub-agents` sub-agent `api-designer`. PROACTIVELY USE this agent when you need to design new RESTful APIs, create or update OpenAPI specifications, standardize existing API endpoints, plan API versioning strategies, or ensure consistent API patterns across your application. This agent MUST BE USED for any API design or endpoint creation tasks. Examples: <example>Context: User is building a library management system and needs to design API endpoints for book management. user: 'I need to create API endpoints for managing books in my library system - CRUD operations, search, and filtering' assistant: 'I'll use the api-designer agent to create a comprehensive RESTful API design for your book management system' <commentary>Since the user needs API design for book management, use the api-designer agent to create proper REST endpoints with HTTP methods, status codes, and data structures.</commentary></example> <example>Context: User has inconsistent API patterns across their application and wants to standardize them. user: 'My existing APIs are inconsistent - some use different naming conventions and HTTP status codes. Can you help standardize them?' assistant: 'I'll use the api-designer agent to analyze your current APIs and create a standardized design pattern' <commentary>Since the user needs API standardization, use the api-designer agent to review existing patterns and create consistent API guidelines.</commentary></example>

## When to use it
PROACTIVELY USE this agent when you need to design new RESTful APIs, create or update OpenAPI specifications, standardize existing API endpoints, plan API versioning strategies, or ensure consistent API patterns across your application. This agent MUST BE USED for any API design or endpoint creation tasks. Examples: <example>Context: User is building a library management system and needs to design API endpoints for book management. user: 'I need to create API endpoints for managing books in my library system - CRUD operations, search, and filtering' assistant: 'I'll use the api-designer agent to create a comprehensive RESTful API design for your book management system' <commentary>Since the user needs API design for book management, use the api-designer agent to create proper REST endpoints with HTTP methods, status codes, and data structures.</commentary></example> <example>Context: User has inconsistent API patterns across their application and wants to standardize them. user: 'My existing APIs are inconsistent - some use different naming conventions and HTTP status codes. Can you help standardize them?' assistant: 'I'll use the api-designer agent to analyze your current APIs and create a standardized design pattern' <commentary>Since the user needs API standardization, use the api-designer agent to review existing patterns and create consistent API guidelines.</commentary></example>

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/dl-ezo/claude-code-sub-agents/raw/main/api-designer.md -o .claude/agents/api-designer.md
```

## Notes
Extracted from [`dl-ezo/claude-code-sub-agents`](https://github.com/dl-ezo/claude-code-sub-agents/blob/main/api-designer.md). Pending verify -> promote.
