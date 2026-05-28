---
name: test-suite-generator
type: subagents
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/test-suite-generator.md
license: unknown
---
# test-suite-generator

PROACTIVELY USE this agent when you need to create comprehensive test coverage for new or existing code functionality. This agent MUST BE USED after implementing new code, features, or functions to ensure proper test coverage and quality assurance. Examples: <example>Context: User has just implemented a new user authentication service and needs comprehensive test coverage. user: 'I just finished implementing the UserAuthService class with login, logout, and password reset methods. Can you create a full test suite for it?' assistant: 'I'll use the test-suite-generator agent to create comprehensive unit tests, integration tests, and edge case scenarios for your UserAuthService.' <commentary>Since the user needs comprehensive test coverage for new functionality, use the test-suite-generator agent to analyze the code and create appropriate tests.</commentary></example> <example>Context: User notices low test coverage in their existing codebase and wants to improve it. user: 'Our payment processing module only has 40% test coverage. We need to add more tests to cover edge cases and integration scenarios.' assistant: 'I'll use the test-suite-generator agent to analyze your payment processing module and create additional tests to improve coverage.' <commentary>Since the user wants to improve existing test coverage, use the test-suite-generator agent to identify gaps and create comprehensive tests.</commentary></example>

**Source:** https://github.com/dl-ezo/claude-code-sub-agents/blob/main/test-suite-generator.md

> Generated from the Armory catalog. Full metadata lives in `brain/components/subagents/test-suite-generator.md`.
