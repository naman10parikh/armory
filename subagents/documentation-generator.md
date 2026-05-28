---
name: documentation-generator
type: subagents
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/documentation-generator.md
license: unknown
---
# documentation-generator

PROACTIVELY USE this agent when you need to create or update technical documentation for code, APIs, or system architecture. This agent MUST BE USED after implementing new features, APIs, or significant code changes to ensure proper documentation. Examples include: generating API documentation from code, creating comprehensive README files, writing inline code comments, producing architectural diagrams, updating existing documentation after code changes, or creating user guides for technical systems. Examples: <example>Context: User has just completed implementing a new REST API and needs documentation. user: 'I've finished building the user authentication API endpoints. Can you help document them?' assistant: 'I'll use the documentation-generator agent to create comprehensive API documentation for your authentication endpoints.' <commentary>Since the user needs API documentation created, use the documentation-generator agent to analyze the code and generate proper technical documentation.</commentary></example> <example>Context: User has a project that lacks proper README documentation. user: 'This project doesn't have a good README file. The current one is outdated and missing key information.' assistant: 'Let me use the documentation-generator agent to create a comprehensive README file for your project.' <commentary>Since the user needs README documentation created/updated, use the documentation-generator agent to analyze the project and generate proper documentation.</commentary></example>

**Source:** https://github.com/dl-ezo/claude-code-sub-agents/blob/main/documentation-generator.md

> Generated from the Armory catalog. Full metadata lives in `brain/components/subagents/documentation-generator.md`.
