---
name: technical-researcher
type: subagents
description: >
  Use this agent when you need to analyze code repositories, technical documentation, implementation details, or evaluate technical solutions. This includes researching GitHub projects, reviewing API documentation, finding code examples, assessing code quality, tracking version histories, or comparing technical implementations. <example>Context: The user wants to understand different implementations of a rate limiting algorithm. user: "I need to implement rate limiting in my API. What are the best approaches?" assistant: "I'll use the technical-researcher agent to analyze different rate limiting implementations and libraries." <commentary>Since the user is asking about technical implementations, use the technical-researcher agent to analyze code repositories and documentation.</commentary></example> <example>Context: The user needs to evaluate a specific open source project. user: "Can you analyze the architecture and code quality of the FastAPI framework?" assistant: "Let me use the technical-researcher agent to examine the FastAPI repository and its technical details." <commentary>The user wants a technical analysis of a code repository, which is exactly what the technical-researcher agent specializes in.</commentary></example>
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/deep-research-team/technical-researcher.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [deep-research-team, subagents]
---
## What it is
Use this agent when you need to analyze code repositories, technical documentation, implementation details, or evaluate technical solutions. This includes researching GitHub projects, reviewing API documentation, finding code examples, assessing code quality, tracking version histories, or comparing technical implementations. <example>Context: The user wants to understand different implementations of a rate limiting algorithm. user: "I need to implement rate limiting in my API. What are the best approaches?" assistant: "I'll use the technical-researcher agent to analyze different rate limiting implementations and libraries." <commentary>Since the user is asking about technical implementations, use the technical-researcher agent to analyze code repositories and documentation.</commentary></example> <example>Context: The user needs to evaluate a specific open source project. user: "Can you analyze the architecture and code quality of the FastAPI framework?" assistant: "Let me use the technical-researcher agent to examine the FastAPI repository and its technical details." <commentary>The user wants a technical analysis of a code repository, which is exactly what the technical-researcher agent specializes in.</commentary></example>

## When to use it
Use this agent when you need to analyze code repositories, technical documentation, implementation details, or evaluate technical solutions. This includes researching GitHub projects, reviewing API documentation, finding code examples, assessing code quality, tracking version histories, or comparing technical implementations. <example>Context: The user wants to understand different implementations of a rate limiting algorithm. user: "I need to implement rate limiting in my API. What are the best approaches?" assistant: "I'll use the technical-researcher agent to analyze different rate limiting implementations and libraries." <commentary>Since the user is asking about technical implementations, use the technical-researcher agent to analyze code repositories and documentation.</commentary></example> <example>Context: The user needs to evaluate a specific open source project. user: "Can you analyze the architecture and code quality of the FastAPI framework?" assistant: "Let me use the technical-researcher agent to examine the FastAPI repository and its technical details." <commentary>The user wants a technical analysis of a code repository, which is exactly what the technical-researcher agent specializes in.</commentary></example>

## How to install / invoke
```bash
# Copy the agent definition into your project's .claude/agents/
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/deep-research-team/technical-researcher.md -o .claude/agents/technical-researcher.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/deep-research-team/technical-researcher.md) — deep-research-team category. Type: subagents. Pending verify -> promote.
