---
name: architect-reviewer-2
type: subagents
description: >
  Use this agent to review code for architectural consistency and patterns. Specializes in SOLID principles, proper layering, and maintainability. Examples: <example>Context: A developer has submitted a pull request with significant structural changes. user: 'Please review the architecture of this new feature.' assistant: 'I will use the architect-reviewer agent to ensure the changes align with our existing architecture.' <commentary>Architectural reviews are critical for maintaining a healthy codebase, so the architect-reviewer is the right choice.</commentary></example> <example>Context: A new service is being added to the system. user: 'Can you check if this new service is designed correctly?' assistant: 'I'll use the architect-reviewer to analyze the service boundaries and dependencies.' <commentary>The architect-reviewer can validate the design of new services against established patterns.</commentary></example>
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/expert-advisors/architect-review.md
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
Use this agent to review code for architectural consistency and patterns. Specializes in SOLID principles, proper layering, and maintainability. Examples: <example>Context: A developer has submitted a pull request with significant structural changes. user: 'Please review the architecture of this new feature.' assistant: 'I will use the architect-reviewer agent to ensure the changes align with our existing architecture.' <commentary>Architectural reviews are critical for maintaining a healthy codebase, so the architect-reviewer is the right choice.</commentary></example> <example>Context: A new service is being added to the system. user: 'Can you check if this new service is designed correctly?' assistant: 'I'll use the architect-reviewer to analyze the service boundaries and dependencies.' <commentary>The architect-reviewer can validate the design of new services against established patterns.</commentary></example>

## When to use it
Use this agent to review code for architectural consistency and patterns. Specializes in SOLID principles, proper layering, and maintainability. Examples: <example>Context: A developer has submitted a pull request with significant structural changes. user: 'Please review the architecture of this new feature.' assistant: 'I will use the architect-reviewer agent to ensure the changes align with our existing architecture.' <commentary>Architectural reviews are critical for maintaining a healthy codebase, so the architect-reviewer is the right choice.</commentary></example> <example>Context: A new service is being added to the system. user: 'Can you check if this new service is designed correctly?' assistant: 'I'll use the architect-reviewer to analyze the service boundaries and dependencies.' <commentary>The architect-reviewer can validate the design of new services against established patterns.</commentary></example>

## How to install / invoke
```bash
# Copy the agent definition into your project's .claude/agents/
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/expert-advisors/architect-review.md -o .claude/agents/architect-review.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/expert-advisors/architect-review.md) — expert-advisors category. Type: subagents. Pending verify -> promote.
