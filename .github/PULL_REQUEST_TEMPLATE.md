<!-- Thanks for gearing up the Armory ⚔️ -->

## What does this PR add?

<!-- A new component? A fix? A new source/crawler? Describe it. -->

## If you're adding component(s)

Each component is one markdown file under `brain/components/<type>/<slug>.md`. Check the boxes:

- [ ] `name` is kebab-case and **equals the filename** (minus `.md`)
- [ ] `type` is one of the 12 categories (`mcps`, `skills`, `hooks`, `subagents`, `identity`, `memory`, `claudemd-rules`, `clis-tools`, `evals`, `observability`, `infrastructure`, `workflows`)
- [ ] `description` is one sentence — **WHEN to use it**, not a feature list
- [ ] `source_url` resolves (the real repo/page)
- [ ] `license` is set (SPDX id, or `unknown`)
- [ ] `verified_at` is today's date
- [ ] No duplicate of an existing component (search first)
- [ ] `related:` links to sibling components where it makes sense (the synapses)

## Verification

- [ ] `node ingest/validate.mjs` passes
- [ ] `node ingest/catalog.mjs` regenerated `catalog.json` (counts are computed, never hand-typed)

> CI re-runs validate + catalog and fails the build if `catalog.json` drifted — so the numbers can't lie.
