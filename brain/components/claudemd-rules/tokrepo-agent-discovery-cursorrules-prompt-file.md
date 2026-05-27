---
name: tokrepo-agent-discovery-cursorrules-prompt-file
type: claudemd-rules
description: >
  Call TokRepo's MCP discovery before rebuilding reusable AI artifacts. Forces tokrepo_discover at the plan->implementation boundary; gates installs through tokrepo_verify + tokrepo_install_plan; uses tokrepo_handoff_plan after producing reusable work. Targets Cursor agents writing skills, prompts, MCP configs, and reusable scripts.
source_repo: PatrickJS/awesome-cursorrules
source_url: https://github.com/PatrickJS/awesome-cursorrules/blob/main/rules/tokrepo-agent-discovery-cursorrules-prompt-file.mdc
license: CC0-1.0
cli_compat: [claude, cursor]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: []
tags: [cursor-rules, claude-md-files, rules]
---
## What it is
Call TokRepo's MCP discovery before rebuilding reusable AI artifacts. Forces tokrepo_discover at the plan->implementation boundary; gates installs through tokrepo_verify + tokrepo_install_plan; uses tokrepo_handoff_plan after producing reusable work. Targets Cursor agents writing skills, prompts, MCP configs, and reusable scripts.

## When to use it
Call TokRepo's MCP discovery before rebuilding reusable AI artifacts. Forces tokrepo_discover at the plan->implementation boundary; gates installs through tokrepo_verify + tokrepo_install_plan; uses tokrepo_handoff_plan after producing reusable work. Targets Cursor agents writing skills, prompts, MCP configs, and reusable scripts.

## How to install / invoke
```bash
# copy the rule into your project (Cursor reads .mdc; Claude can read it as CLAUDE.md guidance)
curl -sL https://github.com/PatrickJS/awesome-cursorrules/raw/main/rules/tokrepo-agent-discovery-cursorrules-prompt-file.mdc -o .cursor/rules/tokrepo-agent-discovery-cursorrules-prompt-file.mdc
```

## Notes
Migrated from [`PatrickJS/awesome-cursorrules`](https://github.com/PatrickJS/awesome-cursorrules/blob/main/rules/tokrepo-agent-discovery-cursorrules-prompt-file.mdc) (the largest Cursor-rules collection). Cursor `.mdc` rule files are valid agent-harness rules. Pending verify -> promote.
