import type { ReactNode } from "react";

/*
  The data table — Armory's primary surface (design/BRIEF.md §7, §9).

  40px rows · 8/12px cell padding · sticky header · tabular numerals inherited
  from the <table> · right-aligned numbers · full-row hover · one-line
  descriptions clamped at a WORD boundary.

  Tokenised classes only. No inline `var(--…)` style objects — a table styled
  with 40 inline objects cannot be themed or audited.
*/

const ALIGN = { left: "text-left", right: "text-right" } as const;
type Align = keyof typeof ALIGN;

/** 1440px content column. The table is the product — give it the room. */
export function ContentWidth({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1440px] px-5 md:px-8 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Scroll container + <table>. `minWidthClass` sets the point below which the
 * table scrolls sideways instead of crushing its columns — the page owns that
 * number because it owns the column set.
 */
export function DataTable({
  children,
  label,
  minWidthClass = "min-w-[1080px]",
  fixed = false,
}: {
  children: ReactNode;
  label: string;
  minWidthClass?: string;
  /** Fixed layout: Th widths are honoured and the one `w-auto` column takes the remainder. Auto
   *  layout lets the widest cell (a 56-char install snippet) grow its column until the prose
   *  column next to it is 14 characters wide — the ranked tables opt in. */
  fixed?: boolean;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        aria-label={label}
        className={`w-full ${minWidthClass} ${fixed ? "table-fixed" : ""} border-collapse text-[13px] leading-tight tabular-nums`}
      >
        {children}
      </table>
    </div>
  );
}

/** Column head. Sticky so it survives row 150. Real scope + aria-sort. */
export function Th({
  children,
  align = "left",
  scope = "col",
  sort,
  className = "",
}: {
  children: ReactNode;
  align?: Align;
  scope?: "col" | "row";
  sort?: "ascending" | "descending" | "none";
  className?: string;
}) {
  return (
    <th
      scope={scope}
      aria-sort={sort}
      className={`sticky top-0 z-10 whitespace-nowrap border-b border-line-strong bg-raise-1 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted ${ALIGN[align]} ${className}`}
    >
      {children}
    </th>
  );
}

/**
 * Body cell. 40px minimum height, 8/12px padding.
 * `truncate` clamps to one line — pair it with `clampWords()` on the text so
 * the cut lands on a word boundary and CSS never has to fire mid-word.
 */
export function Td({
  children,
  align = "left",
  truncate = false,
  className = "",
}: {
  children: ReactNode;
  align?: Align;
  truncate?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`h-10 border-b border-line-subtle px-3 py-2 align-middle ${ALIGN[align]} ${truncate ? "max-w-0" : ""} ${className}`}
    >
      {truncate ? <span className="block truncate">{children}</span> : children}
    </td>
  );
}

/** Row. The WHOLE row is the hover target, not just the name. */
export function Tr({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={`transition-colors duration-150 ease-state hover:bg-raise-2 ${className}`}
    >
      {children}
    </tr>
  );
}

/**
 * Clamp to one line at a WORD boundary (brief §10.9 — `the cano` / `ad-ho` are
 * live defects). Falls back to a hard cut only when the first word is longer
 * than half the budget.
 */
export function clampWords(text: string, max = 72): string {
  const t = (text ?? "").trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const at = cut.lastIndexOf(" ");
  const kept = at > max / 2 ? cut.slice(0, at) : cut;
  return `${kept.replace(/[\s.,;:–—-]+$/, "")}…`;
}
