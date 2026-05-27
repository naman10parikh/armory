---
name: smart-contract-auditor
type: subagents
description: >
  Use this agent when conducting security audits of smart contracts. Specializes in vulnerability detection, attack vector analysis, and comprehensive security assessments. Examples: <example>Context: User needs to audit a DeFi protocol user: 'Can you audit my yield farming contract for security issues?' assistant: 'I'll use the smart-contract-auditor agent to perform a comprehensive security audit, checking for reentrancy, overflow issues, and economic attacks' <commentary>Security audits require specialized knowledge of attack patterns and vulnerability detection</commentary></example> <example>Context: User found a suspicious transaction user: 'This transaction looks like an exploit, can you analyze it?' assistant: 'I'll use the smart-contract-auditor agent to analyze the transaction and identify the exploit mechanism' <commentary>Exploit analysis requires deep understanding of attack vectors and contract vulnerabilities</commentary></example> <example>Context: User needs pre-deployment security review user: 'My NFT marketplace is ready for deployment, can you check for security issues?' assistant: 'I'll use the smart-contract-auditor agent to conduct a pre-deployment security review with focus on marketplace-specific vulnerabilities' <commentary>Pre-deployment audits require comprehensive security assessment across multiple attack vectors</commentary></example>
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/blockchain-web3/smart-contract-auditor.md
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [blockchain-web3, subagents]
---
## What it is
Use this agent when conducting security audits of smart contracts. Specializes in vulnerability detection, attack vector analysis, and comprehensive security assessments. Examples: <example>Context: User needs to audit a DeFi protocol user: 'Can you audit my yield farming contract for security issues?' assistant: 'I'll use the smart-contract-auditor agent to perform a comprehensive security audit, checking for reentrancy, overflow issues, and economic attacks' <commentary>Security audits require specialized knowledge of attack patterns and vulnerability detection</commentary></example> <example>Context: User found a suspicious transaction user: 'This transaction looks like an exploit, can you analyze it?' assistant: 'I'll use the smart-contract-auditor agent to analyze the transaction and identify the exploit mechanism' <commentary>Exploit analysis requires deep understanding of attack vectors and contract vulnerabilities</commentary></example> <example>Context: User needs pre-deployment security review user: 'My NFT marketplace is ready for deployment, can you check for security issues?' assistant: 'I'll use the smart-contract-auditor agent to conduct a pre-deployment security review with focus on marketplace-specific vulnerabilities' <commentary>Pre-deployment audits require comprehensive security assessment across multiple attack vectors</commentary></example>

## When to use it
Use this agent when conducting security audits of smart contracts. Specializes in vulnerability detection, attack vector analysis, and comprehensive security assessments. Examples: <example>Context: User needs to audit a DeFi protocol user: 'Can you audit my yield farming contract for security issues?' assistant: 'I'll use the smart-contract-auditor agent to perform a comprehensive security audit, checking for reentrancy, overflow issues, and economic attacks' <commentary>Security audits require specialized knowledge of attack patterns and vulnerability detection</commentary></example> <example>Context: User found a suspicious transaction user: 'This transaction looks like an exploit, can you analyze it?' assistant: 'I'll use the smart-contract-auditor agent to analyze the transaction and identify the exploit mechanism' <commentary>Exploit analysis requires deep understanding of attack vectors and contract vulnerabilities</commentary></example> <example>Context: User needs pre-deployment security review user: 'My NFT marketplace is ready for deployment, can you check for security issues?' assistant: 'I'll use the smart-contract-auditor agent to conduct a pre-deployment security review with focus on marketplace-specific vulnerabilities' <commentary>Pre-deployment audits require comprehensive security assessment across multiple attack vectors</commentary></example>

## How to install / invoke
```bash
# Copy the agent definition into your project's .claude/agents/
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/agents/blockchain-web3/smart-contract-auditor.md -o .claude/agents/smart-contract-auditor.md
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/blockchain-web3/smart-contract-auditor.md) — blockchain-web3 category. Type: subagents. Pending verify -> promote.
