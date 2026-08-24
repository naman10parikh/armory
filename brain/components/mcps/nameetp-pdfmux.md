---
name: nameetp-pdfmux
type: mcps
description: >
  PDF extraction router with built-in MCP server. Classifies each page (digital, scanned, tables) and routes to the best backend (PyMuPDF, Docling, OCR, or optional LLM fallback). Per-page confidence scoring flags low-quality pages and auto-reextracts them — prevents silent RAG failures. Zero config: `pip install pdfmux`. MIT licensed.
source_repo: NameetP/pdfmux
source_url: https://github.com/NameetP/pdfmux
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, search-data-extraction]
stars: 82
---
## What it is
PDF extraction router with built-in MCP server. Classifies each page (digital, scanned, tables) and routes to the best backend (PyMuPDF, Docling, OCR, or optional LLM fallback). Per-page confidence scoring flags low-quality pages and auto-reextracts them — prevents silent RAG failures. Zero config: `pip install pdfmux`. MIT licensed.

## When to use it
When an agent needs the "Search & Data Extraction" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Search & Data Extraction). See https://github.com/NameetP/pdfmux. Pending verify -> promote.
