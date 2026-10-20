---
name: armory-vet-component
description: Use before you install a component you found in Armory (an MCP server, skill, hook, sub-agent or rule) to decide whether it is real, maintained and safe: its provenance, licence, stars, last check, ranking and, with an E2B key, what it would run at install time, looked at inside a sandbox. Do not use to find components (use the armory skill) or to add one (use armory-submit).
---

# Vet a component before you install it

Armory ranks components on public evidence, but a stranger's code is still a stranger's code. This skill turns
"it showed up in search" into a yes or no you can defend.

## Steps

1. **Read the record.** `armory get <name>` prints the component's page: `source_repo`, `source_url`, `license`,
   `stars`, `verified_at`, `maturity` and how to install it.
2. **Check the ranking.** `armory search "<name>" --json` shows its Universal score and primary signal beside
   similar components. Prefer the higher-ranked one when two do the same job.
3. **Check the basics.**
   - The licence is a known open licence, not `unknown`, if you will ship it.
   - `verified_at` is within about 90 days, and the source repository still exists.
   - Stars and maturity fit the risk: an experimental component with no stars needs a reason.
4. **Look inside a sandbox (optional, needs `E2B_API_KEY`).** `armory sandbox-run <name>` clones the source in an
   isolated E2B microVM and reports its manifests, install-time scripts (`preinstall`, `install`, `postinstall`,
   `prepare`) and whether it has tests. Nothing runs on your machine.
5. **Decide.** Install with `armory install <name>` (add `--dry-run` first to see what it writes), or pick the
   next-ranked alternative.

## Expected output

A short table: name, source repository, licence, stars, last checked, Universal score, install-time scripts (or
"not checked"), and a one-line verdict (install, install after reading X, or do not install), followed by the exact
install command.
