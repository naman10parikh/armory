---
name: token-budget-advisor
type: skills
description: >
  >- Offers the user an informed choice about how much response depth to consume before answering. Use this skill when the user explicitly wants to control response length, depth, or token budget. TRIGGER when: "token budget", "token count", "token usage", "token limit", "response length", "answer…
source_repo: affaan-m/ecc
source_url: https://github.com/affaan-m/ecc/blob/main/skills/token-budget-advisor/SKILL.md
license: MIT
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: null
eval_score: null
verified_at: 2026-05-26
related: []
tags: [skill]
---
## What it is
>- Offers the user an informed choice about how much response depth to consume before answering. Use this skill when the user explicitly wants to control response length, depth, or token budget. TRIGGER when: "token budget", "token count", "token usage", "token limit", "response length", "answer depth", "short version", "brief answer", "detailed answer", "exhaustive answer", "respuesta corta vs larga", "cuántos tokens", "ahorrar tokens", "responde al 50%", "dame la versión corta", "quiero controlar cuánto usas", or clear variants where the user is explicitly asking to control answer size or depth. DO NOT TRIGGER when: user has already specified a level in the current session (maintain it), the request is clearly a one-word answer, or "token" refers to auth/session/payment tokens rather than response size.

## When to use it
>- Offers the user an informed choice about how much response depth to consume before answering. Use this skill when the user explicitly wants to control response length, depth, or token budget. TRIGGER when: "token budget", "token count", "token usage", "token limit", "response length", "answer depth", "short version", "brief answer", "detailed answer", "exhaustive answer", "respuesta corta vs larga", "cuántos tokens", "ahorrar tokens", "responde al 50%", "dame la versión corta", "quiero controlar cuánto usas", or clear variants where the user is explicitly asking to control answer size or depth. DO NOT TRIGGER when: user has already specified a level in the current session (maintain it), the request is clearly a one-word answer, or "token" refers to auth/session/payment tokens rather than response size.

## How to install / invoke
Vendored from `affaan-m/ecc` (`skills`). See the source: https://github.com/affaan-m/ecc/blob/main/skills/token-budget-advisor/SKILL.md

## Notes
Ingested from the affaan-m/ecc harness library (MIT). Pending verify → promote.
