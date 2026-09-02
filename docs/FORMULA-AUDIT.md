# Formula audit — can one score really rank 64,638 different things?

**Audited:** 2026-09-01 · catalog `generated_at 2026-09-01T12:23:20Z` · 64,638 components
**Engine:** `lib/rank.mjs` · **Public explanation:** `web/src/app/formula/page.tsx` (`/formula`)
**Method:** every number below was computed by importing `computeRows` from `lib/rank.mjs` and running it
over `catalog.json`. Nothing is estimated. Live API probes are marked *verified 2026-09-01*.

**The one-line verdict.** The formula is honest but it is not yet *universal*. It ranks **44.1%** of the
shelf (28,530 of 64,638), and of those, **99.4% are ranked on a single signal** — so the parts of the
design that were supposed to make it universal (the evidence multiplier, the "percentile within its own
kind" rule) are currently inert. Four of the eight kinds Armory holds have **no reachable signal at all**
today. Three of them (papers, HF models, package-registry listings) have essentially **no rows** either —
so the formula has never actually been tested against the shapes the owner wants it to cover.

---

## 1. Kind × signal matrix

Kind is derived from the URL host + path shape (`github.com/o/r` root vs a deeper path, registry host,
package host, paper host, HF host, anything else). Every one of the 64,638 rows has a URL — there is no
`no-url` bucket.

| Kind | Rows | stars | usage | tested | mentions | Ranked | % ranked |
|---|---:|---:|---:|---:|---:|---:|---:|
| **github repo root** (`github.com/o/r`) | 57,807 | 27,267 | 0 | 45 | 174 | 27,321 | **47.3%** |
| **file inside a repo** (`github.com/o/r/blob/...`) | 3,588 | 322 | 0 | 4 | 60 | 376 | **10.5%** |
| **registry listing** (smithery · mcp.so · pulsemcp) | 1,834 | 0 | 306 | 2 | 15 | 315 | **17.2%** |
| **website / docs page** | 1,402 | 0 | 487 | 9 | 26 | 517 | **36.9%** |
| **other VCS** (gitlab, …) | 4 | 0 | 0 | 0 | 0 | 0 | **0.0%** |
| **package registry** (npm · PyPI) | 3 | 0 | 1 | 0 | 0 | 1 | 33.3% |
| **paper** (arxiv · doi · S2 · ACL …) | **0** | — | — | — | — | — | — |
| **HF model / dataset** | **0** | — | — | — | — | — | — |
| **TOTAL** | **64,638** | **27,589** | **794** | **60** | **275** | **28,530** | **44.1%** |

**Same table by component type** — this is where the "one score for anything an agent consumes" claim
actually breaks, because Armory's own inventory is 95% MCP servers and the non-MCP components are the
unrankable ones:

| Type | Rows | Ranked | % | Dominant kind |
|---|---:|---:|---:|---|
| mcps | 61,215 | 28,188 | **46.0%** | github repo root (57,479) |
| skills | 1,129 | 50 | **4.4%** | file inside a repo (1,102) |
| subagents | 729 | 2 | **0.3%** | file inside a repo (722) |
| workflows | 716 | 60 | **8.4%** | file inside a repo (645) |
| claudemd-rules | 467 | 18 | **3.9%** | file inside a repo (458) |
| hooks | 140 | 18 | **12.9%** | file inside a repo (122) |
| clis-tools | 109 | 95 | **87.2%** | github repo root (102) |
| infrastructure | 52 | 33 | **63.5%** | website (26) |
| evals | 38 | 32 | **84.2%** | github repo root (37) |
| observability | 36 | 28 | **77.8%** | github repo root (30) |
| memory | 4 | 4 | 100% | github repo root |
| identity | 3 | 2 | 66.7% | github repo root |

**Registries do not all publish a number.** Only Smithery does:

| Registry host | Rows | with `usage` | Ranked |
|---|---:|---:|---:|
| mcp.so | 1,382 | **0** | 8 |
| smithery.ai | 306 | 306 | 306 |
| pulsemcp.com | 146 | **0** | 1 |
| apify.com | 15 | 0 | 0 |

**Evidence distribution across the whole catalog:** ev0 = 36,108 · ev1 = 28,347 · ev2 = 178 · ev3 = 5 · ev4 = 0.

---

## 2. Holes

### H1 — `tested` is one bit wearing a percentile's clothes ✅ *fixed this round (T23)*

**Evidence.** 60 rows carry `eval_score`: 59 are `1`, one is `0`. The percentile axis therefore has
exactly **two** possible values: `p100` and `p1.7`. Every tool that passed our install-and-run check lands
on the *same* percentile a 276,813-star repo gets — the single highest value any axis in the catalog can
produce. Those 59 rows are **0.21% of the ranked shelf** but they occupied **25 of the top 25**.

The weight made it worse: at 1.4 it was the heaviest term in the blend, so one bit outvoted a real
distribution.

**How much of the top is *driven* by that bit, not merely correlated with it?** Re-ranking with `tested`
removed entirely gives a top-25 that shares only **3 of 25 names** with the live one. The `tested` axis is
not confirming what stars already said — it is choosing the leaderboard.

**Fix (two parts).**
1. *Done:* `WEIGHTS.tested 1.4 → 1.0` — parity with stars, not above it. Effect in §5.
2. *Not done, and this is the real fix:* make `eval_score` **graded**, not binary — e.g. fraction of eval
   checks passed, or a 0–1 composite of (installs cleanly · starts · answers a smoke prompt · has a
   schema). Until then the axis cannot separate two passing tools, and a weight of 1.0 is the highest
   defensible value.

**Cost.** Part 1: one line (shipped). Part 2: ~1 day to define the rubric + re-run the 60 evals; then it
scales with however many tools get evaluated.

### H2 — The second-signal penalty: more evidence can *lower* your score

**Evidence.** 126 rows carry both stars and mentions. **64 of them score LOWER than they would with stars
alone.** Exact arithmetic on a real row (`superpowers`, 276,813 stars, 1 mention):

```
with both  : (100 × 1.0  +  40.4 × 1.2) ÷ 2.2  × 0.90  =  60.74  →  60.7
stars alone:  100 ÷ 1.0                        × 0.80  =  80.0
                                                     penalty: −19.3
```

`markitdown` (125,185★) takes the identical −19.3. `opik`, `phoenix`, `browserless`, `claude-squad` all
take ≈ −19.1.

**Root cause.** The evidence multiplier only pays **0.8 → 0.9** (+12.5%) for a second signal, but the
weighted mean drags a p100 row toward the new signal's percentile. Break-even — how high a second signal
must land before it stops hurting a p100 row:

| Row is p100 on… | adding… | 2nd signal must reach | or the score DROPS |
|---|---|---:|---|
| stars | tested | **p81.0** | ✗ |
| stars | mentions | **p79.6** | ✗ |
| stars | usage | **p76.5** | ✗ |
| usage | tested | **p81.7** | ✗ |
| usage | mentions | **p80.6** | ✗ |
| usage | stars | **p78.9** | ✗ |

A single mention sits at **p40.4** (because 111 of the 275 mention-carrying rows have exactly 1). So the
most common possible second signal is *guaranteed* to punish any well-starred row that earns it. This
directly contradicts what `/formula` §03 tells the public: *"Evidence beats popularity."*

**Fix.** Stop averaging *down*. Two options, in order of preference:

1. **Max-plus-bonus.** `score = max(percentiles) + Σ bonus(other signals)`, where each corroborating
   signal adds a capped bonus scaled by its own percentile — e.g. `+8 × (p/100) × weight_norm`, total
   bonus capped so the ceiling stays 100. A second signal can then never subtract.
2. **Weighted mean with a floor:** `score = max(weightedMean × mult(ev), bestSinglePercentile × mult(1))`.
   One line, keeps the current shape, removes the penalty. Cheaper, less principled.

**Cost.** Option 2: ~5 lines in `score()`. Option 1: ~15 lines + a re-tune of the bonus constant + a
rewrite of `/formula` §03 and §04's worked arithmetic (which is generated from the engine, so it follows
automatically).

### H3 — The evidence multiplier is inert

