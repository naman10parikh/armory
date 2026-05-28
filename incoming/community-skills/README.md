# incoming/ecc — ECC seed batch (review queue)

These engram stubs were extracted from **[affaan-m/ecc](https://github.com/affaan-m/ecc)**
("Everything Claude Code"), one of the most-starred agent-harness component
libraries on GitHub (~194,705★ at extraction). MIT-licensed.

- **Extracted:** 2026-05-26
- **Source license:** MIT (preserved on every stub)
- **Status:** PENDING — these are in the `incoming/` review queue. They are NOT
  yet promoted to `brain/components/`. Each needs a verify pass (source_url
  resolves, install command works) before promotion.

## What was extracted

A **curated, high-value starter batch** (98 stubs) — not all 2,193 ECC files.
Quality over volume: the most reusable / representative items across types.

| Engram type      | Count | Mapped from ECC                          |
| ---------------- | ----- | ---------------------------------------- |
| `skills`         | 43    | `skills/<name>/SKILL.md`                 |
| `subagents`      | 16    | `agents/<name>.md`                       |
| `workflows`      | 15    | `commands/<name>.md` (slash commands)    |
| `claudemd-rules` | 12    | `rules/<lang>/*.md` (common + py + ts)   |
| `mcps`           | 10    | `.mcp.json` + `mcp-configs/`             |
| `hooks`          | 2     | `hooks/hooks.json` + memory-persistence  |

## Provenance & method

Each stub carries `source_repo: affaan-m/ecc`, a `source_url` deep-link to the
original file on `main`, `license: MIT`, `cli_compat: [claude, codex, cursor,
gemini, opencode]` (ECC is multi-CLI), `maturity: beta`, and
`verified_at: 2026-05-26`. Descriptions were derived from each source file's own
frontmatter `description` (or H1 for rule packs) and normalized to a folded
"WHEN to use it" routing hint. Generated deterministically; no personal paths or
names included (public-safe).

## Next step

Verify → promote to `brain/components/<type>/<slug>.md`.
