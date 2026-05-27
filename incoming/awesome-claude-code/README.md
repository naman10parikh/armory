# incoming/awesome-claude-code — awesome-claude-code seed batch (review queue)

These engram stubs were extracted from **[hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)**,
the canonical curated list of Claude Code resources (~45K★ at extraction).

- **Extracted:** 2026-05-26
- **Method:** parsed the repo's `THE_RESOURCES_TABLE.csv` (226 rows, 203 active).
- **Status:** PENDING — these are in the `incoming/` review queue. They are NOT
  yet promoted to `brain/components/`. Each needs a verify pass (`source_url`
  resolves, the linked resource is live) before promotion.

## What was extracted

A **curated, high-value batch** — not all 226 rows. Quality over volume:
GitHub-backed, real-license, substantive-description entries scored and capped
per category. Each list entry → one engram stub pointing at the external
resource (the linked owner/repo, not awesome-claude-code itself).

| Engram type      | Mapped from CSV category                                  |
| ---------------- | --------------------------------------------------------- |
| `workflows`      | Slash-Commands + Workflows & Knowledge Guides + Output Styles |
| `clis-tools`     | Tooling + Alternative Clients                             |
| `claudemd-rules` | CLAUDE.md Files                                           |
| `hooks`          | Hooks                                                     |
| `skills`         | Agent Skills                                              |
| `observability`  | Status Lines (surface session/agent state)               |

(`Official Documentation` rows were skipped — they are docs, not components.)

## Frontmatter notes

Each stub carries `source_repo` (the linked owner/repo when the resource is on
GitHub), a `source_url` deep-link to the actual resource, `license` normalized
to an SPDX id (or `unknown` when the list reports NOT_FOUND / NOASSERTION /
unspecified), `cli_compat: [claude]`, `maturity: beta`, `verified_at:
2026-05-26`, and `tags` derived from the CSV category + sub-category.

`description` is the list's blurb, rewritten as a WHEN-to-use routing hint and
trimmed of markdown links.

## Next step

verify → promote. Move each verified stub to `brain/components/<type>/` and run
the catalog regen. Do not promote unverified.
