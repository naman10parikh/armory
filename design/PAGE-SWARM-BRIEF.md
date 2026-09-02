# Page-swarm brief (CP137) — restyle your assigned pages onto the approved foundation

Read `design/BRIEF.md` (incl. its final **Approval** section — binding rulings) and `web/COPY.md` (the
lingo contract) first. The foundation is already built and committed; you apply it. Work only on the
pages assigned in your prompt. `cd web && npx tsc --noEmit` is your gate. Do NOT commit/deploy/`next build`.

## The foundation you must use (already in `web/src/`)
- **Tokens** (`app/globals.css`, exposed in Tailwind): surfaces `bg-canvas`, `raise-1/2/3` · lines `line-subtle/line/line-strong` · text `ink-hi/ink-body/ink-muted/ink-faint` · `accent`, `accent-hover`, `accent-quiet`, `accent-line` · semantic `ok/warn/danger/info` · confidence `score-solid/partial/thin/none` · fonts `font-sans` (Plus Jakarta Sans, UI/body), `font-mono` (JetBrains Mono — data, IDs, commands, numerals), `font-wordmark` (Instrument Serif, wordmark ONLY). **No `oklch()` literals, no inline `style={{…var(--…)}}` objects** — migrate every one you touch to classes. Legacy aliases (`--bg-base`, `--font-display`, `--font-body`, `--ease-*`) exist only until you migrate their callers; don't add new uses.
- **Components** (`components/`):
  - `ScoreBadge({ score, evidence, caption? })` — number as `<data>` + 4-segment corroboration bar; null → em dash.
  - `SignalsRow({ signals })` — four fixed slots in `SIGNAL_ORDER` (tested·mentions·stars·usage), absent = faint glyph + dash + sr-only "Unmeasured". **Use it wherever signals show; never hide a signal in `title=`.**
  - `InstallSnippet({ name })` + one `HarnessSelector` per page (retargets every snippet; localStorage-backed).
  - `DataTable`, `Th` (sticky, scope, aria-sort), `Td` (40px rows, 12/8 padding, `truncate` = word-boundary ellipsis), `Tr`, `ContentWidth` (1440px), `clampWords`.
- **Home** (`app/page.tsx`) is the reference implementation of the new look — read it before styling anything.

## Rules (all binding)
1. **Labels, not sentences.** Every heading/lead/empty-state/table header goes through COPY.md. ≤3 words for labels, Title Case, numbers first, no "we", no marketing adjectives. One short lead line per page maximum.
2. **Agent-first:** no fact only in `title=`; numbers as `<data value>`; filter/sort/query state lives in the **URL** (`searchParams`), so a link reproduces the view; no animated numbers; no loading spinner without a label; empty states show *something useful* (e.g. top-ranked rows), never a void.
3. **Density:** 40px rows, 1440px content width, top padding that clears the nav (see note), no decorative glows/gradients (remove any you find on your pages — e.g. the `component-card.tsx` hover radial).
4. **Amber means exactly two things:** interactive, selected. Not decoration.
5. **Nothing deleted that another page uses.** Surgical: touch your pages + the components only they use. Mention dead code; don't remove it unless you proved no caller.
6. Keep every route, filter, sort, CSV export, API call working. This is a restyle + de-jargon pass, not a feature change — except where your prompt names a feature (e.g. `/ask` reading `?q=`).

## Notes from the foundation lane (know these)
- The nav is a `fixed` floating pill; pages use `pt-20` to clear it. If your assignment includes the nav, convert it to an **in-flow top bar** and drop pages to the brief's 32px top padding; re-check `Th`'s `sticky top-0` afterwards.
- `/ask` must read `searchParams.q` (the home search box GETs `/ask?q=…`).
- `synapse-graph.tsx` is still used by `/graph` and `/e/**`; the brief's ruling: remove brain/synapse vocabulary; a relation visual stays only if it shows real edges and is labelled **Connections** — otherwise drop it from your page.

## Verify + report
`npx tsc --noEmit` clean · `grep -n "style={{" <your files>` → 0 inline token objects · `grep -n "title=" <your files>` → no fact-bearing titles. Report: files changed, COPY.md swaps you made (before → after, the 5 biggest), anything you left for the main loop.
