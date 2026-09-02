import type { Config } from "tailwindcss";

/*
  Armory design system — every colour and family here is a ROLE that resolves to
  an OKLCH custom property in src/app/globals.css. One source of truth for the
  palette, so light mode is a token swap and nothing in src/ names a literal.

  Type (design/BRIEF.md §5, approved deviation): Plus Jakarta Sans for UI/body,
  JetBrains Mono for data/IDs/commands/numerals, Instrument Serif for the
  wordmark ONLY.
*/
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces — depth via lightness.
        canvas: "var(--bg-canvas)",
        base: "var(--bg-canvas)", // legacy alias; migrate callers to `canvas`
        raise: {
          1: "var(--bg-raise-1)",
          2: "var(--bg-raise-2)",
          3: "var(--bg-raise-3)",
        },
        // Hairlines.
        line: {
          subtle: "var(--line-subtle)",
          DEFAULT: "var(--line-default)",
          strong: "var(--line-strong)",
        },
        // Text — warm, light-on-dark, never pure white.
        ink: {
          hi: "var(--text-hi)",
          body: "var(--text-body)",
          muted: "var(--text-muted)",
          faint: "var(--text-faint)",
        },
        // THE accent — marks interactive + selected, nothing else.
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          quiet: "var(--accent-quiet)",
          line: "var(--accent-line)",
        },
        // Semantic — maturity + errors only.
        ok: "var(--ok)",
        warn: "var(--warn)",
        danger: "var(--danger)",
        info: "var(--info)",
        // Confidence ramp — how many independent signals corroborate a score.
        score: {
          solid: "var(--score-solid)",
          partial: "var(--score-partial)",
          thin: "var(--score-thin)",
          none: "var(--score-none)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-ui)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
        // Wordmark only. `serif` is kept as an alias so legacy surfaces render
        // until the swarm migrates them off the display face.
        wordmark: ["var(--font-wordmark)", "ui-serif", "Georgia", "serif"],
        serif: ["var(--font-wordmark)", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      transitionTimingFunction: {
        state: "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        premium: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "draw-line": {
          "0%": { strokeDashoffset: "var(--len, 100)" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
