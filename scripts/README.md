# scripts/ — git worktree helpers for parallel dev

Small shell helpers for running multiple isolated working copies of Armory at once (so several agents/branches can build in parallel without clobbering each other):

- `worktree-new.sh` — create a new git worktree + branch
- `worktree-list.sh` — list active worktrees
- `worktree-launch.sh` — open a worktree
- `worktree-clean.sh` — tear down a finished worktree

These are developer conveniences only. The registry's actual machinery (crawlers, promote, catalog, validate, test-gate, surface) lives in [`ingest/`](../ingest/).
