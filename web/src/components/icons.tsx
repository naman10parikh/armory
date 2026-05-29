import type { ComponentType } from "@/lib/types";

// Phosphor-register line icons — one consistent stroke width (1.5), light weight,
// rounded joins. No emoji as functional icons (anti-slop #9). 24px viewBox.
// Each icon inherits `currentColor` so colour is set by the parent.

type IconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
};

function Svg({
  children,
  className,
  size = 18,
  strokeWidth = 1.5,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

export function ArrowRightIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  );
}

export function ArrowLeftIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </Svg>
  );
}

export function ExternalIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 4h6v6" />
      <path d="M20 4 10 14" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </Svg>
  );
}

export function GithubIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5a3 3 0 0 0-.9-2.6c3-.3 6.1-1.5 6.1-6.7a5.2 5.2 0 0 0-1.5-3.6 4.8 4.8 0 0 0-.1-3.6s-1.1-.4-3.7 1.4a12.7 12.7 0 0 0-6.6 0C6.2 1.6 5.1 2 5.1 2a4.8 4.8 0 0 0-.1 3.6 5.2 5.2 0 0 0-1.5 3.6c0 5.2 3.1 6.4 6.1 6.7a3 3 0 0 0-.8 2.4V22" />
    </Svg>
  );
}

export function CopyIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </Svg>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m20 6-11 11-5-5" />
    </Svg>
  );
}

export function TerminalIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </Svg>
  );
}

export function GraphIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="7" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M8 7 16 8M7.5 8l4 8M16.5 9l-4 7" />
    </Svg>
  );
}

export function StarIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.3 2.8 1-5.9L3.5 9.7l5.9-.9z" />
    </Svg>
  );
}

export function SparkIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </Svg>
  );
}

// ── Per-type category glyphs (12) ──────────────────────────────────────────
// Distinct line marks so the squint test ranks them by shape, not just label.

export function TypeIcon({
  type,
  className,
  size = 18,
  strokeWidth = 1.5,
}: { type: ComponentType } & IconProps) {
  const p = { className, size, strokeWidth };
  switch (type) {
    case "mcps": // plug / connector
      return (
        <Svg {...p}>
          <path d="M9 3v5M15 3v5" />
          <rect x="6" y="8" width="12" height="6" rx="2" />
          <path d="M12 14v3a4 4 0 0 1-4 4" />
        </Svg>
      );
    case "skills": // facets / gem
      return (
        <Svg {...p}>
          <path d="m12 3 7 5-2.6 9H7.6L5 8z" />
          <path d="M12 3v18M5 8h14" />
        </Svg>
      );
    case "hooks": // hook / link
      return (
        <Svg {...p}>
          <path d="M14 4h2a3 3 0 0 1 3 3v6a5 5 0 0 1-10 0v-2" />
          <path d="m6 9 3-3 3 3" />
        </Svg>
      );
    case "subagents": // swarm of nodes
      return (
        <Svg {...p}>
          <circle cx="12" cy="6" r="2" />
          <circle cx="6" cy="17" r="2" />
          <circle cx="18" cy="17" r="2" />
          <path d="M11 8 7 15M13 8l4 7M8 17h8" />
        </Svg>
      );
    case "identity": // fingerprint / soul
      return (
        <Svg {...p}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8a4 4 0 0 1 4 4M12 12v4M9 11a3 3 0 0 1 6 0" />
        </Svg>
      );
    case "memory": // stacked layers
      return (
        <Svg {...p}>
          <path d="m12 4 8 4-8 4-8-4z" />
          <path d="m4 12 8 4 8-4M4 16l8 4 8-4" />
        </Svg>
      );
    case "claudemd-rules": // document with lines
      return (
        <Svg {...p}>
          <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M14 3v4h4M9 13h6M9 17h4" />
        </Svg>
      );
    case "clis-tools": // terminal prompt
      return (
        <Svg {...p}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m7 10 3 2-3 2M13 14h4" />
        </Svg>
      );
    case "evals": // checklist / gauge
      return (
        <Svg {...p}>
          <path d="M5 4h11l3 3v13H5z" />
          <path d="m8 11 1.5 1.5L13 9M8 16h6" />
        </Svg>
      );
    case "observability": // pulse / activity
      return (
        <Svg {...p}>
          <path d="M3 12h4l2-7 4 14 2-7h6" />
        </Svg>
      );
    case "infrastructure": // server stack
      return (
        <Svg {...p}>
          <rect x="4" y="4" width="16" height="6" rx="1.5" />
          <rect x="4" y="14" width="16" height="6" rx="1.5" />
          <path d="M8 7h.01M8 17h.01" />
        </Svg>
      );
    case "workflows": // flow / branch
      return (
        <Svg {...p}>
          <circle cx="6" cy="6" r="2" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="12" r="2" />
          <path d="M6 8v8M8 6h6a2 2 0 0 1 2 2v2M8 18h6a2 2 0 0 0 2-2v-2" />
        </Svg>
      );
    default:
      return <SparkIcon {...p} />;
  }
}
