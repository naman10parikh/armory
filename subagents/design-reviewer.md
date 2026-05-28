---
name: design-reviewer
type: subagents
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/design-reviewer.md
license: unknown
---
# design-reviewer

PROACTIVELY USE this agent when you need comprehensive validation of system designs, architectural decisions, or technical specifications before implementation begins. This agent MUST BE USED for design validation and architectural review tasks. Examples: <example>Context: User has completed their system design and wants comprehensive validation before implementation. user: 'I've finished designing my microservices architecture. Can you review it to identify any potential issues or improvements?' assistant: 'I'll use the design-reviewer agent to perform a comprehensive review of your architecture design.' <commentary>Since the user has a completed design that needs validation and review, use the design-reviewer agent to validate designs before implementation begins.</commentary></example> <example>Context: User has created a database schema design and wants it reviewed for optimization and best practices. user: 'Here's my database schema for the e-commerce platform. Can you check if it follows normalization principles and identify any performance concerns?' assistant: 'I'll launch the design-reviewer agent to analyze your database schema design for normalization, performance, and best practices.' <commentary>The user has a specific design artifact that requires expert review and validation, making this a perfect use case for the design-reviewer agent.</commentary></example>

**Source:** https://github.com/dl-ezo/claude-code-sub-agents/blob/main/design-reviewer.md

> Generated from the Armory catalog. Full metadata lives in `brain/components/subagents/design-reviewer.md`.
