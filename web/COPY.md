# Armory — Copy Contract

The enterprise-lingo contract for every user-facing string in `src/app/**/page.tsx` and
`src/components/*.tsx`. Built by grepping the current build. Written so a **swarm can apply it
mechanically** and a **reviewer can audit a diff against it**.

Design rationale: [`../design/BRIEF.md`](../design/BRIEF.md). **Gate: apply only after the brief is approved.**

The owner's rule, verbatim: *"no sentences, classic enterprise app lingo — 'Duration' not 'when the
date moves', 'Resources' not 'what do we contain'."*

---

## 1. Rules

| # | Rule | Test |
|---|---|---|
| R1 | **Labels are nouns, not sentences.** No verb-phrase or clause as a label. | Does it have a subject and a verb? Reject. |
| R2 | **≤3 words per label**, ≤6 for a page title. | Count words. |
| R3 | **Title Case for labels**, column heads, buttons, chips, tabs. Sentence case for the one lead line and body prose. | |
| R4 | **No terminal punctuation in a label.** No `.` `?` `!` on any heading, column head, chip, or button. | `grep` for `\.\"` in a heading. |
| R5 | **Numbers first.** `63,788 Components`, never `We have 63,788 components`. | |
| R6 | **No first person.** Ban `we`, `our`, `us`, `I`, `you`, `your` in labels and headings. Permitted only inside the formula's method prose (§4C). | `grep -iE '\b(we|our|us|your)\b'` |
| R7 | **No marketing adjectives.** Ban `every`, `all`, `only`, `simply`, `just`, `beautiful`, `powerful`, `world's first`, `best-in-class`. | |
| R8 | **One lead line per page**, ≤14 words, sentence case, no period if it is a fragment. Everything else is a label or a value. | |
| R9 | **Label + value, always paired.** Never a bare value, never a bare ID. `Licence  MIT`, not `MIT`. | |
| R10 | **One metaphor: the armory.** Ban `brain`, `synapse`, `recall`, `memory chip`, `region`, `vault`, `forming`. | `grep -iE 'brain\|synapse\|recall\|region'` |
| R11 | **Units and dates are explicit.** `Updated 2026-08-23`, never a bare date. ISO in `<time datetime>`. | |
| R12 | **Empty states: label + ≤12-word cause + ≥1 action.** Never a bare void, never an apology. | |
| R13 | **British/US spelling: US.** `License` (the field), `behavior`, `catalog`. | |
| R14 | **Placeholders are examples, not instructions.** `browser automation`, not `Ask for any tool…`. | |

---

## 2. Approved lexicon

The canonical nouns. **Use these exact strings; do not invent synonyms.**

**Entity:** `Component` · `Name` · `Source` · `License` · `Maturity` · `Version` · `Author` · `Repository`
**Taxonomy:** `Domain` · `Vertical` · `Category` · `Type` · `Tag`
**Ranking:** `Score` · `Rank` · `Signals` · `Coverage` · `Percentile` · `Weight` · `Calculation` · `Confidence`
**Signals (fixed order):** `Tested` · `Mentions` · `Stars` · `Usage`
**Action:** `Install` · `Copy` · `Copied` · `Export` · `Search` · `Filter` · `Sort` · `Reset` · `Open` · `Report` · `Contribute`
**State:** `Loading` · `No Results` · `Not Indexed` · `Unmeasured` · `Selected` · `Stable` · `Preview` · `Experimental`
**Time:** `Updated` · `Indexed` · `Duration` · `Last Run`
**Aggregate:** `Total` · `Ranked` · `Results` · `Resources` · `Count`
**Surfaces:** `Leaderboard` · `Browse` · `Ask` · `Formula` · `Detail` · `Status` · `Timeline` · `Harness`

**Never:** `Universal` (unqualified — say `Score`) · `Top Signal` (say `Signals`) · `Building Block`
(say `Component`) · `Shelf` · `Slice` (say `Filter`) · `Gear Up` · `The Index` (say `Catalog`).

---

## 3. Global — nav, footer, chrome