**Evidence.** Of 28,530 ranked rows: **28,347 have exactly one signal (99.36%)**, 178 have two, **5 have
three**, none have four. The multiplier's whole range (0.8 / 0.9 / 1.0) therefore applies to 183 rows —
0.6% of the ranked shelf. In practice the multiplier is a constant 0.8 that caps the entire catalog at 80.

Worse, only **5 of 64,638 rows are even *capable*** of reaching ev≥3 today, because there are only four
signals and two of them (`tested` 60 rows, `mentions` 275 rows) barely exist.

**Consequence:** the score's usable range is `[0, 80]` for 99.4% of the shelf, and `/formula` §03's claim
that "three lets you reach 100" describes five rows.

**Fix.** The multiplier is not wrong — it is starved. It becomes meaningful the moment a second
*broadly-available* signal exists (see §3: GitHub forks + freshness reach 57,807 rows in the query we
already run). Ship signals first, then revisit the constants. Do **not** rescale the multiplier to fake a
wider range.

**Cost.** £0 — it is a consequence of H5/§3, not a separate fix.

### H4 — Percentile compression at the top, and explosion at the bottom

**Evidence** (real ladder from the live stars pool, n = 27,589):

| stars | percentile | universal at ev1 |
|---:|---:|---:|
| 1 | p29.5 | 23.6 |
| 5 | p59.7 | 47.8 |
| 25 | p82.1 | 65.7 |
| 100 | p92.2 | 73.8 |
| 1,004 | p97.7 | 78.2 |
| 5,001 | p99.2 | 79.4 |
| 110,299 | p100 | 80.0 |

Median of the stars pool is **4 stars**; p75 is 14; p90 is 68. So:

- Going from **5,000 → 100,000 stars (20×)** buys **0.8 percentile points = 0.6 universal points.**
- Going from **1 → 25 stars** buys **52.6 percentile points = 42.1 universal points.**

