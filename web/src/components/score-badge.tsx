/*
  Score badge — the Universal score as a number, and, where there is room, how many independent
  signals stand behind it, in words ("3 signals"). CP143: words, not glyphs, so the old 4-segment
  bar is gone; the number's colour still carries corroboration (a ramp, never a traffic light,
  because the formula never counts a missing signal against a component).

  In a ranked list the caller passes `display`: the exact score to three decimals (four where two
  neighbours would otherwise print the same three), because at one decimal the top of the board is a
  wall of 100.0 and 99.9. Every figure is a <data value>; nothing lives only in a tooltip.
*/
import { signalCountWords } from "./signals-row";

export type Confidence = "solid" | "partial" | "thin" | "none";

/** 3+ signals = corroborated · 2 = partial · 1 = thin · 0 = unmeasured. */
export function confidenceOf(evidence: number): Confidence {
  if (evidence >= 3) return "solid";
  if (evidence === 2) return "partial";
  if (evidence === 1) return "thin";
  return "none";
}

const NUMBER_CLASS: Record<Confidence, string> = {
  solid: "text-score-solid",
  partial: "text-score-partial",
  thin: "text-score-thin",
  none: "text-score-none",
};

export interface ScoreBadgeProps {
  /** The Universal score, 0–100 to one decimal. `null` = unranked. */
  score: number | null;
  /** Independent signals held (`scores.evidence` from lib/rank.mjs). */
  evidence: number;
  /** Printed text when it differs from the one-decimal score (ranked lists). */
  display?: string | null;
  /** The value behind `display`, for the <data> element. */
  value?: number | null;
  /** Print "3 signals" under the number. Off in tables, whose Evidence column says it in full. */
  caption?: boolean;
}

export function ScoreBadge({ score, evidence, display, value, caption = false }: ScoreBadgeProps) {
  if (score == null) {
    return <span className="text-[12.5px] leading-none text-ink-faint">Unranked</span>;
  }
  const level = confidenceOf(evidence);
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <data
        value={String(value ?? score)}
        className={`text-[14px] font-semibold leading-none tabular-nums ${NUMBER_CLASS[level]}`}
      >
        {display ?? score.toFixed(1)}
      </data>
      {caption && (
        <span className="text-[11px] leading-none text-ink-muted">{signalCountWords(evidence)}</span>
      )}
    </span>
  );
}
