// The Armory mark — a synapse node: a central body with three firing dendrites
// ending in amber terminals. Line + accent fills, one stroke width. Scales via
// the `size` prop. Decorative — labelled by the wordmark beside it.
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
    >
      {/* dendrite lines */}
      <g
        stroke="var(--accent-line)"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        <path d="M12 12 5 5" />
        <path d="M12 12 20 8" />
        <path d="M12 12 9 20" />
      </g>
      {/* terminals */}
      <circle cx="5" cy="5" r="1.6" fill="var(--accent)" />
      <circle cx="20" cy="8" r="1.6" fill="var(--accent)" />
      <circle cx="9" cy="20" r="1.6" fill="var(--accent)" />
      {/* soma */}
      <circle cx="12" cy="12" r="3.4" fill="var(--accent-quiet)" stroke="var(--accent)" strokeWidth="1.4" />
    </svg>
  );
}
