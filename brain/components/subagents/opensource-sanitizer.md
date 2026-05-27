---
name: opensource-sanitizer
type: subagents
description: >
  Verify an open-source fork is fully sanitized before release. Scans for leaked secrets, PII, internal references, and dangerous files using 20+ regex patterns. Generates a PASS/FAIL/PASS-WITH-WARNINGS report. Second stage of the opensource-pipeline skill. Use PROACTIVELY before any public release.
source_repo: affaan-m/ecc
source_url: https://github.com/affaan-m/ecc/blob/main/agents/opensource-sanitizer.md
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: [a11y-architect, build-error-resolver]
tags: [ecc, subagent]
---
## What it is
Verify an open-source fork is fully sanitized before release. Scans for leaked secrets, PII, internal references, and dangerous files using 20+ regex patterns. Generates a PASS/FAIL/PASS-WITH-WARNINGS report. Second stage of the opensource-pipeline skill. Use PROACTIVELY before any public release.

## When to use it
Verify an open-source fork is fully sanitized before release. Scans for leaked secrets, PII, internal references, and dangerous files using 20+ regex patterns. Generates a PASS/FAIL/PASS-WITH-WARNINGS report. Second stage of the opensource-pipeline skill. Use PROACTIVELY before any public release.

## How to install / invoke
Vendored from `affaan-m/ecc` (`subagents`). See the source: https://github.com/affaan-m/ecc/blob/main/agents/opensource-sanitizer.md

## Notes
Ingested from the affaan-m/ecc harness library (MIT). Pending verify → promote.
