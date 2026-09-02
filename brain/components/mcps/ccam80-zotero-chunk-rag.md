---
name: ccam80-zotero-chunk-rag
type: mcps
description: >
  Enables semantic search over Zotero research libraries by extracting and chunking PDF text, embedding with Gemini API, and storing in ChromaDB to find relevant papers, search specific passages with context, and retrieve bibliographic metadata with precise page-level attribution.
source_repo: ccam80/deep-zotero
source_url: https://github.com/ccam80/deep-zotero
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
stars: 9
verified_at: 2026-05-26
related: []
tags: [mcp, pulsemcp]
forks: 3
pushed_at: "2026-07-30T22:33:01Z"
---
## What it is
MCP server `Zotero Chunk RAG`, catalogued on PulseMCP. Enables semantic search over Zotero research libraries by extracting and chunking PDF text, embedding with Gemini API, and storing in ChromaDB to find relevant papers, search specific passages with context, and retrieve bibliographic metadata with precise page-level attribution.

## When to use it
Enables semantic search over Zotero research libraries by extracting and chunking PDF text, embedding with Gemini API, and storing in ChromaDB to find relevant papers, search specific passages with context, and retrieve bibliographic metadata with precise page-level attribution.

## How to install / invoke
See the source for the `mcpServers` config block (command + args). Source: https://github.com/ccam80/deep-zotero

## Notes
Discovered via the PulseMCP registry (https://www.pulsemcp.com/servers/ccam80-zotero-chunk-rag). License not declared in registry metadata — confirm before production use. Pending verify -> promote.