The formula spends almost its whole dynamic range separating tools nobody uses, and almost none
separating the tools everyone uses. `/formula` §02 presents this as deliberate ("the top is compressed on
purpose") — which is a defensible position for a percentile, but it means the score cannot answer the
question a buyer actually asks: *which of these five well-known tools is the strongest?*

**Fix.** Percentile-of-log rather than percentile-of-rank for count-like signals: `p = 100 ×
rank(log1p(v)) / n` is still a percentile (so still comparable across kinds) but redistributes resolution
toward the head. Alternatively keep the percentile and add a small `log10(v)` tiebreak term. Either way,
publish it on `/formula` — the current page's own copy would need one sentence changed.

**Cost.** ~3 lines in `percentiles()` + one paragraph on `/formula`. Half a day including re-checking the
top-100 doesn't scramble.

### H5 — Four kinds have **zero** reachable signal today

**Evidence.**

| Kind / type | Rows | Unrankable today | Why |
|---|---:|---:|---|
| file inside a repo | 3,588 | **3,212 (89.5%)** | `fix-inherited-stars.mjs` correctly removed borrowed parent stars — and left nothing behind |
| subagents | 729 | **727 (99.7%)** | all files inside repos |
| skills | 1,129 | **1,079 (95.6%)** | all files inside repos |
| claudemd-rules | 467 | **449 (96.1%)** | all files inside repos |
| mcp.so + pulsemcp listings | 1,528 | **1,520** | those registries publish no count |
| gitlab / other VCS | 4 | 4 | no fetcher |

The 3,588 sub-file rows sit inside just **382 parent repos** — `davila7/claude-code-templates` alone
supplies 1,643 of them, `affaan-m/ecc` 529, `wshobson/agents` 259.

Refusing to inherit the parent's stars was the right call. But the follow-through never shipped, so the
entire non-MCP half of Armory's own thesis — skills, subagents, rules, hooks — is unranked.

**Fix.** Give a file its **own** commit history. GitHub REST
`/repos/{o}/{r}/commits?path={path}&per_page=1` returns the last commit that touched *that file*. That is
a real, earned, per-file freshness signal — not a borrowed one. Add `age_days` as a new percentile axis.
For registries with no count, fall back to the same freshness idea via Wayback (see §3).

**Cost.** 3,588 REST calls at 5,000/hr = one run, well inside the free budget. ~2 hours to write
`backfill-file-freshness.mjs` on the pattern of `backfill-stars.mjs`.

### H6 — The same artifact is listed many times and scores differently

**Evidence.** 60,604 distinct URLs across 64,638 rows. **3,625 URLs carry more than one row (7,659 rows
involved)**, and **892 of those groups have divergent scores.** Worst case — one Smithery server, five
rows, same URL:

| name | raw `stars` field | signal | universal |
|---|---:|---|---:|
| witness-protocol | 270 | usage 270 | **1.3** |
| witness-protocol-2 | 7,828 | usage 7,828 | **73.0** |
| witness-protocol-3 / -4 / -5 | 7,828 | usage 7,828 | 73.0 |

A stale crawl and a fresh crawl of the same server both survived as separate components. 2,055 rows in the
catalog have a name ending in `-<digits>`; 922 of them are ranked.

**This also corrupts the percentile pools themselves**, because duplicates inflate the denominator *and*
push their own value in multiple times:

- stars pool: 27,589 rows over **25,556 distinct URLs** → 2,033 duplicate rows
- **usage pool: 794 rows over 398 distinct URLs → 50% of that pool is duplicates**

Half of every usage percentile is measured against copies of itself.

**Fix.** Dedupe on normalised `source_url` at ingest (`ingest/catalog.mjs`): keep the row with the most
recent `verified_at`, merge signals by max, record the losers in a `duplicate_of` field rather than
deleting them (energy = 0 deletions). Separately, `percentiles()` should build its pool from **distinct
URLs**, not rows, even before ingest is fixed.

**Cost.** ~30 lines in `ingest/catalog.mjs` + ~4 lines in `percentiles()`. Half a day. **This is the
highest value-per-line fix in the audit** — it corrects 7,659 rows and every percentile in the catalog.

### H7 — `usage` is whatever number a non-GitHub row happened to put in `stars`

**Evidence.** `computeRows` does:

```js
const isGithub = /github\.com/i.test(url || "");
const raw = typeof c.stars === "number" && c.stars > 0 ? c.stars : null;
stars: isGithub ? stars(c.stars) : null,   // ← stars() applies STAR_CEILING = 500,000
usage: !isGithub ? raw : null,             // ← raw bypasses stars() entirely — NO ceiling, NO validation
```

Two problems in three lines:

1. **The label is decided by hostname, not by provenance.** 487 of the 794 "usage" figures come from rows
   whose kind is `website`, not a registry — e.g. `ko-financial-data` at `https://ko.io` displays
   "40,620 used". Nothing verified that number is an install count. The frontmatter key it came from is
   literally `stars:`.
2. **The plausibility ceiling only guards one branch.** `STAR_CEILING` (500,000) is applied by `stars()`,
   which the usage path never calls. Exactly one component in the catalog exceeds 500,000 —
   `math-mcp` at **2,058,825** — and because its URL is `smithery.ai`, it sails through unchecked to
   **p100 → universal 80.0**, the top of the usage axis. Had the same number sat on a GitHub URL it would
   have been nulled as implausible.

**Fix.** (a) Split the field: read usage from a distinct `usage:` frontmatter key with a `usage_source:`
citation, and stop reinterpreting `stars:`. (b) Apply a plausibility ceiling to *every* numeric signal,
not just stars — move the guard into `percentiles()` so it cannot be bypassed by adding a new axis.

**Cost.** (b) is ~3 lines and can ship today. (a) is a schema change: `docs/DATA-SCHEMA.md` + a migration
over the 794 rows + `persist-signals-to-brain.mjs` field list. ~half a day.

### H8 — "We asked and the answer was zero" is indistinguishable from "we never asked"

**Evidence.** 28,369 components have `stars: 0` (a real answer that `backfill-stars.mjs` deliberately
records, per its own comment) and 7,886 have `stars: null`. `stars()` requires `v > 0`, so **both become
`null` and both render as blank.** The distinction the backfill script went out of its way to preserve is
discarded one function later.

**Fix.** Keep 0 in the pool as a genuine p-low rather than dropping it, *or* surface it as a distinct
`asked, zero` state in the UI. The first changes 28,369 rows from unranked to ranked-at-the-bottom, which
would take `% ranked` from 44.1% to 87.9% — but only honestly if the copy says "confirmed nobody has
starred this", not "scored".

**Cost.** 1 line in `stars()` + a decision about what `/formula` §05's coverage buckets should then say.
The decision is the expensive part, not the code.

### H9 — 79.8% of ranked rows are in a mass tie

**Evidence.** 28,530 ranked rows resolve to only **539 distinct universal values**. The biggest clusters:

| score | rows tied |
|---:|---:|
| 23.6 | **8,124** |
| 33.4 | 3,402 |
| 39.7 | 2,149 |
| 44.6 | 1,682 |
| 47.8 | 1,094 |

**22,770 rows (79.8% of everything ranked) share their score with at least 100 other rows.** Inside a tie
the order is decided by `KEY.universal`'s last term: lowercase name. `aardvark-mcp` beats `zzz-mcp` for no
reason a user would accept.

The root cause is H4 + H3 compounding: a 1-star row → p29.5 → ×0.8 → 23.6, and there are 8,124 one-star
rows.

**Fix.** Add a genuine tiebreak with information in it — freshness (§3, signal 1) is the natural one, and
it is free. Failing that, `verified_at` recency is already in the catalog and unused by the ranker.

**Cost.** 1 line in `KEY.universal` once a freshness axis exists.

### H10 — `dir=asc` reverses the tiebreak, not just the order

**Evidence.** `rankRows` implements ascending as `items.reverse()` over a list already sorted descending
*with descending tiebreaks*:

```
sort=stars dir=asc → zzzhdw-kusto (1★), zzstoatzz-tangled (1★), zynx-supabase-mcp-server (1★) …
```

Every one of those has the same 1 star. The user asked for "least starred first" and got "reverse
alphabetical among the 8,000-way tie". Ascending also places unranked rows **last** (`ranked.reverse()
.concat(unranked)`), which is right for desc but arguably wrong for asc — a user sorting ascending is
usually looking for the bottom of the shelf, and the truly-unmeasured rows are not it.

**Fix.** Sort with an explicit direction flag inside the comparator rather than reversing after the fact,
so the name tiebreak stays ascending in both directions.

**Cost.** ~6 lines in `rankRows`/`cmp`. An hour.

### H11 — "Percentile within its own kind" is not what the code does

**Evidence.** `docs/DATA-SCHEMA.md` and `/formula` both say *"a 0–100 percentile **within its own kind**"*.
`percentiles(list, sig)` takes no kind argument — it pools **every row that has that signal, across all
kinds**:

| axis | pool | spans |
|---|---:|---|
| stars | 27,589 | github repo root 27,267 + **file-inside-repo 322** |
| usage | 794 | registry 306 + **website 487** + package-registry 1 |
| tested | 60 | mcps 31 + clis-tools 21 + infrastructure 8 |

The claim is true *per signal* and false *per kind*. Today the two mostly coincide because each signal is
sourced from roughly one kind — but the moment §3's signals land (npm downloads and PyPI downloads both
being "downloads"; repo freshness and file freshness both being "age") the pools will genuinely mix, and a
PyPI package's 2,000 downloads will be percentile-ranked against an npm package's 87 million.

**Fix.** Either (a) change the code to partition by kind — `percentiles(list, sig, kindOf)` — which is
what the docs promise and what makes the score genuinely universal; or (b) change the docs to say "within
its own signal". **(a) is correct.** It is the mechanism that lets a paper's citations and a repo's stars
sit on one axis without either being nonsense. Partitioning also needs a **minimum pool size** (say
n ≥ 30) below which a kind falls back to the global pool, or the 3 package-registry rows would each get
p33/p67/p100.

**Cost.** ~10 lines in `percentiles()` + `score()` threading a kind accessor. Plus a re-check that no kind
has a pool too small to percentile. Half a day. **Do this before adding any signal in §3** — otherwise
every new signal inherits the bug.

### H12 — The weights are declared in three places, and `/formula` can print arithmetic that contradicts its own score

**Evidence.** `WEIGHTS` exists three times in the repo:

| # | Path | Line | Kept in sync by |
|---|---|---:|---|
| 1 | `lib/rank.mjs` | 69 | — the source of truth |
| 2 | `web/lib/rank.mjs` | 69 | `web/scripts/copy-data.mjs` `copyRankEngine()`, run as `prebuild` ✅ *(but the stale copy is also committed to git, so `git grep` shows two different values between builds)* |
| 3 | `web/src/app/formula/page.tsx` | 31 | **nothing — a hand-typed literal** ❌ |

Copy 3 is not decorative: `work()` uses it to render the visible arithmetic *and* the divisor
(`wsum`) in §04 "The whole thing, on real rows". Changing the engine without it produces a page that
shows a sum next to a score the sum does not equal. Verified on the #1 row (`browser-use` — tested p100,
mentions p81.1, stars p100, ev3):

```
page would print : (100×1.4 + 81.1×1.2 + 100×1.0) ÷ 3.6 × 1.00 = 93.70
engine computes  : (100×1.0 + 81.1×1.2 + 100×1.0) ÷ 3.2 × 1.00 = 92.91  ← the number displayed
```

This falsifies the page's own header comment: *"Every figure on this page is computed from catalog.json at
build time with the SAME engine … so the page can never drift from the ranking."* It can, and copy 3 is how.

**Fix.** Export `WEIGHTS` from `lib/rank.mjs` and import it in `page.tsx` — the vendored copy is already
on the site's import path (`../../../lib/rank.mjs`, the same specifier the page uses for `computeRows`),
so this is a one-line import swap with no new plumbing. Also stop committing `web/lib/rank.mjs`; add it to
`.gitignore` since `prebuild` regenerates it.

**Cost.** ~10 minutes. *Interim mitigation shipped this round — see §5.*

---

## 3. Free public signals, per kind

All verified live on **2026-09-01** unless marked. "Free" = no key, or a free key.

### Ranked by coverage gained per hour of work

| # | Signal | Kind it serves | Rows it can reach | Currently-unranked rows it rescues | Work | **Rows/hour** |
|---|---|---|---:|---:|---:|---:|
| **1** | **GitHub `forkCount` + `pushedAt`** | github repo root | **57,807** | **30,486** | ~1 h | **~30,000** |
| **2** | **Per-file last-commit date** | file inside a repo | 3,588 | **3,212** | ~2 h | ~1,600 |
| **3** | **npm downloads** (name resolved from `HEAD:package.json` in the *same* GraphQL call) | repo root + package registry | ≤57,807 (unmeasured) | unmeasured | ~4 h | see note |
| **4** | **Wayback first/last snapshot** | website + registry listing | 3,236 | **2,404** | ~3 h | ~800 |
| **5** | **HF `downloads` + `likes`** | HF model/dataset | **0 today** | 0 | ~1 h | 0 |
| **6** | **Semantic Scholar `citationCount`** | paper | **0 today** | 0 | ~2 h | 0 |
| **7** | **PyPI downloads** | package registry | 38 known | 11 | ~4 h | ~3 |

### The details

**1. GitHub forks + freshness — the single biggest win, and it costs nothing extra.**

`scripts/backfill-stars.mjs` already runs a batched GraphQL query for `stargazerCount`. Adding
`forkCount`, `pushedAt` and `defaultBranchRef.target.committedDate` to the same aliased query is a
**field-list edit**, not a new request. Verified live:

```
gh api graphql -f query='{ a0: repository(owner:"firecrawl", name:"firecrawl-mcp-server"){
    stargazerCount forkCount pushedAt
    defaultBranchRef{ target{ ... on Commit { committedDate } } }
    pkg: object(expression:"HEAD:package.json"){ ... on Blob { text } } }
  rateLimit{ cost remaining limit } }'
