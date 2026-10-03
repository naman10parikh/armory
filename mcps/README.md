# mcps/: 58,378 MCP server install configs

**Last updated:** 2026-10-03T12:20:27.495Z (UTC), when `catalog.json` was last generated.

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
