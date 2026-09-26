# Armory UI pass, 26 September 2026 (CP143)

Branch `cp143-ui` in the `/Users/naman/armory-ui` worktree.

Every check below ran against a production build (`pnpm build` in `web/`, then `pnpm start -p 7312`) on the
catalog vendored at build time (65,580 rows, 29,623 with a score). The server was stopped after each run.
Result: **73 of 73 checks pass**. `pnpm build` finishes with 0 TypeScript errors (78 static pages). The CLI
tests (10) and MCP server tests (5) pass against the changed ranking engine.

`BASE` in the commands below is `http://localhost:7312`; the same commands work against production after a deploy.

## What shipped and how it was checked

| # | Upgrade | Verify command | Result | Screenshot |
|---|---|---|---|---|
| 0 | Wireframe on mock data before any code | open `docs/ui-2026-09-26/wireframe.html` | Home, detail and /stack at 1280 and 390 | `shots/wireframe.png` |
| 2 | Preview cards: `og:image` on `/`, `/stack` and every `/e/*` page | `for p in / /stack /e/mcps/github-mcp; do curl -s $BASE$p \| grep -o '<meta property="og:image"[^>]*>'; done` | PASS: the tag is on all three. Each image returns a 1200×630 PNG | `shots/og-home.png`, `og-stack.png`, `og-github-mcp.png` |
| 3 | /stack uses the CP138 picks with live scores | `curl -s $BASE/api/stack \| jq -r .stack.memory` | PASS: `letta-ai-letta`. All 11 picks match `audit/cp138/OPINIONATED-STACK.md` | `shots/stack-1280.png` |
| T41 | Both axes on /stack and /api/stack; each /c page carries its pick's install line | `curl -s $BASE/api/stack \| jq '.plane \| length'`, then look for the 12 slot names and "restricted" in `curl -s $BASE/stack` | PASS: 12 account slots, each with its pick and how the agent gets access. The "Ours today" column is left out. The provisioning order is one sentence, and one line says accounts carry no Armory score. Axis 1 picks and runner-ups match the CP138 table (one exception, below). `/c/memory` and `/c/mcps` show `armory install letta-ai-letta` and `armory install github-mcp` | `shots/stack-390.png`, `stack-768.png`, `stack-1280.png` |
| T45 | /stack is dated and can be re-derived | `curl -s $BASE/stack \| grep -o 'Picks as of[^.]*'` and `grep -c 'node scripts/stack-evidence.mjs'` | PASS: "Picks as of 7 Sep 2026", followed by the command. `node scripts/stack-evidence.mjs` prints each pick's score, its place on its shelf and the shelf's top row | `shots/stack-1280.png` |
| 5 | Signals in words, not glyphs | `curl -s $BASE/ \| grep -c '[✓♦★⎇↑]'` over the table rows | PASS: no glyphs in the rows of `/` or `/leaderboard`. Every column header is a word (Rank, Score, Component, What it does, Evidence, Last commit, Install) | `shots/home-1280.png` |
| 6 | Install commands shown in full; descriptions cut at a word | inspect every `<code>` element holding `armory install` on 8 pages | PASS: no `…` and no missing `--cli` in any command (20 on `/`, 90 on `/leaderboard`, 12 on `/stack`, 23 on `/c/memory`). Commands wrap at their spaces and keep the name and `--cli claude` whole, including the detail-page strip and the browse cards, which used to scroll | `shots/e-github-mcp-390.png`, `home-390.png` |
| 9 | No two of the top 20 show the same score | read the Score cells of the first 20 rows of `/` and `/leaderboard` | PASS: 20 distinct values, 99.990 down to 99.856 | `shots/home-1280.png` |
| 11 | Phone at 390px: no nav overlap, no sideways page scroll | Playwright at 390×844 on 11 pages: compare `scrollWidth` with `clientWidth`, and check the header controls pairwise for overlap | PASS: every page is 390 wide with 0 overlaps (`/`, `/trending`, `/new`, `/leaderboard`, `/stack`, `/browse`, two `/e/` pages, `/c/memory`, `/formula`, `/ask`) | `shots/home-390.png`, `leaderboard-390.png`, `stack-390.png`, `e-github-mcp-390.png` |
| 7 | Trending and New tabs | `curl -s $BASE/trending`, `curl -s $BASE/new` | PASS: both lists differ from Top. Trending shows mentions gained, e.g. "+13 mentions since 12 Sep 2026" (14 rows rising). New shows the listed date on every row, e.g. "25 Sep 2026" | (rows share the home layout) |
| 8 | Last commit on every row, with a Stale label | count rows without `<time dateTime` in `/`, `/trending`, `/new`, `/leaderboard` (pages 1 and 2) and `/c/memory` | PASS: 0 rows are missing a date. A repo with no commit for two years shows "Stale" (artidoro-qlora, "2 years ago Stale") | `shots/leaderboard-1280.png` |
| 10 | /leaderboard rendered on the server; /browse paginated | `curl -s $BASE/leaderboard \| grep -o 'armory install' \| wc -l` and `curl -s $BASE/browse \| wc -c` | PASS: 90 install commands on /leaderboard page 1 (100 rows; 10 are one repository listed twice and fold into one line). Page 2 starts at rank 101. /browse is 322 KB (it was 52 MB) and has Next/Previous pages | `shots/leaderboard-768.png` |
| 12 | Stack Builder: a share URL reproduces the picks as one command | `curl -s "$BASE/stack?memory=getzep-zep"` | PASS: the page shows `armory install getzep-zep --cli claude`, the single command chains 11 installs with getzep-zep in place of letta, and the share link reads `https://armory-murex.vercel.app/stack?memory=getzep-zep` | `shots/stack-390.png` |
| T26 | "Contributed by <feed>" on rows a feed added | `curl -s $BASE/leaderboard \| grep -c 'Contributed by Sentinel'` | PASS: 7 rows on /leaderboard page 1 and 4 on `/`; also on the detail page (under Source), the /stack and /c pick lists, the browse cards and the preview card. The label comes from the `<name>-feed` tag; nothing is hard-coded and no person's name appears | `shots/t26-contributed-row-1280.png`, `t26-detail-aider-1280.png`, `og-aider-ai-aider.png` |