| File | Banned | Replacement | Rule |
|---|---|---|---|
| `site-footer.tsx` | `The Armory of agent harness components.` | `Ranked catalog of open-source agent components` | R1, R8 |
| `site-footer.tsx` | `Explore` / `Build` (column heads) | `Catalog` / `Developers` | R1 |
| `site-footer.tsx` | `Source · GitHub` | `Source` | R2 |
| `site-nav.tsx` | `Ask` (nav) | `Ask` — keep | ✓ |
| `layout.tsx` | any `— Armory` suffix pattern | `<Page> · Armory` | consistency |
| all | `loading the index…` | `Loading 63,788 components…` | R5, R12 |
| all | `Couldn't load: {err}` | `Load Failed` + `{err}` on a second line + `Retry` | R12 |

---

## 4. Page by page

### A. Home — `app/page.tsx`

| Banned | Replacement | Rule |
|---|---|---|
| `not an aggregator for humans` (badge) | **Delete.** A negation is not a label. | R1, R7 |
| `Where agents gear up.` (h1, 5.75rem serif) | `Armory` + lead: `Ranked catalog of 63,788 open-source agent components` | R1, R4, R8 |
| `The ranked index of every open-source building block for the agent stack — crawled, scored and kept current by agents.` | **Delete.** Replaced by the lead above. | R2, R7, R8 |
| `See the leaderboard` (button) | `Leaderboard` | R2, R3 |
| `Browse the catalog` (link) | `Browse` | R2 |
| `ranked` / `categories` / `last indexed` (stat labels) | `Ranked` / `Categories` / `Indexed` | R3 |
| `Twelve regions of the brain.` (h2) | `Categories` | R1, R4, R10 |
| `how it's built` (eyebrow) | `Pipeline` | R1, R3 |
| `One vault. One catalog. Three ways to recall it.` (h2) | `Sources` | R1, R4, R10 |
| `the map` (eyebrow) | **Delete** (redundant with the heading) | R2 |
| `How the pieces connect.` (h2) | `Dependencies` | R1, R4 |
| `How the index grew` (link) | `Timeline` | R2 |
| `The graph forms as components are indexed.` (empty) | `No Dependencies` + `Indexing in progress` | R10, R12 |
| `quickstart` (eyebrow) | **Delete** | R2 |
| `Recall from the terminal.` (h2) | `Install` | R1, R4, R10 |

### B. Leaderboard — `app/leaderboard/page.tsx`

| Banned | Replacement | Rule |
|---|---|---|
| `The Leaderboard` (h1) | `Leaderboard` | R7 (`The`) |
| `One Universal rating for every open-source building block.` | `Every component scored on four independent signals` | R7, R8 |
| `How the score works →` | `Formula` | R2 |
| `every component` / `every domain` / `every vertical` (select defaults) | `Component` / `Domain` / `Vertical` — as **chips with counts** | R1, R7 |
| `Universal score` (sort) | `Score` | R2 |
| `Most popular` / `Best tested` / `Practitioner pick` / `Most stars` | `Usage` / `Tested` / `Mentions` / `Stars` | R1, R7 |
| `A–Z` | `Name` | R1 |
| `Export CSV` | `Export` | R2 |
| `{n} in {slice} · of {total} total` | `{n} Results · {total} Total` | R1, R5 |
| `everything` (slice fallback) | `All` — or omit the clause entirely | R7 |
| `#` (th) | `Rank` | R1 |
| `universal` (th) | `Score` | R2, R3 |
| `name` (th) | `Component` | R3 |
| `top signal` (th) | `Signals` — **all four rendered**, never one + a tooltip | R1, brief §9 |
| `component` (th) | `Type` (avoids colliding with `Component` = name column) | R3 |
| `domain` (th) | `Domain` | R3 |
| — (missing) | **Add `Install` column** | brief §2 J3 |
| `✓ verified` badge (on ~every row) | **Delete the badge.** Fold into `Signals` → `Tested` slot. | brief §10.6 |
| `we installed + measured this` (title attr) | `Tested` slot label: `Tested` + value. No tooltip-only facts. | R6, brief §1.1 |
| `{n} mentioned` / `{n} used` / `verified` | `{n} Mentions` / `{n} Installs` / `Tested` | R1, R5 |
| `no measured signals yet` | `Unmeasured` | R2 |
| `nothing in this slice yet` | `No Results` + `Reset Filters` | R12 |
| `✓ tested (n%)` | `Tested {n}%` | R11 |

