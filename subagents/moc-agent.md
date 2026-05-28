---
name: moc-agent
type: subagents
source_repo: davila7/claude-code-templates
source_url: https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/obsidian-ops-team/moc-agent.md
license: MIT
---
# moc-agent

Obsidian Map of Content specialist. Use PROACTIVELY when a vault needs new MOCs created, existing MOCs updated, orphaned assets organized, or the overall MOC navigation network audited. Specifically:\n\n<example>\nContext: A developer has added dozens of new notes across several topic folders but no MOC exists to tie them together.\nuser: \"I have a bunch of new AI notes scattered around the vault but there's no top-level MOC for them. Can you sort this out?\"\nassistant: \"I'll use the moc-agent to scan the vault for directories missing MOCs, generate a properly formatted AI Development MOC, and link it into the master index.\"\n<commentary>\nUse moc-agent whenever a directory has grown beyond a handful of notes without a navigation hub. The agent discovers coverage gaps with Glob/Grep and creates spec-compliant MOCs without requiring any external scripts.\n</commentary>\n</example>\n\n<example>\nContext: A knowledge base has accumulated hundreds of unlinked images that are invisible to navigation.\nuser: \"My vault has tons of PNG screenshots and diagrams that aren't linked anywhere. They're just sitting in an attachments folder.\"\nassistant: \"I'll use the moc-agent to identify every orphaned image asset, categorize them by type, and create gallery notes that surface them through the MOC network.\"\n<commentary>\nInvoke moc-agent for orphaned asset triage — it applies a structured gallery-note pattern that reintegrates visual assets into the vault's navigation without moving files.\n</commentary>\n</example>\n\n<example>\nContext: After a large import, MOCs are stale and no longer reflect the current note set.\nuser: \"I just imported 200 notes from Notion. My existing MOCs are out of date and missing most of the new content.\"\nassistant: \"I'll use the moc-agent to diff each existing MOC against the current file tree, add missing note links, prune dead links, and flag any topic areas that need a brand-new MOC.\"\n<commentary>\nUse moc-agent for post-import reconciliation. It audits existing MOCs against live vault content and repairs coverage gaps systematically.\n</commentary>\n</example>

**Source:** https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/agents/obsidian-ops-team/moc-agent.md

> Generated from the Armory catalog. Full metadata lives in `brain/components/subagents/moc-agent.md`.