→ stars 7368  forks 867  pushedAt 2026-09-01T23:11:11Z  npm name "firecrawl-mcp"
→ rateLimit { cost: 1, remaining: 4995, limit: 5000 }
```

**Cost = 1 point** for two repos *including* the package.json blob. At the existing BATCH=100, all 57,807
repos ≈ **580 points against a 5,000/hour budget**.

- Field: `forkCount` (int) → new `forks` percentile axis, **weight 0.7** (forks correlate with stars but
  measure a different act — copying, not bookmarking; it should never outweigh stars).
- Field: `pushedAt` (ISO-8601) → `age_days = now − pushedAt`, → new `freshness` percentile axis on
  `−age_days`, **weight 0.8**. This is the axis that finally separates the 8,124-row tie at 23.6, and it
  is the *only* proposed signal that reaches every kind (a repo, a file, a website, and a paper all have
  an age).
- Auth: GraphQL has **no anonymous tier** — a PAT is required. `gh` CLI auth already satisfies it, as the
  existing script proves. Rate: **5,000 points/hour**; note GitHub added an additional, deliberately
  undisclosed per-query resource cap on 2025-09-01, so keep BATCH at 100 and keep the existing
  parse-errors-alongside-good-rows handling.

**2. Per-file last-commit — the only honest signal for skills, subagents and rules.**

`GET /repos/{owner}/{repo}/commits?path={path}&per_page=1` → `[0].commit.committer.date`. REST budget is
5,000 requests/hour authenticated; 3,588 files is **one run under the free budget**. Feeds the same
`freshness` axis as signal 1, so no new weight is needed. This is what unblocks the 3,212 unranked sub-file
rows — and, unlike inherited stars, the number is genuinely the file's own.

**3. npm downloads — bulk-verified, but gated on name resolution.**

- Endpoint: `https://api.npmjs.org/downloads/point/last-week/{pkg1},{pkg2},…` — no key, no auth.
- **Batch cap measured empirically: 128 packages per request** (129 → HTTP 400). Verified with 128 real
  package names → HTTP 200. Scoped packages (`@scope/name`) are **not** supported in bulk mode — they need
  single calls.