Screenshots were taken at 390×844, 768×1024 and 1280×900 of `/`, `/leaderboard`, `/stack` and
`/e/mcps/github-mcp` (12 in `shots/`), and each was read. Fixes made after reading them:

- The Evidence column ran into Last commit, because the separators could not break.
- The install command on the detail page and on browse cards scrolled out of view on a phone.
- At 768px the ranked tables and /stack scrolled their Install and Deploy access columns out of view. They now
  stack into blocks below 1024px.
- The preview cards drew their headline, subtitle and list on top of each other.
- The /stack command block split `--` from `cli`.

## Skipped, and why

| # | Upgrade | Why |
|---|---|---|
| 1 | Deploy the nightly refresh | Already live before this pass (production redeploys every morning at 7:00). |
| 4 | Data merge of duplicate rows | Done separately in the data (pull request #11: 225 rows folded). Until that reached this branch, a display-only fold showed a repository listed twice as one line, "also listed as ruvnet-claude-flow"; rows fold only when the exact score, stars, forks and last push all match. |

## Decisions and things the reviewer should know

- **The engine's numbers moved slightly.** Percentiles are now kept unrounded until the final blend. 3,111
  rows' Universal score changed by ±0.1, and 5 changed by more because their forks rank now edges their stars
  rank and becomes the base: hkuds-nanobot 93.2→93.8, significant-gravitas-autogpt 93.3→93.9,
  ggml-org-llama-cpp 96.2→96.5, incorporatedpartners-labelhead 93.3→93.9, gibsonai-memori 88.5→89.5.
  `/api/rank`, the CLI and the MCP server share the engine, so they move too. The order is: score before
  rounding, then number of signals, then latest commit, then stars, then name. It is stated on `/`,
  `/leaderboard` and `/formula`. Accepted.
- **Ranks skip a number where a twin folds** (…17, 18, 20…), so a rank means the same as its place in
  `/api/rank`, and page 2 starts at 101.
- **Memory pick.** letta-ai-letta is the CP138 pick but is 7th on its shelf by score (topoteretes-cognee 99.7
  leads). /stack says so plainly: "picked for that, though other memory rows score higher". Skills (26th) and
  sandbox (15th) are also below their shelf's top row; the CP138 table overrides both on purpose.
- **One runner-up left out.** The CP138 table lists soul-md-spec as the Identity runner-up. It is our own
  repository and scores 23, and our repositories are picks only when they win on score. Accepted.
- **Ask page.** Its Top Ranked table is filled in the browser from `/api/rank`, whose rows carry no tags, so it
  has no "Contributed by" line. Adding one needs a field in the shared engine's API output. Not done.
- **Home is static,** built at deploy. "+340 this week" and "refreshed 4 hours ago" come from the catalog's own
  date, and the "ago" text updates in the browser every minute. Trending and New come from the catalog's git
  history, which `web/scripts/copy-data.mjs` writes to `web/changes.json` at build time (gitignored; traced
  into every function). Vercel builds without git history keep the vendored copy.
- **Preview-card fonts** (Instrument Sans and Serif) are fetched as TTF from Google Fonts. If the fetch fails,
  the card draws in next/og's default font. The fetch timeout is 15 seconds.
- **Dead code, noted and not deleted:** `web/src/components/install-modal.tsx` (unused; it cuts its command with
  `truncate`) and `web/src/components/filter-chips.tsx` (unused now). The nav's Source link points to
  `github.com/naman10parikh/component`; check that this repository name is current.
- **Process slips, both corrected in the lane.** One verify run started while the machine check said HIGH (the
  check exits 0 either way); later runs were gated on the "→ ok" text. Two file deletions staged earlier rode
  into the engine commit; the two unpushed commits were soft-reset and recommitted. Rule: read
  `git diff --cached --name-status` before every commit.

## Commits on `cp143-ui`

| Commit | What |
|---|---|
| `f6ca1e508` | docs(ui): wireframe on mock data |
| `ed711c8ae` | feat(rank): order by the exact score and document the tie-break |
| `156241c99` | feat(web): one board for every list, words not glyphs, full commands, phone layout |
| `4243f3aa0` | feat(web): preview cards for /, /stack and component pages |
| `72e6c220f` | fix(web): preview cards lay out in one column; the stack command keeps its flags whole |
| `4e617f28e` | feat(stack): runner-ups exactly as the CP138 Axis 1 table; accounts say they carry no score |
| `ac6edd44f` | docs(ui): screenshots at 390, 768 and 1280, preview cards and the contributed-by row |

## Checked on production after the deploy (26 September, 02:20)

**Lighthouse 12.8.2** against `https://armory-murex.vercel.app` at `f2a4b092c`. The bar is performance and
accessibility of 90 or more. It was run with a native arm64 Node from nodejs.org, because Lighthouse refuses the
Mac's x64 Node (Rosetta would translate Chrome and skew the timings). Each page ran once in headless Chrome. The
full reports are in `lighthouse/` and open in any browser.

| Page | Device | Performance | Accessibility | Best practices | SEO | Largest paint | Speed index |
|---|---|---|---|---|---|---|---|
| `/` | phone (Lighthouse's throttled default) | 98 | 100 | 96 | 100 | 2.4 s | 1.0 s |
| `/` | desktop | 100 | 100 | 96 | 100 | 0.5 s | 0.3 s |
| `/stack` | phone | 93 | 100 | 96 | 90 | 2.0 s | 6.3 s |
| `/stack` | desktop | 100 | 100 | 96 | 90 | 0.4 s | 0.3 s |

Both pages pass on both devices. Total blocking time is 0 ms and layout shift is 0 on all four. Two things are
worth a later look, and neither blocks the bar:

- On a phone, `/stack` takes 6.3 s to fill the screen (its speed index). It is a long page.
- `/stack` can't be restored from the back/forward cache.

**Pixel check** (`pixel audit`, step 1: `impeccable detect`, pinned at 2.3.2, run in an E2B sandbox because it is
third-party code):

- On `main` it failed with one finding: "6 em-dashes in body text" in `web/src/app/layout.tsx`. Three of the six
  were em-dashes in a code comment. The other three were the `--font-*` CSS variable names, which the rule also
  counts.
- The comment now uses colons. That leaves the three variable names, below the rule's limit of five.
- Steps 2 to 7 of `pixel audit` need a running app, and they show as skipped in a static audit. Lighthouse above is
  step 3 run for real, and it covers accessibility (step 2's ground) too.

## Follow-ups, 26 September

Checked against a production build (`pnpm build && pnpm start -p 7312`). Screenshots are in
`shots/followups/`, at 1280 and 390 wide.

### First pull request: installs, links and counts

| Item | Verify with | Result |
|---|---|---|
| github-mcp ran `npx -y github-mcp-server`, a package from another publisher, and the page marked it Verified | `node scripts/check-installs.mjs` · the github-mcp page | Its note now names GitHub's own image, `docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server`, as GitHub's README documents. The page and `armory install github-mcp` both write that. |
| Downloading commands (`npx`, `uvx`, `docker`) checked against the registry | `node scripts/check-installs.mjs` | 118 MCP rows name one: npx 97 (54 from the row's own repository, 43 not), uvx 19 (14, 5), docker 2 (1, 1). **49 rows** no longer show their command or a Verified label. The site also stopped guessing `npx -y <repository name>` for the 58,597 MCP rows that name no command. |
| `armory install` on the 11 /stack picks | `armory install <pick> --cli claude --dry-run` | Before: 0 of 11 installed, and the top-ranked row failed with a curl error. After: 2 of 11 install (karpathy-coding-discipline writes the repository's own `CLAUDE.md` into `.claude/rules/`; github-mcp writes the docker entry into `.mcp.json`). The other 9 print "Not installed" with the reason and the source link, and exit 1. |
| Rows with nothing to install promised one command | the aider, /stack and /ask screenshots | Every list, card and detail page now shows the command only where `armory install` places something, and otherwise "No one-command install · Source". The /stack command chains only those picks and lists the rest with links. |
| Nav Source and footer Contribute linked `naman10parikh/component` (404) | DOM check on /stack | Both now link `github.com/naman10parikh/armory` (200); the 404 page's issue link too. |
| Stale counts: README 64,000+, plugin listings and installers 24,000+, `/llms.txt` 64,657 as of 2 September | `curl /llms.txt` | `/llms.txt` is generated at build time from the catalog (65,318 as of 2026-09-26). README, PLUGIN.md, the plugin listings and both installers now say 65,000+, dated where they are read by people. |
| Star counts were fetched once and never re-asked | `node scripts/backfill-stars.mjs --limit 1` | Each night also re-asks one seventh of the answered repositories, by UTC day: every count is re-asked once a week, about 80 points a night, and a run stops under 200 points left. |
| /stack Identity pick cut to "karpathy-coding-discipline · 100…" at 1280 | canvas measure of the chosen label | The role moved into option groups ("The pick", "Runners-up", "Top of the shelf"): the label needs 204 px and has 274 px. |
| /ask had no "Contributed by" line | `curl '/api/rank?limit=3'` · /ask screenshot | `/api/rank` rows carry `contributor` (from `lib/rank.mjs`) and `installable`. /ask shows "Contributed by Sentinel" on its rows and its cards. |

Checks: `pnpm build` in `web/` passed with 0 TypeScript errors. CLI tests 10/10, MCP server tests 5/5, CLI agentic
test 6/6, test pyramid 14/14, `validate` and `test-gate` PASS, and a catalog rebuild shows no drift.

### Second pull request: dedupe, the score, packages, deploy access, the gzipped catalogue

Screenshots are in `shots/followups/b/`.

| Item | Verify with | Result |
|---|---|---|
| T56: one repository entered twice | `node scripts/demote-same-repo.mjs`, then a lookup per repository | 102 rows folded in 59 repositories, moved to `brain/lookup/duplicates/` with nothing deleted: 36 across shelves, 5 roots written two ways, 18 folders under two branches. ruvnet/ruflo, stripe/ai, upstash/context7, langfuse, mlflow, container-use, claude-task-master, google/a2a, openmemory, `servers/src/everything` and `cognee-mcp` now enter once each. Subpaths no longer borrow their parent's stars. The 2,872 same-URL MCP pairs from PulseMCP and Glama sit behind `--same-type`, which is off. |
| Wrappers shadowing projects | `armory install mempalace --dry-run` | Three MCP bridges that carried a project's own name are renamed to their repository's slug, and an exact-name tie resolves to the project. `mempalace` now means MemPalace. |
| T20: /formula matches the engine | independent Python reproduction · the `/formula` sums | The score is 0.8 × best + 0.2 × second best; a third counts only when it beats one of them; `mentions: 0` is no signal. Five rows reproduce exactly: letta-ai-letta 99.5591, wshobson-agents 99.7223, e2b-sandbox 99.8892, context7-mcp 99.7727, daytona 80. All six worked sums on `/formula` add up to their score. The Context7 mentions moved to upstash/context7. |
| T25: package files | `npm pack --dry-run` in `cli/` and `armory-mcp/` | Both tarballs now carry README.md and LICENSE (24 files and 12 files). Not published. |
| T41: deploy access on four shelves | the `/c/sandbox`, `/c/memory`, `/c/mcps`, `/c/tools` screenshots | One line under the pick: E2B, Supermemory, Composio, and Browserbase + Stagehand. |
| T24: gzipped catalogue | `ls -l catalog.json*` · top row from the CLI, the MCP and `/api/rank` | 55.4 MB to 7.1 MB. The site and the engine read the `.gz`, and the CLI, the MCP and `/api/rank` agree: openclaw-openclaw overall, thedotmack-claude-mem on memory. The plain file stays, because seven scripts outside Armory read it (`docs/CATALOG-SIZE.md`). |
| Item 1: alternatives | the aider, github-mcp and letta pages | Only rows that share a purpose. aider: openai-codex, claude-squad (was gh and duckdb). github-mcp: nulab-backlog, github-brain-mcp-server, raohwork-forgejo. letta: plastic-labs-honcho. |
| Item 2: alternatives' scores | the same pages | Three decimals, as `/` prints them: openai-codex 99.989, not 100.0. |
| Item 3: pointer-only sections | aider page | "When to use it" and "How to install / invoke" are gone when they only say "See the source"; github-mcp keeps its real ones. |
| Item 5: phone nav fade | 390 shots, start and end | The fade was already on main. At the end of the scroll the last link now ends at 322 px, and the fade starts at 323 px. |
| Item 8: `bench` on Evals | `armory rank --component eval` | harbor-framework-terminal-bench-2-1 is on the Evals shelf at 94.4. |
| Item 9: catalogue size | `docs/CATALOG-SIZE.md` | The ruling was already there. Today's measurement and what was done are added under 26 September. |

After T20, cognee is seventh on Memory, still at its root repository. It was first only because the rows
above it held mentions and the old blend took points off them for it.

Checks: `pnpm build` in `web/` passed with 0 TypeScript errors. CLI tests 10/10, MCP server tests 5/5, CLI agentic
test 6/6, test pyramid 14/14, `validate` PASS (65,216), `test-gate` PASS, and a catalog rebuild shows no drift.

### Second pull request, continued: the T51 copy review

The reject list is `sentinel/brain/updates/cp143/cp138-T51-rejects.md`: 79 rows over 27 pages, read on
production at `ec49ffdf`. Screenshots are in `shots/followups/b/t51/`. Each page was then read back from a
production build: every rejected string is gone from the served HTML and every replacement is there (16 pages
checked by script, plus the screenshots).

| Rows | Result |
|---|---|
| G1, X1, D4 | Already fixed by the first pull request (repository links, `/llms.txt` built from the catalog) and by item 3 above. |
| G2, G3 | The footer slogan is gone; the last line reads "License MIT · Built by Energy". |
| G4, TL1–TL10 | The page is **Pipeline** at `/pipeline`; `/graph` and `/timeline` answer 308 to it. Headings are "Layer 1" over "Sources" and so on. The ranked count (28,988) comes from the engine, the signal chips from its `WEIGHTS` keys and the blend from `BLEND`: nothing on the page is typed by hand. COPY.md's lexicon says Pipeline. |
| G5, H1, S1 | T51 proposed "most installable in one command". Since the first pull request only rows `armory install` can place show a command (2 of the 11 /stack picks), so that would be untrue too. The heading reads "65,216 agent components, ranked where public evidence exists"; the /stack caption reads "11 picks · 2 in this command". |
| G6, G7 | "Description" column; "passed install test", "failed install test", "{n}% of install tests passed". |
| G8, F1 | "Needs the armory CLI · not on npm yet, build it from cli/ in the repository" sits beside the Harness selector on the home board, the leaderboard, /stack, the /c pages and /ask, and under the install box on a detail page that shows a command. /formula's CLI box says the same. |
| H2–H5 | Share card counts ranked rows; "+342 listed this week"; the served HTML gives a fixed time ("Updated 26 Sep 2026, HH:MM UTC"), which stays true in a cached page, and the browser switches to "42 minutes ago" after loading; "across component types". |
| L1–L5 | Leaderboard lead and meta; "4 More"; the catalog total shows only beside a filtered count; the full tie-break sentence; "Highest First". |
| A1–A4 | /ask says "Search by keyword, get ranked components" (a comment in the code says to restore the old line once `GEMINI_API_KEY` is set); loading text names what loads; tab title "Ask · Armory"; `/api/ask` says "Keyword matches; conversational search is off." |
| C1, C2, CP1–CP3 | No "shelf" in the property notes; US spelling; /c/identity says "ranks the rules rows, the largest part of this component (461 of 499)"; the sub-agent picks lose "specialised" and the unsourced superlative. |
| F2–F15 | Headings are Signals, Percentiles, Confidence, Worked Examples, Coverage, API. No glyphs; values in words ("1 fork", "passed install test"); `p90` is explained; the labels and tiers follow COPY.md §4C. T51's meta line described the old blend, so the new one reads the numbers from `BLEND`. F10 was already fixed by T20. |
| S2 | "provisioned through bezalel.sh". |
| ST1–ST8 | A `verified_at` that is not a date now counts as No Date / Not Crawled. Base Crawl May 2026, newest confirmation September 2026 (162 rows), 99.7% confirmed in May. Coverage counts the engine's five signals (28,988, 44.4%, the same as the home page and /formula). The freshness sentence said "a single sweep (May 26 → Sep 26)", which contradicted the crawl-age line, so it now gives the date range. |
| B1–B4 | `-feed` tags are hidden on cards and detail pages; "Details"; Title Case maturity; a "Harness" label before the harness chips. |
| D1–D3, D5–D8 | "Pending verify -> promote." and "(live API)" are dropped when a note is shown; the files keep them. "Alternatives · MCPs": T51 proposed "Top-Ranked MCPs" for the old list of shelf leaders, but the list now holds real alternatives. "Listed as compatible" / "Not listed · generic path". The detail score prints three decimals (github-mcp 99.942). "Confirmed 26 May 2026". "Related". Related cards print their signals in words. |
| I1–I3, N1 | The page is **Channels** (the route stays `/identity`); "Webhook Endpoints" over the two URLs, and the setup sentence moved to `docs/CHANNELS.md`; the meta says email and SMS answer once configured. The 404 says "No page at this address". |
| Ruling | "Contributed by Sentinel" stays, and "Sentinel" now links `docs/CONTRIBUTORS.md` on tables, /stack, the /c picks, /ask cards and detail pages. On a browse card (one link covers the card) and on the share image it stays plain text. |

Not changed, with the reason:
- **Stars and forks both come from GitHub and count as two signals.** That is a formula decision for the owner.
- `web/src/app/graph/graph-client.tsx` is unused and still in place.
- `/robots.txt` and `/sitemap.xml` return 404. Adding them is not a copy fix.
- energy's `.claude/rules/new-service-checklist.md` says Armory answers on email and SMS/WhatsApp. That rule lives in another repository.
- "0 mentions" counted as a signal: T20 already fixed this. wshobson-agents and voltagent now show stars and forks, 2 signals.

New finding: after T56 moved forks onto repository roots, /formula §03's most-starred single-signal row is
circle-mcp-server at 2,621 stars. Its corroborated rival has 209,417 stars, so the head-to-head no longer shows
"more stars, lower score". The page is still true, but the comparison has lost its point.

Checks: `pnpm build` in `web/` passed with 0 TypeScript errors. CLI tests 10/10, MCP server tests 5/5, CLI agentic
test 6/6, test pyramid 14/14, `validate` PASS (65,216), `test-gate` PASS.
