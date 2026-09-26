/*
  Signals, in words — CP143 ("words, not glyphs: every signal has a word label").

  The row prints what it holds as a short list a person reads aloud: "120,808 stars · 18,510 forks ·
  249 mentions · passed install test". A signal the row does not hold is left out rather than drawn as a dim
  glyph and a dash, and a row that holds none says so. The old glyph slots (✓ ♦ ★ ⎇ ↑) needed a legend
  nobody had; a word is its own legend, for people and for agents parsing the page.

  Every number is a <data value> so it stays machine-readable.
*/

export interface SignalValues {
  tested: number | null; // 0–1 eval score
  mentions: number | null;
  stars: number | null;
  forks: number | null;
  usage: number | null;
}

export type SignalKey = keyof SignalValues;

/** Reading order: popularity first, then corroboration, then Armory's own test. */
export const SIGNAL_ORDER: readonly SignalKey[] = ["stars", "forks", "usage", "mentions", "tested"];

const INT = new Intl.NumberFormat("en-US");

const UNIT: Record<Exclude<SignalKey, "tested">, [string, string]> = {
  stars: ["star", "stars"],
  forks: ["fork", "forks"],
  usage: ["install", "installs"],
  mentions: ["mention", "mentions"],
};

/**
 * Words for the tested signal: a pass, a fail, or a graded share. The test is Armory installing and
 * running the component (/formula §01), not the repository's own CI, so the words say "install test".
 */
function testedWords(value: number): string {
  if (value >= 1) return "passed install test";
  if (value <= 0) return "failed install test";
  return `${Math.round(value * 100)}% of install tests passed`;
}

/** How many independent signals a row holds, in words ("3 signals"). */
export function signalCountWords(n: number): string {
  if (n <= 0) return "No signals yet";
  return n === 1 ? "1 signal" : `${n} signals`;
}

/** One signal's value in words: "120,808 stars", "1 fork", "passed install test". */
export function signalWords(key: SignalKey, value: number): string {
  return key === "tested" ? testedWords(value) : `${INT.format(value)} ${UNIT[key][value === 1 ? 0 : 1]}`;
}

/** The same words as plain strings, for surfaces that cannot hold markup (the preview cards). */
export function signalPhrases(signals: SignalValues): string[] {
  return SIGNAL_ORDER.filter((k) => signals[k] != null).map((key) => signalWords(key, signals[key] as number));
}

export function SignalsRow({
  signals,
  empty = "No signals yet",
  className = "",
}: {
  signals: SignalValues;
  empty?: string;
  className?: string;
}) {
  const held = SIGNAL_ORDER.filter((k) => signals[k] != null);
  if (held.length === 0) {
    return <span className={`text-[12.5px] text-ink-faint ${className}`}>{empty}</span>;
  }
  return (
    <span className={`text-[12.5px] leading-snug text-ink-body ${className}`}>
      {held.map((key, i) => {
        const value = signals[key] as number;
        return (
          // The separator sits outside the unbreakable part, so a narrow column wraps between
          // signals instead of running into the next column.
          <span key={key}>
            {i > 0 && <span className="text-ink-faint"> · </span>}
            <span className="whitespace-nowrap">
              {key === "tested" ? (
                <data value={String(value)}>{testedWords(value)}</data>
              ) : (
                <>
                  <data value={String(value)} className="text-ink-hi">
                    {INT.format(value)}
                  </data>{" "}
                  {UNIT[key][value === 1 ? 0 : 1]}
                </>
              )}
            </span>
          </span>
        );
      })}
    </span>
  );
}
