---
name: security-analyzer
type: subagents
description: >
  PROACTIVELY USE this agent when you need to perform comprehensive security analysis on code to identify vulnerabilities, potential attack vectors, and compliance issues. This agent MUST BE USED for any security-sensitive code including authentication, authorization, data handling, API endpoints, and user input processing. Examples: <example>Context: User has just implemented a user authentication system and wants to ensure it's secure before deployment. user: 'I've just finished implementing the login and registration functionality. Can you check if there are any security issues?' assistant: 'I'll use the security-analyzer agent to perform a comprehensive security review of your authentication code.' <commentary>Since the user is requesting security analysis of recently written authentication code, use the security-analyzer agent to identify potential vulnerabilities and security best practices.</commentary></example> <example>Context: User is working on a web API that handles sensitive user data and wants proactive security validation. user: 'Here's my new API endpoint for handling payment information' assistant: 'Let me use the security-analyzer agent to examine this payment handling code for security vulnerabilities.' <commentary>Since the user is sharing code that handles sensitive payment data, use the security-analyzer agent to identify potential security risks and compliance issues.</commentary></example>
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/security-analyzer.md
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
`dl-ezo/claude-code-sub-agents` sub-agent `security-analyzer`. PROACTIVELY USE this agent when you need to perform comprehensive security analysis on code to identify vulnerabilities, potential attack vectors, and compliance issues. This agent MUST BE USED for any security-sensitive code including authentication, authorization, data handling, API endpoints, and user input processing. Examples: <example>Context: User has just implemented a user authentication system and wants to ensure it's secure before deployment. user: 'I've just finished implementing the login and registration functionality. Can you check if there are any security issues?' assistant: 'I'll use the security-analyzer agent to perform a comprehensive security review of your authentication code.' <commentary>Since the user is requesting security analysis of recently written authentication code, use the security-analyzer agent to identify potential vulnerabilities and security best practices.</commentary></example> <example>Context: User is working on a web API that handles sensitive user data and wants proactive security validation. user: 'Here's my new API endpoint for handling payment information' assistant: 'Let me use the security-analyzer agent to examine this payment handling code for security vulnerabilities.' <commentary>Since the user is sharing code that handles sensitive payment data, use the security-analyzer agent to identify potential security risks and compliance issues.</commentary></example>

## When to use it
PROACTIVELY USE this agent when you need to perform comprehensive security analysis on code to identify vulnerabilities, potential attack vectors, and compliance issues. This agent MUST BE USED for any security-sensitive code including authentication, authorization, data handling, API endpoints, and user input processing. Examples: <example>Context: User has just implemented a user authentication system and wants to ensure it's secure before deployment. user: 'I've just finished implementing the login and registration functionality. Can you check if there are any security issues?' assistant: 'I'll use the security-analyzer agent to perform a comprehensive security review of your authentication code.' <commentary>Since the user is requesting security analysis of recently written authentication code, use the security-analyzer agent to identify potential vulnerabilities and security best practices.</commentary></example> <example>Context: User is working on a web API that handles sensitive user data and wants proactive security validation. user: 'Here's my new API endpoint for handling payment information' assistant: 'Let me use the security-analyzer agent to examine this payment handling code for security vulnerabilities.' <commentary>Since the user is sharing code that handles sensitive payment data, use the security-analyzer agent to identify potential security risks and compliance issues.</commentary></example>

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/dl-ezo/claude-code-sub-agents/raw/main/security-analyzer.md -o .claude/agents/security-analyzer.md
```

## Notes
Extracted from [`dl-ezo/claude-code-sub-agents`](https://github.com/dl-ezo/claude-code-sub-agents/blob/main/security-analyzer.md). Pending verify -> promote.
