# Armory — Design Brief

Discovery brief for the redesign. **Gate: nothing is restyled until the main loop approves this.**
Companion contract: [`web/COPY.md`](../web/COPY.md). Every choice below carries one line of *why*.

---

## 1. ICP — two readers, one surface

| Reader | Who | Reads how | Needs |
|---|---|---|---|
| **Primary — the builder** | Mid-task engineer wiring an agent harness. Terminal open, editor open, Armory in a third tab. | Scans. Never reads a paragraph. Arrives with a job, not curiosity. | Rank, evidence, install command. |
| **Co-equal — the builder's agent** | Claude Code / Cursor / Codex fetching the page, the API, or the CLI on the builder's behalf. | Parses rendered text and DOM. No hover. No JS wait. No tooltips. | Stable labels, real numbers in markup, reproducible URLs. |

**Why two:** an agent that cannot read a value the human can see is a broken product, not a missing
nicety. This is the constraint that makes Armory's design different from every human-only directory.

**Agent-legibility is a design rule, not a slogan.** Enforced as:

1. **No fact may live only in a `title=` attribute.** Today `top signal` hides three of four signals
   in a tooltip, and `✓ verified` hides its meaning in one — invisible to agents and to keyboard users.
2. **No animated numbers.** `CountUp` runs 1200 ms; the review screenshot captured `6,319` and `1`
   where the true values are the full total and the category count. *The headline figure is false for
   1.2 s to every screenshot, scraper, and agent.* Numbers render final, immediately.
3. **Numbers ship machine-readable** — `<data value="93.7">93.7</data>`, `<time datetime>` for dates.
4. **The install command is selectable text**, never only a click handler.
5. **Filter state lives in the URL** so a slice is reproducible and citable by an agent.
6. **Real `<th scope="col">`, one `<h1>`, ordered headings.** The table is the document.

---

## 2. Jobs to be done

| # | Job | Success | Fails today because |
|---|---|---|---|
| J1 | Find the best block for a task | Top result is right, in one screen | Home shows **zero rows**; a 100dvh hero sits where the data belongs |
| J2 | Trust the rank at a glance | Score + its evidence readable without a click | Score is a bare number; `✓ verified` is on ~every row, so it carries no information |
| J3 | Install in ≤10 s **in my harness** | Copy-ready command in the row, harness remembered | No install affordance in the table at all — it is two clicks away |
| J4 | Slice by component / domain / vertical | Chips show counts, state is in the URL | Native `<select>`s labelled `every component`; state is invisible and uncitable |
| J5 | Cite the ranking | Formula, weights, coverage all public | Already Armory's best surface — keep the substance, fix the labels |

**Why J3 is the design centre:** find and trust exist to serve install. A directory that ranks
beautifully and cannot be acted on in the row has optimised the wrong step.

---

## 3. Vibe

> **Machined · Racked · Legible-at-speed · Open · Unceremonious**

| Word | Means | Why |
|---|---|---|
| **Machined** | Tolerances, tabular numerals, aligned columns, nothing hand-wavy | The product's claim is measurement; the surface must look measured |
| **Racked** | Every item in a labelled slot with a count | Armory's own metaphor (BRAND.md) — inventory, not editorial |
| **Legible-at-speed** | One saccade per row; density serves reading, not decoration | The builder is mid-task; comprehension time is the metric |
| **Open** | Source, licence, formula, CSV visible on the surface | Open-source trust is shown by receipts, not claimed by adjectives |
| **Unceremonious** | No hero, no reveal, no ta-da. It opens with data | A reference tool earns the tab by starting useful |

**Not Synoptic.** Synoptic is quiet, centred, drawing-first — an owner's representative presenting
evidence of progress to a supervisor who must *judge* it. Armory is a **parts counter**: the reader
already knows what they want and is being *served*, fast. Synoptic centres; Armory tabulates.
Synoptic is patient; Armory is transactional. Shared parent (warm black, one amber) — opposite posture.

---

## 4. Information hierarchy

Method per `knowledge/info-hierarchy.md`: **max 3 priority levels per section; FIRST gets the largest
size, heaviest weight, most contrast, most space; each level drops ≥1 type step.**

