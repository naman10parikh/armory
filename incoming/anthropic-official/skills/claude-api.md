---
name: claude-api
type: skills
description: >
  "Build, debug, and optimize Claude API / Anthropic SDK apps. Apps built with this skill should include prompt caching. Also handles migrating existing Claude API code between Claude model versions (4.5 → 4.6, 4.6 → 4.7, retired-model replacements). TRIGGER when: code imports `anthropic`/`@anthropic-ai/sdk`; user ask…
source_repo: anthropics/skills
source_url: https://github.com/anthropics/skills/blob/main/skills/claude-api/SKILL.md
license: Proprietary-Anthropic
cli_compat: [claude]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: []
tags: [anthropic, official, skill]
---
## What it is
Official `anthropics/skills` skills component — "Build, debug, and optimize Claude API / Anthropic SDK apps. Apps built with this skill should include prompt caching. Also handles migrating existing Claude API code between Claude model versions (4.5 → 4.6, 4.6 → 4.7, retired-model replacements). TRIGGER when: code imports `anthropic`/`@anthropic-ai/sdk`; user asks for the Claude API, Anthropic SDK, or Managed Agents; user adds/modifies/tunes a Claude feature (caching, thinking, compaction, tool use, batch, files, citations, memory) or model (Opus/Sonnet/Haiku) in a file; questions about prompt caching / cache hit rate in an Anthropic SDK project. SKIP: file imports `openai`/other-provider SDK, filename like `*-openai.py`/`*-generic.py`, provider-neutral code, general programming/ML."

## When to use it
"Build, debug, and optimize Claude API / Anthropic SDK apps. Apps built with this skill should include prompt caching. Also handles migrating existing Claude API code between Claude model versions (4.5 → 4.6, 4.6 → 4.7, retired-model replacements). TRIGGER when: code imports `anthropic`/`@anthropic-ai/sdk`; user asks for the Claude API, Anthropic SDK, or Managed Agents; user adds/modifies/tunes a Claude feature (caching, thinking, compaction, tool use, batch, files, citations, memory) or model (Opus/Sonnet/Haiku) in a file; questions about prompt caching / cache hit rate in an Anthropic SDK project. SKIP: file imports `openai`/other-provider SDK, filename like `*-openai.py`/`*-generic.py`, provider-neutral code, general programming/ML."

## How to install / invoke
Official Anthropic skill. See the full `SKILL.md` (plus any bundled scripts/REFERENCE.md) for the runnable implementation: https://github.com/anthropics/skills/blob/main/skills/claude-api/SKILL.md

## Notes
Official Anthropic reference skill — the quality bar for the Skills spec. License: Anthropic terms (source-available; see repo LICENSE/README). Pending verify → promote.