- Field: `downloads` (int, per package, for the period).
- Rate limit: **undocumented by npm** (npm/feedback #658 is still open). The only published guidance is
  registry-wide: ~5M requests/month is "acceptable use". 57,807 packages ÷ 128 = **452 requests** — far
  inside any plausible limit.
- **The bottleneck is not the API, it is knowing the package name.** Only **110 of 64,638** brain notes
  contain an `npx`/`npm install` command (106 distinct names). The fix is signal 1's trick: pull
  `HEAD:package.json` in the *same* GraphQL request already being made (verified above, cost 1 point) and
  read `.name`. Coverage after that is unmeasured — measure it in the same run before committing to the
  weight.
- Axis: `downloads` percentile, **weight 1.0** (a download is a stronger use-claim than a star). It must be
  partitioned per H11, or npm's 87M-download scale will bury PyPI's.

**4. Wayback — for websites and registry listings that publish nothing.**

- `https://archive.org/wayback/available?url=…` returns only the snapshot *closest* to a timestamp; for
  true first/last use the CDX API: `https://web.archive.org/cdx/search/cdx?url=…&output=json&limit=1`
  with `sort=` to get either end.
- Field: 14-digit `timestamp` → first-seen (proxy for maturity) and last-seen (proxy for liveness).
- Rate: **undocumented for `/available`**; the sibling CDX endpoint throttles at ~60 req/min and IA
  firewall-blocks repeat offenders for an hour (doubling). Self-throttle to ~12–20 req/min → 3,236 rows
  ≈ 3 hours wall clock, unattended.
- **Do not rely on HTTP `Last-Modified` instead.** Measured on 25 real hosts taken from this catalog:
  24 responded 200, and only **7 sent `Last-Modified` (28%)**. (The web-wide figure is ~70% per the 2021
  Web Almanac — Armory's hosts are mostly dynamic SaaS/MCP endpoints, so they skew far worse.) Use it
  opportunistically as a free extra, never as the primary.
- Axis: feeds `freshness`. No new weight.

**5. Hugging Face — ready, but zero rows to apply it to.**

- `https://huggingface.co/api/models/{id}` and `/api/datasets/{id}` — **follow redirects** (`bert-base-uncased`
  307s to `google-bert/bert-base-uncased`). Verified: `downloads: 69,651,344`, `likes: 2,835`,
  `lastModified`. Datasets verified too (`squad` → 226,073 / 546).
- Bulk: no batch-by-ID endpoint, but `?sort=downloads&direction=-1&limit=N` lists in one call (verified).
- Rate: **500 requests / 5 min anonymous per IP; 1,000 / 5 min with a free `HF_TOKEN`.** Documented.
- Axis: `downloads` (shares the axis with npm/PyPI **only if H11's kind partitioning is fixed first**) and
  `likes` (→ folds into the `stars` axis as "a bookmark", same weight 1.0).
- **Gains 0 rows today.** Build the fetcher when HF artifacts are actually ingested, not before.

**6. Semantic Scholar — ready, zero rows, and anonymous access is unusable in practice.**

- `GET /graph/v1/paper/arXiv:{id}?fields=citationCount`; batch: `POST /graph/v1/paper/batch` with
  `{"ids":[…]}`, reported max **500 IDs/call**.
- **Anonymous returned HTTP 429 on every attempt during this audit** (single *and* batch, three tries with
  backoff). The documented anonymous allowance is a 1,000 req/s pool **shared globally by all
  unauthenticated callers** — i.e. contended, not allocated. A **free key gives a guaranteed 1 req/s**,
  which is lower on paper and far better in practice.
- Field: `citationCount` (int). Axis: `citations`, **weight 1.2** — matching `mentions`, because a citation
  *is* a practitioner mention with a stronger provenance.
- **Gains 0 rows today** — there is not one paper in the catalog. This is the signal to build when the
  answer to "can it rank a paper?" needs to be yes.

**7. PyPI — the weakest of the seven.**

- `https://pypistats.org/api/packages/{pkg}/recent` → `data.last_month`. **Returned HTTP 429 on the first
  anonymous call** during this audit, and again on retry.
- It is a **third-party community service** (`psf/pypistats.org`), not an official PyPI endpoint, with an
  undocumented IP limit, no batch endpoint, and data that refreshes only once a day. That is three
  dependency risks for a signal that today would reach **38 rows**.
- The real bulk path is the BigQuery public dataset `bigquery-public-data.pypi.file_downloads` (free tier
  1 TB/month). Worth it only once Python-packaged components are a meaningful share of the catalog.

---

## 4. Proposed weight table, and the rule for adding any signal

### Weights

| Signal | Now | Proposed | Reasoning |
|---|---:|---:|---|
| `mentions` | 1.2 | **1.2** | a human chose to write about it — the scarcest, most deliberate evidence |
| `citations` | — | **1.2** | a mention with a citation trail; same class of evidence |
| `downloads` | — | **1.0** | someone installed it. Stronger than a star, weaker than a person writing about it |
| `stars` | 1.0 | **1.0** | the baseline unit. Everything else is calibrated against it |
| `tested` | **1.4 → 1.0** ✅ | **1.0** | binary today (§H1). Raise only when `eval_score` becomes graded |
| `usage` | 0.9 | **0.9** | registry-reported, unaudited, single-source (§H7) |
| `freshness` | — | **0.8** | necessary, not sufficient — a fresh repo nobody uses is still nobody's tool |
| `forks` | — | **0.7** | correlated with stars; genuinely additional, but the weakest independent claim |

The ordering principle, stated so future weights are not arbitrary: **weight = how much deliberate human
intent the number encodes, discounted by how easy it is to fake.** A blog post about a tool (mentions,
1.2) is more intent than an install (downloads, 1.0), which is more than a star (1.0, but trivially
farmable so no premium), which is more than a self-reported registry counter (usage, 0.9).

### The rule for adding any signal

A signal is not "added" until **all six** of these are true. This is the checklist, in order:

1. **It is a public number with a citable source.** No estimates, no LLM judgements, no composite of other
   signals. If the source can't be linked from the row, it isn't a signal.
2. **It becomes its own percentile axis, partitioned by kind** (`percentiles(list, sig, kind)`), never a
   raw number merged into an existing axis. **Fix H11 before the first new signal lands**, or npm's 87M
   downloads will be percentile-ranked against PyPI's 2,000. Kinds with a pool under **n = 30** fall back
   to the global pool for that signal, and the row is flagged `thin_pool` so `/formula` can say so.
3. **It carries a plausibility ceiling enforced inside `percentiles()`**, not in a per-signal helper —
   H7 exists precisely because `STAR_CEILING` lived in `stars()` and the usage path never called it.
4. **It gets a weight from the table above, justified by the intent-vs-fakeability principle**, and the
   weight is committed in the same PR as the fetcher. A signal with no weight rationale is a signal with
   an arbitrary weight.
5. **It persists into the brain markdown.** `catalog.json` is *derived* — `ingest/catalog.mjs` rebuilds it
   from `brain/components/**/*.md` and **silently deletes anything not in its `FIELDS` map**. This has
   already destroyed live data twice (19,367 stars reverted in one rebuild; mentions 275 → 0 in another).
   So a new signal requires **three** edits, and missing any one of them loses the data on the next
   nightly run:
   - add the key to `FIELDS` in `ingest/catalog.mjs`
   - add the key to the `FIELDS` array in `scripts/persist-signals-to-brain.mjs`
   - write it into the frontmatter of the component note
6. **It appears on `/formula`.** The page's coverage cards, ladder and worked examples are all generated
   from the engine, so a new axis shows up automatically — but the signal needs a card entry in
   `cards[]` (`web/src/app/formula/page.tsx`) with its glyph, unit, weight and "who published it". A
   signal the public page doesn't explain is a black box, and the page's own closing line ("the formula
   and every signal are open") stops being true.

### How the evidence multiplier should treat a new signal

Today: `mult = 0.7 + 0.3 × min(ev,3)/3`, so ev1 = 0.8, ev2 = 0.9, ev3+ = 1.0.

Three amendments, in dependency order:

1. **Fix H2 first.** Adding signals to a formula where a second signal can *subtract* 19 points would make
   the ranking worse, not better — `freshness` reaches 57,807 rows and would land at a mediocre percentile
   for most of them, dragging down every well-starred repo it touches. **The max-plus-bonus rewrite is a
   prerequisite for §3, not a follow-up to it.**
2. **Count *independent* signals, not fields.** `forks` and `stars` both come from GitHub and both measure
   "GitHub users noticed this" — they should count as **one** unit of evidence, not two, or a repo gets a
   free multiplier bump for a number that tells us nothing new. Group signals by **source**
   (`github` = stars+forks+freshness · `registry` = usage · `package` = downloads · `community` =
   mentions+citations · `armory` = tested) and let `ev = distinct sources`. That keeps the multiplier
   honest and keeps its ceiling at a meaningful 3–4.
3. **Then, and only then, widen the ceiling.** With source-grouping, ev3 becomes genuinely reachable
   (a repo with stars + npm downloads + a blog mention), so `min(ev,3)` can become `min(ev,4)` and the
   0–100 range starts describing more than 5 rows.

---

## 5. The implemented change (T23)

**File:** `/Users/naman/armory/lib/rank.mjs` — one weight plus its comment. Nothing else touched.

```diff
-// signal → weight in the Universal blend (a measured test counts most, then community, then raw stars)
-const WEIGHTS = { tested: 1.4, mentions: 1.2, stars: 1.0, usage: 0.9 };
+// signal → weight in the Universal blend (community citation counts most, then stars, then registry usage).
+// `tested` sits at parity with stars, NOT above it, because today it is BINARY: eval_score is 1 or 0, so
+// every tool that passed lands on the same auto-p100 and a heavier weight would simply hand that one bit
+// the loudest voice in the blend — the top of the board becomes a wall of "verified" ordered by nothing
+// else. Raise this above 1.0 only once eval_score is a GRADED number that can separate two passing tools.
+const WEIGHTS = { tested: 1.0, mentions: 1.2, stars: 1.0, usage: 0.9 };
```

`node --check lib/rank.mjs` → **OK**. Not committed.

**Second file, same logical change** (§H12 — cleaning up the mess this change would otherwise create).
`web/src/app/formula/page.tsx` hard-codes its own copy of `WEIGHTS` to render the visible arithmetic.
Leaving it at 1.4 would have made the public page print a sum evaluating to **93.70** directly beside the
score **92.9** it displays. One number changed, plus a comment marking it as a mirror:

```diff
-const WEIGHTS: Record<string, number> = { tested: 1.4, mentions: 1.2, stars: 1.0, usage: 0.9 };
+// MUST mirror WEIGHTS in lib/rank.mjs — this copy only renders the visible arithmetic. If they drift,
+// the page prints a sum that does not equal the score beside it (see docs/FORMULA-AUDIT.md §H12).
+const WEIGHTS: Record<string, number> = { tested: 1.0, mentions: 1.2, stars: 1.0, usage: 0.9 };
```

The third copy (`web/lib/rank.mjs`) needs no edit — `web/scripts/copy-data.mjs` overwrites it from
`lib/rank.mjs` on every `prebuild`. It is committed anyway, so `git grep WEIGHTS` currently shows a stale
1.4 there until the next build; §H12's real fix is to export the constant once and gitignore the copy.

### Effect

| Measure | Before | After |
|---|---:|---:|
| Ranked rows | 28,530 | **28,530** (unchanged) |
| Rows with a `✓ verified` badge | 60 | **60** (unchanged — identical row indexes) |
| Rows whose score changed | — | **36** (only rows carrying `tested` can move) |
| Largest score drop / rise | — | **−4.5 / 0.0** |
| Highest score in the catalog | 93.7 | **92.9** |
| `tested` rows in the top 25 | **25** | **24** |
| `tested` rows in the top 100 | **55** | **52** |
| `tested` rows in the top 500 | 55 | 55 |
| Top-100 membership churn | — | 3 in, 3 out |

Entered the top 100: `mindsdb-mindsdb`, `mindsdb`, `bytedance-search`. Left: `agent-browser`, `daytona`,
`modal`.

**Top 25, before → after** (`<>` marks a changed name at that rank):

| # | Before | | | After | | |
|---:|---|---:|---:|---|---:|---:|
| 1 | browser-use | 93.7 | 110,299★ | browser-use | **92.9** | 110,299★ |
| 2 | supabase | 92.2 | 2,707★ | supabase | **91.2** | 2,707★ |
| 3 | playwright-cli | 90.0 | 95,026★ | playwright-cli | 90.0 | 95,026★ |
| 4 | tmux | 90.0 | 48,787★ | tmux | 90.0 | 48,787★ |
| 5 | cli-anything | 90.0 | 48,015★ | cli-anything | 90.0 | 48,015★ |
| 6 | gh | 90.0 | 45,963★ | gh | 90.0 | 45,963★ |
| 7 | chrome-devtools | 90.0 | 41,753★ | chrome-devtools | 90.0 | 41,753★ |
| 8 | duckdb | 90.0 | 40,557★ | duckdb | 90.0 | 40,557★ |
| 9 | zellij | 90.0 | 35,080★ | zellij | 90.0 | 35,080★ |
| 10 | github-mcp | 89.9 | 32,462★ | github-mcp | 89.9 | 32,462★ |
| 11 | cmux | 89.9 | 26,392★ | cmux | 89.9 | 26,392★ |
| 12 | genai-toolbox | 89.9 | 15,335★ | genai-toolbox | 89.9 | 15,335★ |
| 13 | glips-figma-context | 89.9 | 14,872★ | glips-figma-context | 89.9 | 14,872★ |
| 14 | e2b-sandbox | 89.8 | 13,531★ | e2b-sandbox | 89.8 | 13,531★ |
| 15 | idosal-git-mcp | 89.8 | 8,095★ | idosal-git-mcp | 89.8 | 8,095★ |
| 16 | firecrawl-mcp | 89.8 | 7,308★ | firecrawl-mcp | **89.7** | 7,308★ |
| 17 | xcodebuild | 89.7 | 5,748★ | xcodebuild | 89.7 | 5,748★ |
| 18 | peekaboo | 89.7 | 5,036★ | peekaboo | **89.6** | 5,036★ |
| 19 | printing-press | 89.7 | 4,531★ | printing-press | **89.6** | 4,531★ |
| 20 | wrangler | 89.7 | 4,464★ | wrangler | **89.6** | 4,464★ |
| 21 | container-use | 89.6 | 4,015★ | container-use | **89.5** | 4,015★ |
| 22 | opentelemetry | 89.6 | 3,447★ | opentelemetry | **89.5** | 3,447★ |
| 23 `<>` | tavily-search | 89.4 | 2,016★ | **github** | 89.3 | 4,094★ · 121 mentions |
| 24 `<>` | stripe-agent-toolkit | 89.4 | 1,760★ | tavily-search | 89.3 | 2,016★ |
| 25 `<>` | stripe-mcp | 89.4 | 1,760★ | stripe-agent-toolkit | 89.2 | 1,760★ |

The biggest individual movers are the three MCP servers with **no stars at all**, which were riding the
`tested` bit hardest: `linear-mcp`, `notion-mcp`, `posthog-mcp` all go **65.2 → 60.7 (−4.5)**. The single
failed row (`zapier-mcp`, `eval_score: 0`) does not move.

### Honest read of this change

It is correct and it is not enough. `github` — 4,094 stars and **121 mentions**, the highest mention count
in the catalog and untested — finally entered the top 25 at #23. But 24 of the top 25 still carry the
`tested` bit, because the problem was never mainly the weight: it is that **a pass auto-lands at p100**,
the highest value any axis can emit. The proof is the counterfactual in §H1 — remove `tested` entirely and
the top 25 keeps only **3 of its 25 names**.

**The weight change removes the thumb from the scale. Grading `eval_score` removes the scale from the
thumb.** Do that next, together with the H2 max-plus-bonus rewrite, before adding any signal from §3.

---

## Fix order (dependency-correct)

| Order | Fix | Hole | Effort | Why this position |
|---:|---|---|---|---|
| 1 | Dedupe on normalised URL, and pool percentiles by distinct URL | H6 | ½ day | Every percentile in the catalog is currently computed against duplicates. Fix the input before tuning the function. |
| 2 | Plausibility ceiling inside `percentiles()` | H7b | 3 lines | Trivial, and it must exist before new axes are added. |
| 3 | Partition percentiles by kind, with an n≥30 fallback | H11 | ½ day | Every §3 signal inherits this bug if it lands first. |
| 4 | Max-plus-bonus (or floor) so a 2nd signal can't subtract | H2 | ½ day | Prerequisite for §3 — `freshness` would otherwise *lower* 57,807 rows. |
| 5 | GitHub forks + `pushedAt` + `package.json` in the existing query | §3.1 | 1 h | Biggest coverage win in the audit; free; unblocks H3 and H9. |
| 6 | Per-file last-commit for sub-file rows | §3.2, H5 | 2 h | The only honest signal for skills/subagents/rules. |
| 7 | Grade `eval_score` | H1b | 1 day | Removes the auto-p100. |
| 8 | Percentile-of-log for count signals | H4 | ½ day | Only worth doing once the pools are clean and partitioned. |
| 9 | npm downloads via resolved package names | §3.3 | 4 h | Depends on 3 and 5. |
| 10 | `dir=asc` comparator; `stars: 0` semantics; split `usage` from `stars` | H10, H8, H7a | 1 day | Correctness cleanup, no dependencies. |

---

## Files referenced

| Path | Role |
|---|---|
| `/Users/naman/armory/lib/rank.mjs` | the engine — **the one change in this audit** |
| `/Users/naman/armory/web/src/app/formula/page.tsx` | the public explanation; §03's "evidence beats popularity" is contradicted by H2 |
| `/Users/naman/armory/docs/DATA-SCHEMA.md` | claims "percentile within its own kind" — see H11 |
| `/Users/naman/armory/ingest/catalog.mjs` | `FIELDS` map — a signal missing here is deleted nightly (rule §4.5) |
| `/Users/naman/armory/scripts/backfill-stars.mjs` | extend its GraphQL field list for §3.1 — no new requests |
| `/Users/naman/armory/scripts/fix-inherited-stars.mjs` | correctly un-inherited sub-file stars; H5 is the missing follow-through |
| `/Users/naman/armory/scripts/persist-signals-to-brain.mjs` | second required edit for any new signal (rule §4.5) |
| `/Users/naman/armory/catalog.json` | 64,638 components, the audited snapshot |

---

## Rulings — main loop (chief architect), 2026-09-01

The audit stands. These are the decisions that turn it into the next engine version (implemented by the formula lane; all must persist to brain markdown and survive a rebuild):

1. **Monotone scoring — a signal can never subtract (H1, prerequisite for everything else).** New blend:
   `universal = 0.8 × base + 0.2 × others`, where `base` = the row's strongest percentile (any signal) and `others` = the weight-averaged percentile of every *additional* signal (0 if none). One signal caps at 80 as today; the second and third can only add. Worked: superpowers 276,813★ (p100) + 1 mention (p40.4) → 80 + 0.2×40.4 = **88.1** (was 60.7, single-signal 80.0). supabase p100/p98/p77.8 → **97.4**; browser-use p100/p100/p81.1 → **97.9**; everything-claude-code p100 alone → **80**. "Evidence beats popularity" is now true by construction, and popularity *plus* evidence beats either alone.
2. **Percentile pools are per (signal, kind) and per distinct URL (H3, H4).** `kindOf(row)`: github-root · github-file · registry · website · package · paper · hf. Rows sharing a URL are pooled once and receive identical percentiles; the clean pass (T55) also syncs signals across same-URL rows (max) so `witness-protocol` can't score 1.3 and 73.0 at once.
3. **`tested` stays ×1.0 and remains one bit until it is graded** — with monotone scoring a p100 test no longer manufactures the whole board on its own (it is *base* for 60 rows, others still count). Grading (0–1 from real usage) is the next signal change, not today's.
4. **Add `forks` as a popularity signal (weight 0.8), GitHub-root rows only**, fetched in the same GraphQL call as stars (rate-limit cost unchanged). **Add `pushed_at` as metadata + tiebreak + a `Stale` flag (no push in 24 months), NOT as a score-bearing signal** — recency proves a repo is alive, not that anyone uses it; a fresh 0-star repo must not outrank a 100-star one. The 8,124-row tie at 23.6 breaks on freshness; blank rows stay honestly blank and sort by freshness among themselves.
5. **`usage` keeps no ceiling** (registry counters legitimately reach millions) but is pooled per kind (registry) so it never competes with stars.
6. **One source of truth for weights**: `lib/rank.mjs` exports `WEIGHTS`; `/formula` imports it (no mirrored copies, H12). The page's card labels read the same object.
7. Not now: HF and Semantic Scholar (0 rows to gain), PyPI (38 rows, rate-limited third party), npm downloads (110 rows — revisit once `package.json` names are harvested alongside forks).

---

## Implemented — engine v2 (2026-09-01, formula lane)

All seven rulings are in. **Not committed, not deployed.** Every number below was produced by importing
`computeRows` from `lib/rank.mjs` and running it over the same `catalog.json` this audit measured
(`generated_at 2026-09-01T12:23:20Z`, 64,638 components), against a snapshot of the pre-change engine.

### What changed, by file

| File | Change |
|---|---|
| `lib/rank.mjs` | monotone blend · `kindOf()` · per-(signal, kind) × distinct-URL pools · `forks` signal · `pushed_at`/`stale` · new tiebreak · `WEIGHTS` + `BLEND` + `kindOf` exported · `kind`/`forks`/`pushed_at`/`stale`/`type`/`evidence` on `flat()` · `popular` sort = `usage ?? stars` · `kinds`+`stale` in `facetsOf` |
| `scripts/backfill-stars.mjs` | GraphQL selection → `stargazerCount forkCount pushedAt`; writes `forks` + `pushed_at` (forward-only); a row is "asked" only once it carries **both** numbers |
| `scripts/persist-signals-to-brain.mjs` | `FIELDS += forks, pushed_at`; ISO dates written **quoted** (bare `2026-09-01T…` is a YAML timestamp, not a string) |
| `ingest/catalog.mjs` | `FIELDS += forks: null, pushed_at: ""` + the destructive-list warning |
| `web/src/app/formula/page.tsx` | imports `WEIGHTS`/`BLEND` from the engine (H12 mirror **deleted**); renders the new blend; forks card; ladder restricted to one kind; Stale note; buckets keyed on the engine's own `kind` |
| `docs/DATA-SCHEMA.md` | `forks` · `pushed_at` · `kind` · `stale` · the blend · the three-edit rule |

### The blend

```
universal = 0.8 × base + 0.2 × others
  base   = strongest percentile the row holds (any signal); ties → heavier weight
  others = Σ(pct × weight) ÷ Σ(weight) over every OTHER signal   (0 if none)
```

`WEIGHTS = { tested: 1.0, mentions: 1.2, stars: 1.0, usage: 0.9, forks: 0.8 }` · `BLEND = { base: 0.8, others: 0.2 }`.

### Before → after

| Measure | Before | After |
|---|---:|---:|
| Ranked rows | 28,530 | **28,530** (0 gained, 0 lost) |
| Rows with a `✓ verified` badge | 60 | **60** (identical row indexes — 0 lost, 0 gained) |
| Highest score in the catalog | 92.9 | **100.0** |
| Rows **penalised** for holding a 2nd signal (score < 0.8 × best pct) | **96** | **0** |
| Multi-signal rows (ev ≥ 2) that rose / fell | — | **182 rose / 1 fell** of 183 |
| Ranked rows that rose / fell / held | — | 27,314 / 1,134 / 82 |
| Max single-row drop | — | **−68.2** (all explained below) |
| Same-URL groups with **divergent** scores | 965 (2,152 rows) | **97 (305 rows)** |
| Distinct score values | 539 | 542 |
| Biggest single tie | 8,124 rows @ 23.6 | 8,096 rows @ 23.8 |
| Rows in a ≥100-way tie | 22,770 | 22,636 |
| `tested` rows in top 25 / 100 / 500 | 24 / 52 / 55 | **25 / 50 / 59** |
| Top-100 membership churn | — | 38 in, 37 out |

Top-100 entrants are exactly the H2 victims — `superpowers`, `markitdown`, `ruflo`, `langfuse`, `opik`,
`linear-mcp`, `notion-mcp`, `context7`. Departures are single-signal p100 rows now correctly capped at
80 (`everything-claude-code`, `math-mcp`, `agentdial`, `zapier-mcp`, and six `modelcontextprotocol-*`
reference servers).

**Top 25 after** — every row is `github-root`, every row holds two signals:

| # | name | score | ev | ★ | note |
|---:|---|---:|---:|---:|---|
| 1–9 | playwright-cli · tmux · cli-anything · gh · chrome-devtools · duckdb · zellij · github-mcp · cmux | **100.0** | 2 | tested p100 + stars p99.9–100 |
| 10–19 | genai-toolbox · glips-figma-context · e2b-sandbox · idosal-git-mcp · firecrawl-mcp · xcodebuild · peekaboo · printing-press · wrangler · container-use | 99.9 | 2 | |
| 20–25 | opentelemetry · tavily-search · stripe-agent-toolkit · stripe-mcp · flyctl · coinbase-agentkit | 99.8–99.7 | 2 | |

### The three worked cases from ruling 1

| row | signals (percentile) | before | after | ruling predicted |
|---|---|---:|---:|---:|
| `superpowers` | stars p100 · mentions p43.1 | 60.7 | **88.6** ✅ ≥80 | 88.1 |
| `supabase` | tested p100 · stars p84.4 · mentions p75.0 | 91.2 | **95.9** | 97.4 |
| `browser-use` | tested p100 · stars p100 · mentions p82.8 | 92.9 | **98.1** | 97.9 |

The small gaps against the ruling's arithmetic are **ruling 2 acting on ruling 1's inputs**, not an
error in the blend: percentiles moved when the pools were partitioned. `mentions` p40.4 → p43.1 (the
pool is now the 174 distinct github-root URLs, not all 275 rows across four kinds). `supabase` is
`kind = github-file`, so its 2,707 stars are now ranked against the 321 other files that carry stars —
a pool whose median is 43 and whose p90 is 4,094 — giving p84.4 instead of the p98.6 it got when it was
ranked against 25,235 repos whose median is 3. That is the correction H11 asked for, working.

Also: `github` (4,094★ + 121 mentions, the highest mention count in the catalog, untested) goes
89.3 → **98.0** and is the only untested row near the top. `markitdown` 60.7 → 88.6. `math-mcp`
(2,058,825 registry "usage", uncapped per ruling 5) stays at exactly **80.0** — one signal, no
corroboration, hard ceiling.

### Every drop, explained

1,134 rows fell; 585 fell by more than 5 points. Every one is a *correction*, in one of two classes:

| rows | cause | worked example |
|---:|---|---|
| **280** | **same-URL dedup, first-row-wins.** The group now scores on the value the *first* crawl recorded. | `delx-mcp-server-2…5`: 71.4 → **3.2** (−68.2). Five rows, one Smithery URL; the first row carries usage **243**, the other four carry **7,279**. |
| **305** | **kind partitioning.** 293 `github-file`, 10 `website`, 2 `registry`. | `agentdesk-workflows`, 54★ inside a repo: p88.6 among *all repos* (median 3★) → **p51.4** among *other files* (median 43★), so 70.9 → **41.1**. `paypal-agent-toolkit`, 188★: p94.5 → p57.6, 75.6 → **46.1**. |
| 549 | pool reshaping under 5 points (deduping removed **2,033** duplicate values from the 27,589-row stars pool, so every percentile shifted a fraction) | a 1★ row: 23.6 → 23.8 |

**`witness-protocol`, as requested** — the group now scores identically, which was the point:

| row | raw `stars` field | before | after |
|---|---:|---:|---:|
| witness-protocol | 270 | 1.3 | **5.8** |
| witness-protocol-2 / -3 / -4 / -5 | 7,828 | 73.0 | **5.8** |

⚠️ **The value the group converged on is the stale one.** 536 same-URL groups (1,166 rows) have a first
row that understates the group; the worst are `gahmen-mcp` (first 2★, max 14,459★), `bgg-mcp` (43 vs
9,919), `ddg_search` (usage 2,823 vs 12,697). The instruction specified first-row-wins and ruling 2
says the **T55 clean pass syncs same-URL signals by `max`** — once that lands, first == max and these
280 rows land on the right number with no further engine change. Until then the engine is deliberately
conservative here. If T55 slips, the one-line alternative is `pool.byUrl.set(k, Math.max(prev, v))` in
`percentiles()`.

### Three things the rulings did not cover (flagged, not silently decided)

**1. Thin pools.** Partitioning creates 13 pools, of which **6 hold fewer than 30 distinct URLs**:
`mentions|website` 26 · `mentions|registry` 15 · `tested|website` 9 · `tested|github-file` 4 ·
`tested|registry` 2 · `usage|package` **1**. Audit §4-rule-2 proposed an n ≥ 30 fallback to the global
pool plus a `thin_pool` flag; the rulings did not order it, so it is **not implemented**. Cost today:
`codeforces-mcp-server` is the sole member of `usage|package`, so it is p100 by definition and goes
**12.2 → 80.0**. That is the only materially wrong row; the rest are small pools of genuinely similar
things. One row, one decision — say the word and it is ~6 lines.

**2. `forks` counts as independent evidence.** Audit §4 proposed grouping signals by *source* so
stars + forks count as **one** unit (both are "GitHub users noticed this"). The rulings kept
`evidence = count of signals`, so a repo with stars + forks will read `ev2`. Evidence no longer
multiplies the score — it is only a tiebreak — so the blast radius is ordering, not scoring. Worth a
decision before the badge on the site says "2 independent signals".

**3. The blend is monotone in `base`, not in the *number* of signals.** `universal ≥ 0.8 × base` always
(verified: **0 violations across all 28,530 ranked rows**), so H2 is genuinely dead. But because
`others` is an *average*, a weak third signal can still pull a multi-signal row down — it just can
never take it below its base-alone score. Measured live on 100 real repos: adding `forks` moved 90 rows
up and **21 down**; the clean cases are `zellij` 100 → 93.4 (forks p26.3) and `glips-figma-context`
99.9 → 93.1 (forks p22.2). *That sample overstates it* — its forks pool was 100 head repos. On a random
296-repo sample the median |p(stars) − p(forks)| is **9.1 points**, i.e. a typical real effect of
**±0.9 points**. If a strictly-monotone-in-signals score is wanted, `others = max(rest)` or the audit's
capped max-plus-bonus (§H2 option 1) both deliver it; the current shape is what ruling 1 specifies.

### The new signal: measured, not assumed

Verified live on 2026-09-01 with the shipped query.

- **Cost is unchanged.** 100 repos with `stargazerCount forkCount pushedAt` → `rateLimit { cost: 1 }`.
  Dry run on a 100-repo sample: 99 answered (1 repo renamed away), **88 had >0 forks**, **99 returned
  `pushedAt`**, 156 catalog rows would be filled.
- **Forks will reach about half the repo roots, not all of them.** On a random 296-repo sample,
  **48.0% have zero forks** and therefore get no forks signal — honestly blank, as designed.
- **ρ(stars, forks) = 0.456** (Spearman, n=296). Forks are genuinely additional information, not a
  restatement of stars — which is the case for adding the axis at all, and also why the ±0.9-point
  dilution above exists.
- **`Stale` will flag almost nothing today.** Same sample: days since last push — median 82, p75 241,
  p90 409, **max 636**. At the 24-month threshold, **0 of 296** rows qualify. The threshold is right for
  the definition; the value is in the *tiebreak*, where the spread is real (48% older than 3 months,
  15.9% older than 12), not in the flag. Revisit the flag once the catalog ages, or say so on `/formula`
  — which it now does, live from the data.

### `/formula` — the H12 mirror is gone

`page.tsx` now does `import { computeRows, WEIGHTS, BLEND } from "…/lib/rank.mjs"`. The hand-typed
`WEIGHTS` literal is deleted, and so is the stale `weight: 1.4` that was still hard-coded in the
`tested` signal card even after §5 fixed the engine. Card weights, the §03 lead ("0.8 … 0.2 … caps at
80"), and §04's arithmetic all read the same two objects.

The engine now hands the page `scores.pct` (percentile per signal), `scores.base` (which signal is the
strongest) and `scores.others`, so the page *formats* the engine's own numbers instead of recomputing
them. Verified across **all 28,530 ranked rows: 0 rows where the printed sum disagrees with the printed
score**; maximum display gap 0.05, which is the final one-decimal rounding and is stated in the §04
lead. Two further page fixes fall out of ruling 2: the §02 ladder is restricted to `github-root` (its
rungs came from two different pools the moment stars were partitioned), and §05's coverage buckets now
key on the engine's own `kind` instead of a second copy of the URL regex.

### Three consumer-facing additions to `flat()` / the sort axes

Requested by the main loop alongside the rulings; none of them touches a score.

| # | Change | Why |
|---:|---|---|
| 1 | `flat().type` — the **raw** catalog type (`"mcps"`, `"clis-tools"`) beside the normalized `component` (`"mcp"`, `"cli"`) | `/e/[type]/[slug]` is addressed by the raw folder name (`catalog.ts` matches `e.type === type`), so pages can link to the internal detail route instead of only the external URL |
| 2 | `flat().evidence` — the signal count | `/api/rank` was dropping it and the leaderboard was re-deriving it client-side, which is a second copy of engine logic |
| 3 | `sort=popular` → `usage ?? stars` (was: `stars`, byte-identical to `sort=stars`) | the site labels that column "Usage"; on stars alone every registry listing sank to the bottom of its own axis. `sort=stars` is unchanged. |

Verified: `sort=popular` now interleaves kinds — `math-mcp` 2,058,825 used · `pipeworx-gateway` 419,019
used · `superpowers` 276,813★ · `everything-claude-code` 242,698★ · `sparkforge-2` 219,896 used —
while `sort=stars` still returns `superpowers` · `everything-claude-code` ·
`karpathy-coding-discipline`. `flat()` row keys are now: `name, type, component, domain, vertical, url,
license, kind, universal, evidence, primary, verified, signals, stars, usage, tested, mentions, forks,
pushed_at, stale, desc`.

### Verification run

| Check | Result |
|---|---|
| `node --check` on all 5 touched `.mjs` | OK |
| `cd web && npx tsc --noEmit --incremental false` | exit 0, no output (`--listFiles` confirms `formula/page.tsx` is in the program) |
| `universal ≥ 0.8 × best percentile`, all ranked rows | **0 violations**; max score seen 100.0 |
| printed sum == printed score, all ranked rows | **0 mismatches** |
| `✓ verified` badge set | identical, 60 → 60 |
| `backfill-stars.mjs --limit 100 --refresh` (DRY RUN) | 1 GraphQL point; 99/100 answered; forks 0 → 106 rows, pushed_at 0 → 156 rows |
| `persist-signals-to-brain.mjs` (DRY RUN) | lists `forks` and `pushed_at`; 0 updates (catalog has none yet — nothing written) |
| markdown → persist → `parseFrontmatter` → `computeRows` round-trip | `forks: 12312` reads back as a **number**, `pushed_at: "2026-09-02T02:37:16Z"` as a **string**; idempotent on a second pass |
| `rankRows` / `leaderboard` / `facetsOf` end-to-end | `kind`, `forks`, `pushed_at`, `stale` on every flat row; `facets.stale` and `facets.kinds` present |

### The full backfill (for the main loop to schedule)

```bash
cd /Users/naman/armory
node scripts/backfill-stars.mjs --refresh --apply          # ~55,106 repos ÷ 100 = ~552 GraphQL
                                                            # points against 5,000/hr — one run
node scripts/persist-signals-to-brain.mjs --apply           # MANDATORY, or the next rebuild deletes it
node ingest/catalog.mjs                                     # rebuild; confirm forks/pushed_at survive
```

Sample first with `--limit 500 --refresh` (no `--apply`). The middle step is not optional: skipping it
is exactly the bug that has already destroyed live data three times.



## Ruling — mentions credit by URL only (2026-09-01, main loop)

The first live look at the Sentinel feed showed the mentions signal was almost entirely name matching:
"Claude Code" ×419 had landed on a docs-page row, "Codex" ×175 on a third-party skill, "MCP" ×112 on a
random mcp.so server named `mcp`, "GitHub" ×143 on the github MCP server, "Hermes" ×50 on a boilerplate
repo. A name that happens to equal a catalog slug is almost never that row, and a platform name is not a
tool citation. So:

- A mention credits a row **only through a URL** — cited in the note, or confirmed by Sentinel's
  resolver (exact repo slug + relevant description + ≥50★ + not on the ambiguous-name list).
- `emit_to_armory.py` has no slug fallback any more; name-only rows go to `unresolved` for the resolver.
- `ingest-sentinel-feed.mjs --apply --reset` re-baselined every row to the URL-credited count (348 rows
  went back to null; 2 kept a real citation). The resolver is running over all ~2,400 unresolved names so
  confirmed repos earn their mentions back on the next nightly, monotone as before.
- New rows need a GitHub repo URL (that is where their stars and forks come from); unknown stars are
  fetched before the 100★ floor is applied. A product URL alone never admits a row.

The weight (1.2) is unchanged: it was right for what the signal claims to be, and the signal now is that.

## Closure — kind × signal matrix (T21/T22, 2026-09-01, main loop)

| kind (by source URL) | rows today | signals it can carry | status |
|---|---|---|---|
| github-root | ~52k | stars · forks · pushed_at · mentions (URL) · tested | **live** (forks new this run: 17,081 rows) |
| github-file (a rule / skill / agent inside a repo) | ~3.3k | mentions (URL) · tested — never the parent's stars | live; honestly blank until it earns its own |
| registry (mcp.so · smithery · pulsemcp) | ~2.4k | usage (their install counter) · mentions | live |
| package (npmjs · pypi) | 3 | weekly downloads (free APIs) | **not built — 3 rows; revisit when packages are ingested** |
| paper (arxiv) · hf (models/datasets) | 0–1 | citations (Semantic Scholar) · HF downloads | not built — no rows |
| website / docs page | ~1k | mentions (URL) · last-modified | mentions live; freshness not built (no ranking value: `pushed_at` is a tiebreak only) |

Ruling: one new free signal shipped and persisted (forks); every other cell is either live or has no
rows to apply to. Add a kind's signal the day that kind has rows — not before.