| Page | FIRST (0–1 s) | SECOND (1–2 s) | THIRD (2–3 s) |
|---|---|---|---|
| **Home** | Search field + **top 20 ranked rows, above the fold** | Slice chips with counts; total indexed | Score explainer link, install one-liner, source |
| **Leaderboard** | Score badge + component name + **Install** | Signal glyph row · Component · Domain | Description (1 line), licence, updated |
| **Detail** | Name + score badge + **Install** | Signals, source, licence, maturity, updated | README prose, related components |
| **Formula** | The arithmetic **on real rows** (the table) | The four signals and their weights | Coverage/backlog, API access |
| **Ask** | Input + results | Example queries as chips | How the ranking applies |

**Home changes shape.** The 100dvh hero becomes a ~180 px band: wordmark, one-line positioning,
search, counts — then the table starts. **Why:** a directory whose landing page shows none of its
64,638 rows has buried its own answer to J1.

**Ask's empty state becomes a useful state** — it renders the top-ranked slice by default.
**Why:** today it is ~600 px of nothing, which teaches the reader the tool is empty.

---

## 5. Type

| Role | Stack | Why |
|---|---|---|
| **UI / body** | `"Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | The friendliest face on the bible's app list — wide apertures, high x-height, rounded terminals. Directly answers *"narrow typography"* and *"friendly fonts."* Not Inter (named slop), not Poppins (single-storey `a`, poor at 12 px) |
| **Data / code / IDs / numerals** | `"JetBrains Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` | Half this product's content *is* code — package names, commands, scores. Slashed zero, best-in-class at 11–12 px. Sans↔mono is the contrast pair a data product actually needs |
| **Wordmark only** | `"Instrument Serif", ui-serif, Georgia, "Times New Roman", serif` | Keeps lineage to Energy/pixel in the one place brand should speak; removed from app chrome |

**Deviation flagged.** `.claude/rules/design.md` and pixel prescribe Instrument Serif + Poppins. The
*principle* — two contrasting families, never Inter-for-everything — is honoured via **sans + mono**.
The serif display face is what makes the current app read as a magazine at 44 px. **Open choice #1.**

**Scale** (app chrome — no 44 px headings anywhere):

| Step | Size / weight / tracking | Use |
|---|---|---|
| Label | 11 px / 600 / +0.08em / uppercase | Column heads, eyebrows, chip labels |
| Meta | 12 px / 400 | Component, domain, licence, dates |
| Data | 13 px / 400–500, `tabular-nums` | Table body, scores |
| UI | 14 px / 400–500 | Controls, nav, buttons |
| Lead | 16 px / 400 / 1.5 | One-line page leads |
| H3 / H2 / H1 | 18 / 24 / 32 px, 1.15–1.25 | Section, page, product |

`font-variant-numeric: tabular-nums` on **every** number. **Why:** proportional digits make a ranked
column impossible to compare down — the single highest-value typographic fix in a leaderboard.

---

## 6. Palette — OKLCH, dark-first, light-ready

Roles, not literals, so light mode is a value swap with **zero component edits**. Radix 12-step
purposes: 1–2 background · 3–5 interactive · 6–8 borders · 9–10 solids · 11–12 text.

