# mcps/: 58,411 MCP server install configs

**Last updated:** 2026-11-07T13:55:26.005Z (UTC), when `catalog.json` was last generated.

Each `<slug>.json` is a minimal install config:
```json
{
  "name": "…",
  "description": "…",
  "source_repo": "owner/repo",
  "source_url": "https://…",
  "install": "npx -y <package>   # or git clone …"
}
```

**Full metadata** (description, maturity, tags, cli_compat) → `brain/components/mcps/<slug>.md`

This directory is **generated** by `ingest/surface.mjs`. Do not hand-edit.
Run `node ingest/surface.mjs --apply` to rebuild.
