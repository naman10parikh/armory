# Parallel Development — Worktrees + portless (Conductor-style)

Run multiple Claude Code instances on Component **at the same time**, each on its
own git branch, in its own directory, with its own dev-server URL — zero
collisions. This is the "Open Conductor / portless" workflow: every workspace is
a git **worktree** running its own agent, the way the [Conductor](https://conductor.build)
Mac app does it, but driven from the shell with scripts you can read.

## When to use worktrees

Use a worktree per task when you want **parallelism without context bleed**:

- Two or more independent tasks (e.g. `site-polish` and `mcp-auth`) that touch
  different files and shouldn't wait on each other.
- A risky refactor you want isolated from `main` while other work continues.
- Running several agents concurrently (one Claude Code per worktree).

**Do NOT** use a worktree for a quick one-file change on `main` — the setup cost
(install + branch + port) isn't worth it. Just work in the main checkout.

## The scripts (all in `scripts/`)

| Script                       | What it does                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `worktree-new.sh <slug>`     | Creates `../component-wt-<slug>` on branch `wt/<slug>` off main; symlinks `.env`/`.env.local`; `pnpm install`. |
| `worktree-launch.sh <slug>`  | `cd`s into the worktree and launches `claude --dangerously-skip-permissions --chrome`; sets up portless or a manual PORT. |
| `worktree-clean.sh <slug>`   | `git worktree remove` + deletes the branch **if merged**; refuses to remove a **dirty** worktree. |
| `worktree-list.sh`           | `git worktree list` plus the port/URL each worktree is using.                                 |

### Exact commands

```bash
# 1. Spin up an isolated worktree for a task
scripts/worktree-new.sh site-polish
#   -> creates ../component-wt-site-polish on branch wt/site-polish, runs pnpm install

# 2. Launch a Claude Code instance inside it (own terminal/pane)
scripts/worktree-launch.sh site-polish
#   -> cd ../component-wt-site-polish && claude --dangerously-skip-permissions --chrome

# 3. See everything that's running
scripts/worktree-list.sh
#   -> path | branch | URL-or-PORT for each worktree

# 4. When the task is merged, tear it down
scripts/worktree-clean.sh site-polish
#   -> git worktree remove + branch -d (only if merged; dirty = refused)
```

Convention: branch `wt/<slug>` ↔ directory `../component-wt-<slug>`. Worktrees are
**siblings** of the repo so they never pollute or get globbed inside it. Do NOT
pass `--model` / `--effort` to Claude — the adaptive budget system owns those.

## portless setup (recommended port isolation)

[portless](https://github.com/vercel-labs/portless) (Vercel-labs) replaces port
numbers with stable, named `.localhost` HTTPS URLs and **auto-detects git
worktrees**, prepending the branch as a subdomain. Zero config per worktree.

```bash
# One-time install (global):
npm i -g portless
```

On its **first run** portless needs `sudo` once — it binds port 443 and installs
a local certificate authority (CA) so the HTTPS URLs are trusted with no browser
warnings. After that it runs as a long-lived daemon; no sudo again.

Add the dev script once (committed on `main`, so every worktree inherits it):

```jsonc
// in the web package's package.json
"dev:portless": "portless run --name component next dev"
```

Then in each worktree, `pnpm dev:portless` serves:

- main → `https://component.localhost`
- worktree `wt/site-polish` → `https://site-polish.component.localhost`

Distinct origins → distinct cookies → **no auth bleed, no port collisions**.
portless picks the underlying `PORT` from the **4000–4999** range automatically.

**Fallback (no portless):** `worktree-launch.sh` assigns one stable port per slug
from a 4000–4999 registry at `scripts/.worktree-ports` and exports `PORT`, so
`next dev` / `vite` bind it. One port per worktree, never shared.

## The merge flow

Branches + GitHub PRs are the coordination surface (there is **no** automated
multi-agent merge harness and **no** cross-worktree IPC — review/merge is
human-in-the-loop, exactly the Conductor model).

```bash
# From inside a worktree, after committing:
gh pr create --base main --head wt/site-polish --title "..." --body "..."
```

**Merge SERIALLY.** Vercel Hobby allows only **one build at a time** — rapid
merges to `main` cancel each other's deploys. So:

1. Rebase each branch on `main` before merging (smallest / most-foundational first).
2. `gh pr merge --squash` one PR.
3. **Wait ~2 min** for the Vercel deploy to finish (verify it's green).
4. Only then merge the next PR.

## Pitfalls (and the fixes baked into these scripts)

| Pitfall                  | Why it bites                                                              | Fix                                                                                          |
| ------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Symlinking node_modules** | Native binaries + pnpm's `.pnpm` virtual store break across symlinks.   | `worktree-new.sh` runs a fresh `pnpm install` per worktree. **Never** symlink `node_modules`. |
| **Re-pulling secrets**   | Duplicated `.env` per worktree drifts and risks leaks.                    | `.env`/`.env.local` are **symlinked** from main (one source of truth). Per-worktree `PORT`/URL overrides go in `.env.development.local`. |
| **pnpm store / lockfile**| The global store (`~/.pnpm-store`) is shared, so installs are cheap — but two installs at once can race, and divergent `pnpm-lock.yaml` edits conflict. | **Stagger** installs (don't fire all N at once). Treat `pnpm-lock.yaml` like code: edit on one branch, rebase others on top. |
| **Symlinking `.vercel/`**| Re-linking in one worktree clobbers the others' project link.             | **Copy** `.vercel/` per worktree (`cp -R`), never symlink it.                                |
| **Port collisions**      | Default `localhost:3000` collides across N dev servers; same-origin cookies bleed. | portless (distinct subdomain → distinct origin) OR the manual `PORT` registry. **One port per worktree**, never shared. |
| **Stale `.next`**         | A `git checkout` of another branch inside a worktree leaves a stale build dir. | Worktrees give isolated build dirs for free. If you ever switch branches in one, `rm -rf <pkg>/.next`. |
| **Removing dirty work**  | `git worktree remove` can blow away uncommitted changes.                  | `worktree-clean.sh` **refuses** dirty worktrees (warns, no force) and only deletes **merged** branches. |