| Role | Dark (default) | Light (ready) | Why |
|---|---|---|---|
| `--bg-canvas` | `oklch(15% 0.006 72)` | `oklch(98.5% 0.004 72)` | Warm black, never `#000` — the #1 machine-detectable slop tell |
| `--bg-raise-1` | `oklch(18.5% 0.007 72)` | `oklch(100% 0 0)` | Table/panel ground |
| `--bg-raise-2` | `oklch(22% 0.009 72)` | `oklch(96.5% 0.005 72)` | Row hover, toolbar |
| `--bg-raise-3` | `oklch(26% 0.011 72)` | `oklch(93.5% 0.006 72)` | Selected row, active chip |
| `--line-subtle` | `oklch(100% 0 0 / 0.07)` | `oklch(20% 0.01 72 / 0.08)` | Row rules |
| `--line-default` | `oklch(100% 0 0 / 0.13)` | `oklch(20% 0.01 72 / 0.14)` | Control borders |
| `--line-strong` | `oklch(100% 0 0 / 0.22)` | `oklch(20% 0.01 72 / 0.24)` | Header rule, focus base |
| `--text-hi` | `oklch(96% 0.004 72)` | `oklch(22% 0.01 72)` | Names, scores. Not pure white |
| `--text-body` | `oklch(84% 0.005 72)` | `oklch(36% 0.009 72)` | Default |
| `--text-muted` | `oklch(68% 0.007 72)` | `oklch(52% 0.008 72)` | Metadata |
| `--text-faint` | `oklch(55% 0.006 72)` | `oklch(62% 0.007 72)` | Absent/unmeasured |
| `--accent` | `oklch(78% 0.13 72)` | `oklch(58% 0.13 62)` | **Amber darkens in light** — 78% L fails contrast on white. Exactly why roles beat literals |
| `--accent-hover` | `oklch(84% 0.135 72)` | `oklch(52% 0.14 62)` | |
| `--accent-quiet` | `--accent / 0.14` | `--accent / 0.10` | Selected chip fill |
| `--accent-line` | `--accent / 0.38` | `--accent / 0.40` | Focus ring, selected border |
| `--ok` / `--warn` / `--danger` / `--info` | `oklch(74% .10 152)` / `oklch(78% .12 62)` / `oklch(65% .16 25)` / `oklch(72% .07 230)` | −20% L | Maturity + errors only |

**Accent discipline — the biggest palette change.** Amber currently paints eyebrows, links, badges,
glyphs, CTA fills, sort arrows and two body radial glows. Used everywhere, it means nothing.
**New rule: amber marks exactly two things — what is interactive and what is selected.** Everything
else is neutral. **Why:** in an app, the accent is a pointer, not a texture.

**Score ramp encodes confidence, not quality.** The formula states a missing signal never counts
against a component — so a traffic light would lie.

| Token | When | Render |
|---|---|---|
| `--score-solid` | 3–4 independent signals | `--accent`, full |
| `--score-partial` | 2 signals | `--accent / 0.55` |
| `--score-thin` | 1 signal | `--text-muted` |
| `--score-none` | 0 signals | `--text-faint`, em dash |

**Delete both body radial gradients and the `.grain` overlay** on app pages. **Why:** an atmospheric
glow behind a data table is decoration competing with the only thing on screen that matters.

---

## 7. Density + spacing — this is an app

Neither `frontend-bible-2026.md` nor `info-hierarchy.md` specifies table density; the rows below are
an **Armory-specific extension**, stated as such.

| Rule | Value | Why |
|---|---|---|
| Base grid | **4 px** for chrome; 8 px multiples for section rhythm | Bible's 8 px is a page grid; app chrome needs half-steps |
| Table row | **40 px** default (32 px compact) | Yields ~22–24 rows/900 px vs **12 today** — roughly double the answers per screen |
| Cell padding | `8px 12px` | Was `10px 14px` with a wrapping 2-line description |
| Description | **One line, ellipsis, fixed column** | Today it wraps to 2 lines and truncates mid-word (`the cano`, `ad-ho`) — ragged and unreadable |
| Content width | **1440 px** max for table surfaces (was 1240) | The table is the product; give it the room. Directly answers *"narrow"* |
| Page gutters | 20 px mobile / 32 px desktop | |
| Page top padding | **32 px** (was 96 px) | 96 px of nothing above a data table is a magazine margin |
| Toolbar | 48 px, **sticky** | Filters must stay reachable at row 150 |
| Section gaps | 24 px toolbar→table, 48 px between sections | |
| Measure | Data ≤72ch · description 1 line · README prose ≤68ch | |
| Touch targets | ≥44 px on mobile; ≥32 px pointer rows with full-row hit area | Whole row is the target, not the name — a recurring review defect |
| Alignment | Text left · **numbers right, tabular** · glyphs fixed-width | Right-aligned numerals are comparable down a column |

---

## 8. Motion

