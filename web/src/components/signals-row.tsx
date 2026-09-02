/*
  Signal row — design/BRIEF.md §9.

  FIVE fixed slots, always in the same order: Tested · Mentions · Stars · Forks · Usage.
  Present = glyph + value. Absent = dim glyph + em dash. Fixed positions are
  what make ABSENCE scannable down a column.

  This replaces `top signal`, which showed one signal and hid the other three in
  a title= tooltip — invisible to agents and to keyboard users. Every value here
  is real text in the DOM, wrapped in <data value> so it is machine-readable,
  with a screen-reader label so no slot is a bare number.
*/

export interface SignalValues {
  tested: number | null; // 0–1 eval score
  mentions: number | null;
  stars: number | null;
  forks: number | null;
  usage: number | null;
}

export type SignalKey = keyof SignalValues;

/** Canonical order. Never reorder — absence is read positionally. */
export const SIGNAL_ORDER: readonly SignalKey[] = ["tested", "mentions", "stars", "forks", "usage"];

/** COPY.md §2 approved lexicon. */
export const SIGNAL_LABEL: Record<SignalKey, string> = {
  tested: "Tested",
  mentions: "Mentions",
  stars: "Stars",
  forks: "Forks",
  usage: "Usage",
};

const GLYPH: Record<SignalKey, string> = {
  tested: "✓",
  mentions: "♦",
  stars: "★",
  forks: "⎇",
  usage: "↑",
};

function display(key: SignalKey, value: number): string {
  if (key === "tested") return `${Math.round(value * 100)}%`;
  return value.toLocaleString("en-US");
}

export function SignalsRow({ signals }: { signals: SignalValues }) {
  return (
    <span className="flex items-baseline gap-2.5 whitespace-nowrap font-mono text-[11.5px] leading-none tabular-nums">
      {SIGNAL_ORDER.map((key) => {
        const value = signals[key];
        const label = SIGNAL_LABEL[key];

        if (value == null) {
          return (
            <span key={key} className="inline-flex min-w-[54px] items-baseline gap-1 text-ink-faint">
              <span aria-hidden>{GLYPH[key]}</span>
              <span className="sr-only">{label} Unmeasured</span>
              <span aria-hidden>&mdash;</span>
            </span>
          );
        }

        return (
          <span key={key} className="inline-flex min-w-[54px] items-baseline gap-1 text-ink-body">
            <span aria-hidden className="text-ink-muted">
              {GLYPH[key]}
            </span>
            <span className="sr-only">{label} </span>
            <data value={String(value)}>{display(key, value)}</data>
          </span>
        );
      })}
    </span>
  );
}