### C. Formula — `app/formula/page.tsx`

The **method prose is exempt from R6/R8** — an explanation of arithmetic may use sentences. The
**headings, eyebrows, labels and column heads are not.**

| Banned | Replacement | Rule |
|---|---|---|
| `One score for 63,788 very different things.` (h1) | `Formula` + lead: `One score across four independent signals` | R1, R4 |
| `THE FORMULA` (eyebrow) | **Delete** (duplicates the h1) | R2 |
| `A signal is a public number that proves people use it.` (§01) | `Signals` | R1, R4 |
| `Raw numbers don't compare. Ranks do.` (§02) | `Percentiles` | R1, R4 |
| `Evidence beats popularity.` (§03) | `Confidence` | R1, R4 |
| `The whole thing, on real rows.` (§04) | `Worked Examples` | R1, R4 |
| `We rank 44% of the shelf. The rest is our backlog, not a dead end.` (§05) | `Coverage` | R1, R4, R6, R7 |
| `Call it from an agent.` (§06) | `API` | R1, R4 |
| `WHAT IT IS` (th) | `Component` | R1 |
| `SIGNALS IT HAS` (th) | `Signals` | R1 |
| `THE ARITHMETIC` (th) | `Calculation` | R1 |
| `SCORE` (th) | `Score` | R3 |
| `We installed it and it ran.` | `Installed and executed` | R6 |
| `Practitioners cite it in the wild.` | `Cited in published sources` | R7 |
| `Installs from a registry listing.` | `Registry install count` | R1 |
| `measured by us` / `from what builders publish` | `Source: Armory` / `Source: Published` | R6, R9 |
| `60 of the catalog` | `60 Components · 0.1%` | R5, R9 |
| `1 independent signal` / `3 independent signals` | `1 Signal` / `3 Signals` | R2 |
| `popular, unconfirmed` / `corroborated` | `Unconfirmed` / `Corroborated` | R3 |
| `three signals agree` / `two signals` / `the typical repo` | `3 Signals` / `2 Signals` / `Median` | R1, R5 |
| `one signal — the most-starred repo we hold` | `1 Signal · Highest Stars` | R6 |
| `we tested it and it failed` | `Tested · Failed` | R6 |
| `nothing published about it yet` / `no signal yet` | `Unmeasured` | R2 |
| `nothing to average — left blank, never guessed` | `No Value` | R1 |
| `55.6% has no signal yet` | `55.6% Unmeasured` | R2 |
| `one backfill run` / `read the registry` / `none of them` | `Backfill` / `Registry Fetch` / `None` | R1 |
| `The formula and every signal are open. If a weight is wrong, that's a pull request, not a mystery.` | `Weights are versioned in the repository` + `Open Issue` | R6, R7 |

### D. Ask — `app/ask/page.tsx`

| Banned | Replacement | Rule |
|---|---|---|
| `Ask the Armory` (h1) | `Ask` | R2 |
| `Describe the job. Get ranked building blocks.` (lead) | `Describe a task, get ranked components` | R8 |
| `Ask for any tool…` (placeholder) | `browser automation` | R14 |
| `Searching…` | `Searching` + skeleton rows | R4 |
| `Nothing matched — try broader or different terms.` | `No Results` + `Broaden the query` + `Reset` | R12 |
| `Universal score — how this ranks across every measured signal` (title attr) | Visible label `Score` on the badge | brief §1.1 |
| **empty default state** (~600px void) | Render the **top 20 ranked components** with heading `Top Ranked` | brief §4 |
| example chips (sentences) | `Browser Automation` · `Excel + Finance` · `Test Generation` · `Agent Memory` · `Sandbox Deploy` | R1, R3 |

### E. Browse — `app/browse/browse-client.tsx`

| Banned | Replacement | Rule |
|---|---|---|
| `Search components` (placeholder) | `playwright` | R14 |
| `The brain is still forming.` | `Not Indexed` | R1, R4, R10 |
| `No components indexed yet. As components land in brain/components/, they appear here automatically.` | `Indexing in progress` + `Status` link | R8, R10 |
| `No component recalled.` | `No Results` | R1, R4, R10 |
| `Try broader terms, or clear the region filters.` | `Reset Filters` (as a button, not prose) | R10, R12 |