| Rule | Value | Why |
|---|---|---|
| State change (hover, chip, copy confirm) | **120–200 ms**, `cubic-bezier(0.16, 1, 0.3, 1)` | Tighter than the bible's 200–500 ms marketing band; matches pixel's "sub-300 ms is the ceiling for direct-manipulation feedback" |
| Data appearing | **0 ms** | A table row must never animate in. Rows fade = the reader waits to read |
| Numbers | **Never animated** | `CountUp` publishes a false value for 1.2 s (§1) |
| Scroll reveal | **Removed** | `.reveal` runs opacity + translate + `blur(6px)` with 60 ms stagger — a marketing device that delays reading and taxes the GPU across 150 rows |
| Properties | `transform` + `opacity` only | GPU-composited, 60 fps |
| Reduced motion | Honoured; keep essential state feedback | Bible: "minimize non-essential motion, don't eliminate ALL" |
| Copy confirm | Icon swap + 1.2 s label, no toast | Cheapest legible confirmation |

---

## 9. Component inventory

| Component | Spec | Why |
|---|---|---|
| **Score badge** | Mono tabular number (13 px, `--text-hi`) + 4-segment micro-bar = independent signals corroborating. Coloured by the confidence ramp. `<data value>`. | The number alone doesn't say *how much to trust it*. Corroboration count is the thing no other directory has |
| **Signal glyph row** | **4 fixed slots, always in the same order** — Tested · Mentions · Stars · Usage. Present = filled + value; absent = dim placeholder. Phosphor icons, 14 px, never emoji. | Fixed positions make *absence* scannable down a column. Replaces `top signal`, which showed one and hid three in a tooltip |
| **Install snippet** | In-row, revealed on row hover/focus, always in DOM for agents. Harness selector (claude / cursor / codex / opencode / gemini) persisted in `localStorage`. Copies `armory install <name> --cli <harness>`. | J3 — the ≤10 s job. Selectable text, so an agent can read it without clicking |
| **Filter chips** | Replace native `<select>`s. Label + count (`MCP 2,426`). Selected = `--accent-quiet` + `--accent-line`. State in URL. Overflow → "More". | Counts turn a filter into information. URL state makes a slice citable |
| **Data table** | 40 px rows, sticky header, sortable `<th aria-sort>`, right-aligned numerals, full-row hit area, zebra via `--bg-raise-2` hover only. | The primary surface. Everything above serves it |
| **Card** | Detail/browse only, **never nested**. Single 1 px `--line-subtle` border, radius 10 px. No double bezel. | Cards in a ranked list destroy comparability; bible caps cards at 40% of sections |
| **Empty state** | Label + one ≤12-word line + 2 recovery actions. **Never a bare void.** Zero-results shows nearest slices. | Ask's current empty state is 600 px of nothing |
| **Identity / provenance block** | Source repo · author/org · licence · last indexed (`<time>`) · "Report" + "Contribute" links. | The open-source trust unit: who made this, under what terms, how fresh, how to reach them |

**Icons:** Phosphor at 14/16 px, two weights max (regular = default, bold = active). **Why:** the site
currently uses `★ ✓ ♦ ↑ ⚔️` as functional glyphs — banned by design.md (emoji are decorative only).

---

## 10. Anti-patterns

**Required, and each is live in the current build:**

1. **No AI-purple/blue gradients.** Also: no ambient amber orbs behind data. One accent, two meanings.
2. **No sentence labels.** `WHAT IT IS` → `Component`. `THE ARITHMETIC` → `Calculation`. `every component` → `Component`. Full contract in `web/COPY.md`.
3. **No narrow measure.** No 1240 px table on a 1440 px screen; no 65ch prose column in app chrome.
4. **No symmetric hero grids.** No 100dvh hero at all — the table is the hero.
5. **No loading spinner without context.** `loading the index…` → `Loading 63,788 components…` with a skeleton at final row height (no layout shift).

**Found in review, additionally banned:**

