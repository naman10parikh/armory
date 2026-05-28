# Armory — Vendored Gear

This directory contains the **actual component files** vendored from upstream repos.

`brain/` holds metadata graph stubs (one per component, YAML frontmatter + description).
`gear/` holds the **real pieces** — copy them straight into your project or run
`armory install <slug>` to let the CLI wire them for you.

## Layout

```
gear/
  skills/      <slug>/SKILL.md (+ optional supporting files)
  agents/      <slug>.md       (Claude sub-agent definitions)
  commands/    <slug>.md       (slash-command definitions)
  hooks/       <slug>.py|json  (lifecycle hook scripts)
  rules/       <slug>.md       (coding rules for Cursor / Claude)
```

## Harness-native mirrors

| Harness        | Location         | Notes                              |
|----------------|------------------|------------------------------------|
| Claude Code    | `.claude/`      | skills/ agents/ commands/ hooks/ rules/ |
| Cursor         | `.cursor/rules/`| rules only                         |
| Codex          | `.codex/`       | pointer README → ../gear/    |
| OpenCode       | `.opencode/`    | pointer README → ../gear/    |
| Gemini         | `.gemini/`      | pointer README → ../gear/    |

Sources are vendored verbatim (license-compliant). Each file has a 1-line provenance header.
