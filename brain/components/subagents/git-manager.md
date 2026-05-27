---
name: git-manager
type: subagents
description: >
  Use this agent when you need to manage Git operations, organize commits, clean up repository history, or optimize Git workflows. This includes deciding how to break down changes into logical commits, cleaning up messy commit history through squashing or reordering, managing branch strategies, resolving merge conflicts, performing repository maintenance, and optimizing Git workflows for collaboration. Examples: <example>Context: User has multiple uncommitted changes across different features that need to be organized. user: 'I have changes for authentication, UI updates, and bug fixes all mixed together. How should I commit these?' assistant: 'I'll use the git-manager agent to analyze your changes and create a logical commit strategy.' <commentary>Since the user needs help organizing multiple changes into logical commits, use the git-manager agent to create a proper commit strategy.</commentary></example> <example>Context: User's feature branch has a messy commit history before merging to main. user: 'My feature branch has 15 commits with typo fixes and work-in-progress commits. Can you clean this up before I merge?' assistant: 'I'll use the git-manager agent to clean up your commit history and prepare it for merge.' <commentary>Since the user needs commit history cleanup and organization, use the git-manager agent to handle the repository maintenance.</commentary></example>
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/git-manager.md
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
`dl-ezo/claude-code-sub-agents` sub-agent `git-manager`. Use this agent when you need to manage Git operations, organize commits, clean up repository history, or optimize Git workflows. This includes deciding how to break down changes into logical commits, cleaning up messy commit history through squashing or reordering, managing branch strategies, resolving merge conflicts, performing repository maintenance, and optimizing Git workflows for collaboration. Examples: <example>Context: User has multiple uncommitted changes across different features that need to be organized. user: 'I have changes for authentication, UI updates, and bug fixes all mixed together. How should I commit these?' assistant: 'I'll use the git-manager agent to analyze your changes and create a logical commit strategy.' <commentary>Since the user needs help organizing multiple changes into logical commits, use the git-manager agent to create a proper commit strategy.</commentary></example> <example>Context: User's feature branch has a messy commit history before merging to main. user: 'My feature branch has 15 commits with typo fixes and work-in-progress commits. Can you clean this up before I merge?' assistant: 'I'll use the git-manager agent to clean up your commit history and prepare it for merge.' <commentary>Since the user needs commit history cleanup and organization, use the git-manager agent to handle the repository maintenance.</commentary></example>

## When to use it
Use this agent when you need to manage Git operations, organize commits, clean up repository history, or optimize Git workflows. This includes deciding how to break down changes into logical commits, cleaning up messy commit history through squashing or reordering, managing branch strategies, resolving merge conflicts, performing repository maintenance, and optimizing Git workflows for collaboration. Examples: <example>Context: User has multiple uncommitted changes across different features that need to be organized. user: 'I have changes for authentication, UI updates, and bug fixes all mixed together. How should I commit these?' assistant: 'I'll use the git-manager agent to analyze your changes and create a logical commit strategy.' <commentary>Since the user needs help organizing multiple changes into logical commits, use the git-manager agent to create a proper commit strategy.</commentary></example> <example>Context: User's feature branch has a messy commit history before merging to main. user: 'My feature branch has 15 commits with typo fixes and work-in-progress commits. Can you clean this up before I merge?' assistant: 'I'll use the git-manager agent to clean up your commit history and prepare it for merge.' <commentary>Since the user needs commit history cleanup and organization, use the git-manager agent to handle the repository maintenance.</commentary></example>

## How to install / invoke
```bash
# copy into your project's .claude/agents/
curl -sL https://github.com/dl-ezo/claude-code-sub-agents/raw/main/git-manager.md -o .claude/agents/git-manager.md
```

## Notes
Extracted from [`dl-ezo/claude-code-sub-agents`](https://github.com/dl-ezo/claude-code-sub-agents/blob/main/git-manager.md). Pending verify -> promote.
