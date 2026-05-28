---
name: architect-reviewer-2
type: subagents
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/expert-advisors/architect-review.md
license: MIT
---
# architect-reviewer-2

Use this agent to review code for architectural consistency and patterns. Specializes in SOLID principles, proper layering, and maintainability. Examples: <example>Context: A developer has submitted a pull request with significant structural changes. user: 'Please review the architecture of this new feature.' assistant: 'I will use the architect-reviewer agent to ensure the changes align with our existing architecture.' <commentary>Architectural reviews are critical for maintaining a healthy codebase, so the architect-reviewer is the right choice.</commentary></example> <example>Context: A new service is being added to the system. user: 'Can you check if this new service is designed correctly?' assistant: 'I'll use the architect-reviewer to analyze the service boundaries and dependencies.' <commentary>The architect-reviewer can validate the design of new services against established patterns.</commentary></example>

**Source:** https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/expert-advisors/architect-review.md

> Generated from the Armory catalog. Full metadata lives in `brain/components/subagents/architect-reviewer-2.md`.
