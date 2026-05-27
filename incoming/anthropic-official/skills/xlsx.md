---
name: xlsx
type: skills
description: >
  "Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an existing .xlsx, .xlsm, .csv, or .tsv file (e.g., adding columns, computing formulas, formatting, charting, cleaning messy data); create a new spreadsheet from scratch o…
source_repo: anthropics/skills
source_url: https://github.com/anthropics/skills/blob/main/skills/xlsx/SKILL.md
license: Proprietary-Anthropic
cli_compat: [claude]
maturity: stable
stars: null
eval_score: null
verified_at: 2026-05-26
related: []
tags: [anthropic, official, skill]
---
## What it is
Official `anthropics/skills` skills component — "Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an existing .xlsx, .xlsm, .csv, or .tsv file (e.g., adding columns, computing formulas, formatting, charting, cleaning messy data); create a new spreadsheet from scratch or from other data sources; or convert between tabular file formats. Trigger especially when the user references a spreadsheet file by name or path — even casually (like \"the xlsx in my downloads\") — and wants something done to it or produced from it. Also trigger for cleaning or restructuring messy tabular data files (malformed rows, misplaced headers, junk data) into proper spreadsheets. The deliverable must be a spreadsheet file. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved."

## When to use it
"Use this skill any time a spreadsheet file is the primary input or output. This means any task where the user wants to: open, read, edit, or fix an existing .xlsx, .xlsm, .csv, or .tsv file (e.g., adding columns, computing formulas, formatting, charting, cleaning messy data); create a new spreadsheet from scratch or from other data sources; or convert between tabular file formats. Trigger especially when the user references a spreadsheet file by name or path — even casually (like \"the xlsx in my downloads\") — and wants something done to it or produced from it. Also trigger for cleaning or restructuring messy tabular data files (malformed rows, misplaced headers, junk data) into proper spreadsheets. The deliverable must be a spreadsheet file. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved."

## How to install / invoke
Official Anthropic skill. See the full `SKILL.md` (plus any bundled scripts/REFERENCE.md) for the runnable implementation: https://github.com/anthropics/skills/blob/main/skills/xlsx/SKILL.md

## Notes
Official Anthropic reference skill — the quality bar for the Skills spec. License: Anthropic terms (source-available; see repo LICENSE/README). Pending verify → promote.
