---
name: playwright-cli
type: skills
description: >
  Invoke to test a web UI as a user — navigate, click, fill forms, and capture screenshots — by driving Playwright
  through its CLI from Bash, deliberately avoiding the heavyweight Playwright MCP.
source_repo: naman10parikh/claude-harness
source_url: https://github.com/naman10parikh/claude-harness
license: MIT
cli_compat: [claude]
maturity: stable
stars: 1
eval_score: null
verified_at: 2026-05-26
related: [test-before-build, qa-zero-tolerance, design-systems]
tags: [testing, browser, playwright, e2e, screenshots]
---

## What it is
A browser-testing skill that uses the Playwright command-line interface via shell commands to exercise web flows and
capture screenshots for verification. It exists specifically to give an agent real browser testing without loading
a large MCP into context.

## When to use it
For any UI verification — confirming a fix renders, taking before/after screenshots, walking a user flow end-to-end.
The trigger is "test it like a user and show evidence."

## How to install / invoke
Add to `.claude/skills/` and invoke from Bash (e.g. `npx playwright screenshot --full-page <url> <out.png>`). Use a
consistent viewport so screenshots are comparable across runs.

## Notes
A deliberate token-efficiency choice: the Playwright MCP is banned in the source harness because it costs orders of
magnitude more context than the CLI for the same capability. Skills > MCPs when the CLI suffices.
