# web/ — the Armory registry website

The Next.js app behind **[armory-murex.vercel.app](https://armory-murex.vercel.app)** — search, browse, the synapse graph, and the per-harness install snippets. (Formerly `site/`.)

- Package: `@armory/web`
- Build: `pnpm --filter @armory/web build` (the `prebuild` step runs `scripts/copy-data.mjs`, which vendors `brain/` + `catalog.json` into this folder so the serverless functions are self-contained).
- Dev: `pnpm --filter @armory/web dev`
- `web/brain/` and `web/catalog.json` are **generated copies** (gitignored) — never hand-edit; they're rebuilt from the repo-root source on every build.

This folder is the website only. The catalog data it renders lives at the repo root (`brain/`, `catalog.json`, the 12 type folders).
