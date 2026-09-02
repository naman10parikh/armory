"use client";

import { useState } from "react";

export interface ChipFacet {
  key: string;
  count: number;
}

const VISIBLE = 8;

/** One filter axis as chips with counts (design/BRIEF.md §9) — replaces a native `<select>`.
 *  Selected = accent-quiet + accent-line (§6 — amber marks INTERACTIVE and SELECTED). Overflow
 *  folds behind a "More" chip rather than wrapping every option onto screen at once. */
export function FilterChipGroup({
  label,
  facets,
  selected,
  onSelect,
}: {
  label: string;
  facets: ChipFacet[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? facets : facets.slice(0, VISIBLE);
  const hidden = facets.length - shown.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 w-[74px] shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {label}
      </span>
      <Chip active={selected === ""} onClick={() => onSelect("")}>
        All
      </Chip>
      {shown.map((f) => (
        <Chip key={f.key} active={selected === f.key} onClick={() => onSelect(f.key)}>
          {f.key}{" "}
          <data value={String(f.count)} className="tabular-nums opacity-70">
            {f.count.toLocaleString("en-US")}
          </data>
        </Chip>
      ))}
      {hidden > 0 && (
        <Chip active={false} onClick={() => setExpanded(true)}>
          More +{hidden}
        </Chip>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors duration-150 ease-state ${
        active
          ? "border-accent-line bg-accent-quiet text-accent-hover"
          : "border-line-subtle bg-raise-1 text-ink-body hover:border-line hover:text-ink-hi"
      }`}
    >
      {children}
    </button>
  );
}
