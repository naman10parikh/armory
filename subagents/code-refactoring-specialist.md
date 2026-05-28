---
name: code-refactoring-specialist
type: subagents
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/code-refactoring-specialist.md
license: unknown
---
# code-refactoring-specialist

PROACTIVELY USE this agent when code needs structural improvements, technical debt reduction, or architectural enhancements. This agent MUST BE USED for code refactoring and architecture improvement tasks. Examples: <example>Context: User has written a large function that handles multiple responsibilities and wants to improve its structure. user: 'I have this 200-line function that handles user authentication, data validation, and database operations. It's getting hard to maintain.' assistant: 'I'll use the code-refactoring-specialist agent to analyze this function and break it down into smaller, more focused components following SOLID principles.' <commentary>The user has identified a code smell (large function with multiple responsibilities) that needs refactoring, so use the code-refactoring-specialist agent.</commentary></example> <example>Context: User mentions their codebase has grown organically and now has duplicate code patterns. user: 'Our codebase has a lot of repeated validation logic scattered across different modules. Can you help clean this up?' assistant: 'I'll use the code-refactoring-specialist agent to identify the duplicate validation patterns and extract them into reusable components.' <commentary>This is a clear case of code duplication (DRY violation) that requires refactoring expertise.</commentary></example> <example>Context: User is working on legacy code that violates SOLID principles. user: 'This class is doing too many things - it handles file I/O, data processing, and email notifications all in one place.' assistant: 'I'll use the code-refactoring-specialist agent to analyze this class and separate its concerns into focused, single-responsibility components.' <commentary>The user has identified a Single Responsibility Principle violation that needs architectural refactoring.</commentary></example>

**Source:** https://github.com/dl-ezo/claude-code-sub-agents/blob/main/code-refactoring-specialist.md

> Generated from the Armory catalog. Full metadata lives in `brain/components/subagents/code-refactoring-specialist.md`.
