---
name: read-only-auditor
type: subagents
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/security/read-only-auditor.md
license: MIT
---
# read-only-auditor

Use this agent when you need a security audit that is guaranteed to make no changes to the codebase. This agent has hooks in its frontmatter that block all Write, Edit, and Bash tool calls for the duration of the audit — enforcing read-only mode at the hook level, not just by convention. Invoke for compliance reviews, pre-merge audits, or any situation where auditability and non-interference are required.\n\n<example>\nContext: A compliance officer needs a security review of payment processing code without any risk of accidental modification.\nuser: \"Audit src/payments/ for PCI-DSS compliance issues. Don't touch anything.\"\nassistant: \"I'll run the read-only-auditor on src/payments/. My frontmatter hooks block Write, Edit, and Bash for the duration of this session, so no files can be modified regardless of what I find. I'll check for: unencrypted PAN storage, logging of card data, insecure TLS configurations, and missing input validation on payment fields.\"\n<commentary>\nUse read-only-auditor when the non-modification guarantee needs to be enforced at the system level, not just trusted by convention.\n</commentary>\n</example>

**Source:** https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/security/read-only-auditor.md

> Generated from the Armory catalog. Full metadata lives in `brain/components/subagents/read-only-auditor.md`.
