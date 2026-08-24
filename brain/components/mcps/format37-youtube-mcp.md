---
name: format37-youtube-mcp
type: mcps
description: >
  MCP server that transcribes YouTube videos to text. Uses yt-dlp to download audio and OpenAI's Whisper-1 for more precise transcription than youtube captions. Provide a YouTube URL and get back the full transcript splitted by chunks for long videos.
source_repo: format37/youtube_mcp
source_url: https://github.com/format37/youtube_mcp
license: unknown
cli_compat: [claude, codex, cursor, gemini, opencode]
maturity: beta
verified_at: 2026-05-26
related: []
tags: [mcp, search-data-extraction]
stars: 32
---
## What it is
MCP server that transcribes YouTube videos to text. Uses yt-dlp to download audio and OpenAI's Whisper-1 for more precise transcription than youtube captions. Provide a YouTube URL and get back the full transcript splitted by chunks for long videos.

## When to use it
When an agent needs the "Search & Data Extraction" capability this MCP server exposes.

## Source
Migrated from the awesome-mcp-servers navigation directory (category: Search & Data Extraction). See https://github.com/format37/youtube_mcp. Pending verify -> promote.
