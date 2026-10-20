# LEARNINGS.md — Armiger

Corrections that became rules. Append-only: newest last. Each entry says what broke, why, and the rule that
prevents it. Search it with `armory memory-search "<query>"`.

## 2026-10-19 — Memory described commands that were only on a branch

- **What:** `MEMORY.md` described `armory memory-search`, `armory runs`, `armory sandbox-run`, three own skills and
  a catalog-protect hook. On `main` none existed; the memory and run-log modules sat unwired on the branch
  `staged/cli-memory-runlog`.
- **Rule:** a memory line describes `main` only. Work on a branch is written as "on branch X, not merged".
  (CP158 wired the two modules and built the rest, so the lines are now true.)

## 2026-10-19 — A re-vendor would have deleted Armory's own gear

- **What:** `ingest/vendor.mjs` reset `skills/`, `.claude/agents/` and the other drop folders wholesale, so a manual
  re-vendor would delete Armory's own `armory-*` skills and sub-agents.
- **Rule:** Armory's own gear is named `armory-*`, and the reset keeps those entries (`resetVendoredDir`).

## 2026-10-19 — Vendored skills hide their frontmatter

- **What:** about 900 vendored `skills/*/SKILL.md` files begin with the provenance comment
  (`<!-- source: ... -->`) above the YAML frontmatter, so `claude plugin validate` reports "No frontmatter block
  found" and the plugin loads those skills without a name or description.
- **Rule:** open item: write the provenance line below the frontmatter in `ingest/vendor.mjs`, then re-vendor.
