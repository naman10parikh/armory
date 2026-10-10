---
name: playwright-cli
type: clis-tools
description: >
  CLI for common Playwright actions. Record and generate Playwright code, inspect selectors and take screenshots.
source_repo: microsoft/playwright-cli
source_url: "https://github.com/microsoft/playwright-cli"
license: Apache-2.0
cli_compat: [claude, cursor, codex, opencode, gemini]
maturity: beta
stars: 13888
eval_score: 1
verified_at: 2026-05-28
related: []
tags: [browser, playwright]
forks: 767
pushed_at: "2026-09-28T23:23:12Z"
mentions: 2
---
## What it is
CLI for common Playwright actions. Record and generate Playwright code, inspect selectors and take screenshots. It is its own package, @playwright/cli, separate from the CLI inside @playwright/test.

## When to use it
When an agent or a person needs to drive a browser from the shell: open a page, act on it, take a screenshot or record the actions as Playwright code.

## How to install / invoke
`npm install -g @playwright/cli@latest`, then `playwright-cli --help` (the README: https://github.com/microsoft/playwright-cli)

## Notes
Curated by the Engram browser-tools adapter. Pending verify -> promote.