6. **No badge on ~100% of rows.** `✓ verified` everywhere = zero bits. Move to the signal row where absence means something.
7. **No fact reachable only by hover.** Tooltips are enrichment, never the only carrier.
8. **No animated numbers.** §1 and §8.
9. **No mid-word truncation.** Clamp at a word boundary with an ellipsis.
10. **No two metaphors.** `brain / synapse / recall / memory chip / regions of the brain` collides with the armory/inventory brand. Pick one — see open choice #3.
11. **No inline `style={{}}` for tokens.** The leaderboard hard-codes `var(--…)` in ~40 inline objects; it cannot be themed or audited. Tokens via classes.
12. **No headline number that disagrees with another page's.**

---

## 11. Moodboards, in words

**A. The parts counter.** A machinist's inventory wall: steel drawers, each with a stencilled bin
number and a hand-written count on a card. Warm tungsten lamp on matte dark metal. Nothing decorative
survives because everything is touched daily. *Takes:* the rack rhythm, the label-over-value pattern,
the single warm light source as the only colour.

**B. The tab you never close.** caniuse, MDN, the Postgres docs, an npm page: dense tables, zero
ceremony, opens straight into the answer, unchanged for a decade because it was right. *Takes:*
no hero, immediate data, sort/filter in the frame, a URL you can paste into a ticket.

**C. The night instrument panel.** Linear's issue list and a dark Grafana board at 2 a.m.: tabular
numerals in perfect columns, hairline rules, one amber that only ever means *live* or *selected*,
everything else greyscale. *Takes:* accent discipline, the 40 px row, right-aligned numbers, the
confidence ramp.

**Explicitly not on the board:** editorial magazine spreads, glassmorphism, AI-gradient mesh,
3-up symmetric feature cards, a full-bleed hero photograph.

---

## 12. Open choices for the main loop

1. **Type deviation** — Plus Jakarta Sans + JetBrains Mono, serif kept for the wordmark only, against
   `design.md`/`react.md`/pixel's Instrument Serif + Poppins. Approve, or hold the serif in headings?
2. **Light mode** — ship dark-only values now with light-ready role names (cheap, reversible), or
   build both palettes in this pass? A tool kept open all day beside an editor argues for both.
3. **The brain metaphor** — delete `brain / synapse / recall / memory chip` from user-facing copy and
   keep the graph renamed `Dependencies`? Removes a signature visual's story; resolves the metaphor
   collision. Recommended: delete the vocabulary, keep the visual.

---

## Approval — main-loop (taste gate) decisions, 2026-09-01

**Brief APPROVED** with these rulings on the three open choices:

1. **Type — APPROVED deviation.** Plus Jakarta Sans (UI/body) + JetBrains Mono (data, IDs, commands, numerals); Instrument Serif only for the wordmark. Rationale recorded for the fleet: the house pairing (Instrument Serif + Poppins) is the *editorial* default; Armory is a dense data app where half the content is code, and the chairman's complaint was precisely the "narrow/editorial" read. The principle (two contrasting families, never one-font-for-everything) is kept via sans + mono. This is a documented, scoped exception for app surfaces — not a change to the fleet rule.
2. **Light mode — dark-only now, light-ready roles.** Ship dark values this run; role names must make light a token swap later; amber darkens in light per the brief.
3. **Brain metaphor — delete the vocabulary; drop the decorative graph from app pages.** The `related:` data is loose co-occurrence, not dependencies, so labelling the graph "Dependencies" would be dishonest. If a relation visual stays anywhere it is labelled **Connections** and shows only real edges; otherwise it goes. (Consistent with CP132's "kill Synapse/related/jargon".)

**Additionally mandated for the apply wave (defects found by the brief, all must be fixed):**
- No animated numbers anywhere (CountUp made headline figures false for 1.2 s). Numbers render final, as `<data value>`.
- No fact lives only in a `title=` attribute (signals row visible; verified badge explains itself).
- Descriptions never truncate mid-word (ellipsis at a word boundary, one line).
- The ~40 inline `var(--…)` style objects become tokenised classes/components so the app can be themed and audited.
- Decision 1 (the table is the hero; ~180 px band + top-20 rows above the fold) and Decision 2 (install snippet in the row with a persisted harness selector) are approved as the new home IA.
- Score badge = tabular number + 4-segment corroboration micro-bar on a confidence ramp (never a traffic light).
