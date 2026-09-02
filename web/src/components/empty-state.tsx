import Link from "next/link";
import { GraphIcon } from "./icons";

/*
  Composed empty state — a dim glyph + a concrete message, never a sad-face or a
  spinner. Used for "no results" (search) and "not indexed" (empty catalog).
  Label + a short cause + at least one recovery action (design/BRIEF.md §9, R12) —
  suggestion chips (nudge the next query), a state-resetting action ("Reset
  Filters"), or a navigating one ("Status") — never a bare void.
*/
export function EmptyState({
  label,
  hint,
  suggestions,
  onSuggest,
  action,
}: {
  label: string;
  hint?: string;
  suggestions?: string[];
  onSuggest?: (term: string) => void;
  action?: { label: string; onClick: () => void } | { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-20 text-center">
      <span aria-hidden className="mb-4 text-ink-muted opacity-50">
        <GraphIcon size={40} />
      </span>
      <p className="font-sans text-xl font-semibold text-ink-hi">{label}</p>
      {hint && <p className="mt-2 max-w-md text-sm text-ink-muted">{hint}</p>}
      {suggestions && suggestions.length > 0 && onSuggest && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggest(s)}
              className="cursor-pointer rounded-full border border-line-subtle px-3 py-1 text-xs text-ink-body transition-colors duration-150 ease-state hover:border-accent-line hover:text-accent-hover"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {action && "href" in action ? (
        <Link
          href={action.href}
          className="mt-5 inline-block cursor-pointer rounded-lg border border-accent-line bg-accent-quiet px-3.5 py-1.5 text-[13px] font-medium text-accent-hover transition-colors duration-150 ease-state hover:bg-accent-line"
        >
          {action.label}
        </Link>
      ) : (
        action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-5 cursor-pointer rounded-lg border border-accent-line bg-accent-quiet px-3.5 py-1.5 text-[13px] font-medium text-accent-hover transition-colors duration-150 ease-state hover:bg-accent-line"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
