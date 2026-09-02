import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

// design/BRIEF.md §5 (approved deviation from the house Instrument Serif +
// Poppins pairing): half this product's content IS code, so the contrast pair
// that serves it is sans ↔ mono, not serif ↔ sans. The serif survives in the
// one place brand should speak — the wordmark.
//
// next/font/google => self-hosted, preloaded, zero CLS. Exposed as CSS vars so
// tokens (not font names) travel through the app.

// UI + body. Variable font (wght 200–800) — no `weight` array, so the whole
// axis ships in one file.
const ui = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

// Data, IDs, commands, numerals. Slashed zero, holds up at 11–12px.
const mono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "monospace"],
});

// Wordmark ONLY — never app chrome, never a 44px heading.
const wordmark = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-wordmark",
  display: "swap",
  fallback: ["ui-serif", "Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  title: "Armory",
  description: "Ranked catalog of open-source agent components.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${ui.variable} ${mono.variable} ${wordmark.variable}`}
    >
      <body className="min-h-dvh bg-canvas font-sans text-ink-body antialiased">
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
