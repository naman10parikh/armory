---
name: vatnode-vatnode-mcp
type: mcps
description: >
  Official MCP server for **EU VAT validation** via the EU Commission's VIES service + offline VAT rates for 45 European countries. Five tools: `validate_vat_number` (live VIES with company name, address, registration date, and optional consultation number for audit), `get_country_vat_rates`, `list_eu_vat_rates`, `check_vat_format`, `list_supported_countries`. Four of five tools work offline without an API key (data bundled via `eu-vat-rates-data`). Open source MIT, every release signed with npm provenance via GitHub Actions OIDC. Install: `npx -y vatnode-mcp`.
source_repo: vatnode/vatnode-mcp
source_url: https://github.com/vatnode/vatnode-mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, finance-fintech]
---
## What it is
Official MCP server for **EU VAT validation** via the EU Commission's VIES service + offline VAT rates for 45 European countries. Five tools: `validate_vat_number` (live VIES with company name, address, registration date, and optional consultation number for audit), `get_country_vat_rates`, `list_eu_vat_rates`, `check_vat_format`, `list_supported_countries`. Four of five tools work offline without an API key (data bundled via `eu-vat-rates-data`). Open source MIT, every release signed with npm provenance via GitHub Actions OIDC. Install: `npx -y vatnode-mcp`.

## When to use it
When an agent needs the "Finance & Fintech" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Finance & Fintech). See https://github.com/vatnode/vatnode-mcp. Pending verify -> promote.
