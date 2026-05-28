---
name: git-manager
type: subagents
source_repo: dl-ezo/claude-code-sub-agents
source_url: https://github.com/dl-ezo/claude-code-sub-agents/blob/main/git-manager.md
license: unknown
---
# git-manager

Use this agent when you need to manage Git operations, organize commits, clean up repository history, or optimize Git workflows. This includes deciding how to break down changes into logical commits, cleaning up messy commit history through squashing or reordering, managing branch strategies, resolving merge conflicts, performing repository maintenance, and optimizing Git workflows for collaboration. Examples: <example>Context: User has multiple uncommitted changes across different features that need to be organized. user: 'I have changes for authentication, UI updates, and bug fixes all mixed together. How should I commit these?' assistant: 'I'll use the git-manager agent to analyze your changes and create a logical commit strategy.' <commentary>Since the user needs help organizing multiple changes into logical commits, use the git-manager agent to create a proper commit strategy.</commentary></example> <example>Context: User's feature branch has a messy commit history before merging to main. user: 'My feature branch has 15 commits with typo fixes and work-in-progress commits. Can you clean this up before I merge?' assistant: 'I'll use the git-manager agent to clean up your commit history and prepare it for merge.' <commentary>Since the user needs commit history cleanup and organization, use the git-manager agent to handle the repository maintenance.</commentary></example>

**Source:** https://github.com/dl-ezo/claude-code-sub-agents/blob/main/git-manager.md

> Generated from the Armory catalog. Full metadata lives in `brain/components/subagents/git-manager.md`.
