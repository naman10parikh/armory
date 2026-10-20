---
name: armory-submit
description: Use when you found a useful MCP server, skill, hook, sub-agent, rule, CLI, eval or workflow that Armory does not list yet and want to add it, either from any project with `armory submit` or inside a clone of the Armory repository with a pull request. Do not use to install a component (use the armory skill).
---

# Add a component to Armory

Armory grows by addition: one Markdown file per component, checked by a gate before it enters. Every component
added restocks the registry for every agent that searches it.

## Steps

1. **Check it is missing.** `armory search "<name or job>"`. If a row already covers the same repository, stop:
   one repository, one row.
2. **Write the file** `<slug>.md` with the frontmatter contract in `CONTRIBUTING.md`: `name` (equal to the file
   name, kebab-case), `type` (one of the 12 categories), `description` (when to use it, one sentence),
   `source_repo`, `source_url`, `license`, `cli_compat`, `maturity`, `stars`, `verified_at` (today), `related`,
   `tags`. Then four short sections: what it is, when to use it, how to install it, notes.
3. **Submit it.**
   - From any project: `armory submit --file <slug>.md` validates the frontmatter and copies it into `incoming/`.
   - Inside a clone: put it at `brain/components/<type>/<slug>.md`, then run `node ingest/test-gate.mjs`,
     `pnpm catalog`, `pnpm validate` and `node scripts/lint-catalog.mjs`. All four must pass.
4. **Open a pull request** with the file and the regenerated `catalog.json`. Never hand-edit `catalog.json`.

## Expected output

The path the component landed at (`incoming/<slug>.md` or `brain/components/<type>/<slug>.md`), the gate verdict
(PASS, or the failing field), and the pull request link when you opened one.
