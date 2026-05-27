import type { EngramType, Maturity } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/types";

// Type label — quiet uppercase, amber. The glyph (TypeIcon) carries the colour.
export function TypeBadge({ type }: { type: EngramType }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
      {CATEGORY_LABEL[type] ?? type}
    </span>
  );
}

// Type as a filled amber pill — used on the detail header eyebrow.
export function TypePill({ type }: { type: EngramType }) {
  return (
    <span className="inline-flex items-center rounded-full border border-accent-line bg-accent-quiet px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.15em] text-accent-hover">
      {CATEGORY_LABEL[type] ?? type}
    </span>
  );
}

// Maturity = dot + label (colour is NEVER the sole signal — anti-slop #12).
const MATURITY: Record<string, { dot: string; text: string; label: string }> = {
  stable: { dot: "bg-ok", text: "text-ok", label: "stable" },
  beta: { dot: "bg-warn", text: "text-warn", label: "beta" },
  experimental: { dot: "bg-info", text: "text-info", label: "experimental" },
};

export function MaturityBadge({ maturity }: { maturity: Maturity }) {
  if (!maturity) return null;
  const m = MATURITY[maturity] ?? MATURITY.experimental;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      <span className={m.text}>{m.label}</span>
    </span>
  );
}

// CLI compatibility — tiny mono badges (reinforces "consumed by machines").
export function CliChip({ cli }: { cli: string }) {
  return (
    <span className="inline-flex items-center rounded border border-line bg-raise-1 px-1.5 py-0.5 font-mono text-[10px] lowercase text-ink-muted">
      {cli}
    </span>
  );
}

export function TagChip({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line-subtle px-2.5 py-0.5 text-[10px] text-ink-muted">
      {tag}
    </span>
  );
}
