---
name: claude-rules-doctor
type: clis-tools
source_repo: nulone/claude-rules-doctor
source_url: https://github.com/nulone/claude-rules-doctor
license: MIT
---
# claude-rules-doctor

CLI that detects dead `.claude/rules/` files by checking if `paths:` globs actually match files in your repo. Catches silent rule failures where renamed directories or typos in glob patterns cause rules to never apply. Features CI mode (exit 1 on dead rules), JSON output, and verbose mode showing matched files.

**Source:** https://github.com/nulone/claude-rules-doctor

> Generated from the Armory catalog. Full metadata lives in `brain/components/clis-tools/claude-rules-doctor.md`.
