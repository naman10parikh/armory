import type { Config } from "tailwindcss";

/*
  PANTHEON design system. Warm-black (NOT pure black), ONE restrained Synapse
  Amber accent (NOT the generic AI-purple gradient), Instrument Serif + Poppins
  + JetBrains Mono. Colors map to the OKLCH custom properties in globals.css so
  there is a single source of truth for the palette.
*/
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm-black surfaces, layered (depth via lightness).
        base: "var(--bg-base)",
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
        },
        // THE accent — Synapse Amber.
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          quiet: "var(--accent-quiet)",
          line: "var(--accent-line)",
        },
        // Semantic maturity.
        ok: "var(--ok)",
        warn: "var(--warn)",
        info: "var(--info)",
      },
      fontFamily: {
        serif: ["var(--font-display)", "Instrument Serif", "Georgia", "serif"],
        sans: ["var(--font-body)", "Poppins", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      transitionTimingFunction: {
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
