---
name: tdd-gate
type: hooks
description: >
  Test-Driven Development enforcement hook. Blocks editing production code files (.cs, .py, .ts, .go, .rs, .rb, .php, .java, .kt, .swift, .dart) unless a corresponding test file exists. Forces the TDD workflow: write tests first, then implement. Automatically skips config files, migrations, DTOs, test files themselves, and infrastructure files. Looks for test files with common naming patterns (MyClassTest.ext, my-class.test.ext, my_class_test.ext, test_my_class.ext). Inspired by pm-workspace's Spec-Driven Development methodology.
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/quality-gates/tdd-gate.json
license: MIT
cli_compat: [claude]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-27
related: []
tags: [quality-gates, hooks]
---
## What it is
Test-Driven Development enforcement hook. Blocks editing production code files (.cs, .py, .ts, .go, .rs, .rb, .php, .java, .kt, .swift, .dart) unless a corresponding test file exists. Forces the TDD workflow: write tests first, then implement. Automatically skips config files, migrations, DTOs, test files themselves, and infrastructure files. Looks for test files with common naming patterns (MyClassTest.ext, my-class.test.ext, my_class_test.ext, test_my_class.ext). Inspired by pm-workspace's Spec-Driven Development methodology.

## When to use it
Test-Driven Development enforcement hook. Blocks editing production code files (.cs, .py, .ts, .go, .rs, .rb, .php, .java, .kt, .swift, .dart) unless a corresponding test file exists. Forces the TDD workflow: write tests first, then implement. Automatically skips config files, migrations, DTOs, test files themselves, and infrastructure files. Looks for test files with common naming patterns (MyClassTest.ext, my-class.test.ext, my_class_test.ext, test_my_class.ext). Inspired by pm-workspace's Spec-Driven Development methodology.

## How to install / invoke
```bash
# Wire this hook script into .claude/settings.json
curl -sL https://raw.githubusercontent.com/davila7/claude-code-templates/main/cli-tool/components/hooks/quality-gates/tdd-gate.json -o .claude/hooks/tdd-gate.json
```

## Notes
Extracted from [`davila7/claude-code-templates`](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/hooks/quality-gates/tdd-gate.json) — quality-gates category. Type: hooks. Pending verify -> promote.
