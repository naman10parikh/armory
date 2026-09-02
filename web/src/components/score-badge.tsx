/*
  Score badge — design/BRIEF.md §9 + the approval ruling.

  A tabular number PLUS a 4-segment corroboration micro-bar. The bar counts how
  many INDEPENDENT signals agree; it is never a traffic light, because the
  formula states a missing signal never counts against a component — colouring
  a low score red would be a lie about quality.

  The badge explains itself: the number is a <data value>, the bar carries a
  real aria-label, and nothing lives only in a title= tooltip.
*/

export type Confidence = "solid" | "partial" | "thin" | "none";

/** 3–4 signals = corroborated · 2 = partial · 1 = thin · 0 = unmeasured. */
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

const SEGMENT_CLASS: Record<Confidence, string> = {
  solid: "bg-score-solid",
  partial: "bg-score-partial",
  thin: "bg-score-thin",
  none: "bg-score-none",
};

const SEGMENTS = [0, 1, 2, 3];

export interface ScoreBadgeProps {
  /** The Universal score, 0–100 to one decimal. `null` = unranked. */
  score: number | null;
  /** Independent signals held, 0–4 (`scores.evidence` from lib/rank.mjs). */
  evidence: number;
  /** Render the visible `n/4 Signals` caption. Off in dense tables, where the
   *  Signals column already states the same fact in full. */
  caption?: boolean;
}

export function ScoreBadge({ score, evidence, caption = false }: ScoreBadgeProps) {
  const filled = Math.max(0, Math.min(4, Math.round(evidence)));
  const level = confidenceOf(filled);

  return (
    <span className="inline-flex flex-col items-end gap-1.5">
      {score == null ? (
        <span className="font-mono text-[13px] font-medium leading-none text-score-none">
          &mdash;
        </span>
      ) : (
        <data
          value={String(score)}
          className={`font-mono text-[13px] font-medium leading-none tabular-nums ${NUMBER_CLASS[level]}`}
        >
          {score.toFixed(1)}
        </data>
      )}

      <span
        role="img"
        aria-label={`${filled} of 4 Signals`}
        className="flex items-center gap-[2px]"
      >
        {SEGMENTS.map((i) => (
          <span
            key={i}
            aria-hidden
            className={`h-[3px] w-[7px] rounded-[1px] ${i < filled ? SEGMENT_CLASS[level] : "bg-line-strong"}`}
          />
        ))}
      </span>

      {caption && (
        <span className="font-mono text-[10px] leading-none text-ink-muted tabular-nums">
          {filled}/4 Signals
        </span>
      )}
    </span>
  );
}
