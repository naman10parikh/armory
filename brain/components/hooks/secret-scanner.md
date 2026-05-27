---
name: secret-scanner
type: hooks
description: >
  Automatically detects hardcoded secrets before git commits. Scans for API keys from 30+ providers (Anthropic: sk-ant-..., OpenAI: sk-..., AWS: AKIA..., Stripe: sk_live_..., Google: AIza..., GitHub: ghp_..., Vercel, Supabase, Hugging Face: hf_..., Replicate: r8_..., Groq: gsk_..., Databricks: dapi..., GitLab, DigitalOcean, npm, PyPI, and more), tokens, passwords, private keys, and database credentials. Blocks commits containing secrets and suggests using environment variables instead.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/security/secret-scanner.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [security, hooks]
---
## What it is
Automatically detects hardcoded secrets before git commits. Scans for API keys from 30+ providers (Anthropic: sk-ant-..., OpenAI: sk-..., AWS: AKIA..., Stripe: sk_live_..., Google: AIza..., GitHub: ghp_..., Vercel, Supabase, Hugging Face: hf_..., Replicate: r8_..., Groq: gsk_..., Databricks: dapi..., GitLab, DigitalOcean, npm, PyPI, and more), tokens, passwords, private keys, and database credentials. Blocks commits containing secrets and suggests using environment variables instead.

## When to use it
Automatically detects hardcoded secrets before git commits. Scans for API keys from 30+ providers (Anthropic: sk-ant-..., OpenAI: sk-..., AWS: AKIA..., Stripe: sk_live_..., Google: AIza..., GitHub: ghp_..., Vercel, Supabase, Hugging Face: hf_..., Replicate: r8_..., Groq: gsk_..., Databricks: dapi..., GitLab, DigitalOcean, npm, PyPI, and more), tokens, passwords, private keys, and database credentials. Blocks commits containing secrets and suggests using environment variables instead.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/security/secret-scanner.json -o .claude/hooks/secret-scanner.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/security/secret-scanner.json) — security category. Type: hooks. Pending verify -> promote.
