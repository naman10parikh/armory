import { GraphIcon } from "./icons";

/*
  Composed empty state — a dim synapse glyph + a concrete message, never a
  sad-face or a spinner. Used for "no results" (search) and "brain forming"
  (empty catalog). Suggested tags can be passed to nudge the next query.
*/
export function EmptyState({
  title,
  hint,
  suggestions,
  onSuggest,
}: {
  title: string;
  hint?: string;
  suggestions?: string[];
  onSuggest?: (term: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-20 text-center">
      <span aria-hidden className="mb-4 text-ink-muted opacity-50">
        <GraphIcon size={40} />
      </span>
      <p className="font-serif text-2xl text-ink-hi">{title}</p>
      {hint && <p className="mt-2 max-w-md text-sm text-ink-muted">{hint}</p>}
      {suggestions && suggestions.length > 0 && onSuggest && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggest(s)}
              className="cursor-pointer rounded-full border border-line-subtle px-3 py-1 text-xs text-ink-body transition-colors hover:border-accent-line hover:text-accent-hover"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
