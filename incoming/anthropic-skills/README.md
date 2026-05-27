# incoming/anthropic-skills — official Anthropic skills (review queue)

These engram stubs were extracted from **[anthropics/skills](https://github.com/anthropics/skills)**,
Anthropic's official reference repo of Agent Skills — the quality bar for the
Skills spec.

- **Extracted:** 2026-05-26
- **Method:** parsed each `skills/<slug>/SKILL.md` frontmatter (`name` +
  `description`) directly.
- **Status:** PENDING — these are in the `incoming/` review queue. They are NOT
  yet promoted to `brain/components/`. Each needs a verify pass (`source_url`
  resolves, the skill loads) before promotion.

## What was extracted

Every skill in the repo → one engram stub.

| Engram type | Count | Mapped from                  |
| ----------- | ----- | ---------------------------- |
| `skills`    | 17    | `skills/<slug>/SKILL.md`     |

Examples: `pdf`, `docx`, `xlsx`, `pptx`, `mcp-builder`, `webapp-testing`,
`frontend-design`, `skill-creator`, `brand-guidelines`, `canvas-design`,
`algorithmic-art`, `internal-comms`, `doc-coauthoring`, `slack-gif-creator`,
`theme-factory`, `web-artifacts-builder`, `claude-api`.

## Frontmatter notes

Each stub carries `source_repo: anthropics/skills`, a deep `source_url` to the
skill's `SKILL.md` on `main`, `license: Proprietary-Anthropic` (the repo is
governed by Anthropic's terms — see repo `LICENSE.txt`), `cli_compat: [claude]`,
`maturity: stable` (these are official), and `verified_at: 2026-05-26`.

`description` is the skill's own WHEN-to-use line, which already follows the
routing-hint convention.

## Next step

verify → promote. Because these are the official quality bar, they are strong
promotion candidates once `source_url` is confirmed live.