### F. Detail — `app/e/[type]/[slug]/page.tsx`

| Banned | Replacement | Rule |
|---|---|---|
| `Eval score` | `Score` | R2 |
| `License` / `Maturity` | Keep — both are correct enterprise labels | ✓ |
| `No component with this name exists yet.` | `Not Found` + `Browse` + `Report Missing` | R12 |
| — (missing) | Add `Source` · `Author` · `Updated` · `Version` (provenance block, brief §9) | R9 |

### G. Status — `app/status/page.tsx`

| Banned | Replacement | Rule |
|---|---|---|
| `Index status · Armory` | `Status · Armory` | R2 |
| `Measured test score` | `Tested` | R2 |
| `Community mentions` / `GitHub stars` | `Mentions` / `Stars` | R2 |
| `confirmed by the base crawl` | `Confirmed` | R2 |
| `added after the sweep — no crawl timestamp yet` | `Not Crawled` | R1 |
| `no date recorded` | `No Date` | R2 |
| `baseline` | `Baseline` | R3 |

### H. Components — `src/components/*.tsx`

| File | Banned | Replacement | Rule |
|---|---|---|---|
| `badges.tsx` | `consumed by machines` | `Machine Readable` | R1, R3 |
| `badges.tsx` | `stable` / `preview` / `experimental` | `Stable` / `Preview` / `Experimental` | R3 |
| `component-card.tsx` | `memory chip` | `Component` | R10 |
| `component-card.tsx` | `view synapses` | `Dependencies` | R1, R10 |
| `empty-state.tsx` | `brain forming` / `no results` | `Not Indexed` / `No Results` | R3, R10 |
| `build-flow.tsx` | `markdown vault — one file per component, with frontmatter + synapses` | `Markdown Source` · `1 file per component` | R1, R10 |
| `build-flow.tsx` | `one generated index — verified, scored, deduped` | `Generated Index` · `Scored, deduped` | R1 |
| `build-flow.tsx` | `three surfaces, one source of truth — read by humans and agents` | `Site · CLI · MCP` | R1, R7 |
| `build-flow.tsx` | `memory` (stage label) | `Catalog` | R10 |
| `category-bento.tsx` | `this is what other lists miss.` | **Delete** | R1, R4, R7 |
| `category-bento.tsx` | blurbs `servers, registries, transports, auth` | Keep — comma-separated noun lists are compliant | ✓ |
| `install-strip.tsx`, `quick-install.tsx` | `Target harness` | `Harness` | R2 |
| `install-strip.tsx` | `Copy config snippet` / `Copied config` | `Copy` / `Copied` | R2 |
| `quick-install.tsx` | `Copy install command` / `Copied` | `Copy` / `Copied` | R2 |
| `install-modal.tsx` | `Close install dialog` (aria) | `Close` | R2 |

---

## 5. Reviewer audit

Run against a diff. **Any hit is a finding.**

```bash
cd web/src
# R1/R4 — sentence labels: terminal punctuation inside JSX text or a label prop
grep -rnE '(>|label=|title=|placeholder=)[^<>{}]*[a-z]\.["<]' app components

# R6 — first person in user-facing strings
grep -rniE '>[^<>{}]*\b(we|our|us|your|I)\b[^<>{}]*<' app components

# R7 — marketing adjectives
grep -rniE '\b(every|all of|only|simply|just|beautiful|powerful|seamless|world.s first)\b' app components

# R10 — metaphor collision
grep -rniE '\b(brain|synapse|recall|region|vault|forming|memory chip)\b' app components

# brief §1.1 — facts that exist only in a tooltip
grep -rn 'title="' app components

# brief §10.11 — inline token styles (unauditable, unthemeable)
grep -rn 'style={{' app components | grep -c 'var(--'
```

**Acceptance:** all six return zero hits (the last returns `0`), and every string on a changed
surface appears in §2's lexicon or in a §4 replacement cell.

**Do not** rewrite a string that is already compliant, and **do not** touch strings on surfaces
outside the assigned scope — per `karpathy-coding-discipline.md`, every changed line traces to a row
in this file.
