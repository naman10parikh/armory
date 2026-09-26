import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

// Type, CP143 (the chairman's recorded default, after Synoptic's S09 §4):
//   Instrument Sans  — everything, figures included (tabular numerals, set on <body>)
//   Instrument Serif — the wordmark only
//   JetBrains Mono   — install commands (and the code they write) only
// One family for the interface reads as one instrument; the serif and the mono each keep a single
// job, so neither turns into decoration. next/font/google self-hosts all three: preloaded, zero CLS.

// Variable font (wght 400–700): no weight list, the whole axis ships in one file.
const ui = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

const wordmark = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-wordmark",
  display: "swap",
  fallback: ["ui-serif", "Georgia", "Times New Roman", "serif"],
});

const code = JetBrains_Mono({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "monospace"],
});

const SITE = "https://armory-murex.vercel.app";
const DESCRIPTION =
  "Open-source agent components (MCP servers, skills, sub-agents, hooks, evals) ranked on public evidence, refreshed nightly, each installed in one command.";

export const metadata: Metadata = {
  // Absolute og:image URLs need a base; production is the one alias every card should point at.
  metadataBase: new URL(SITE),
  title: "Armory",
  description: DESCRIPTION,
  openGraph: { siteName: "Armory", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${ui.variable} ${wordmark.variable} ${code.variable}`}>
      <body className="min-h-dvh bg-canvas font-sans text-ink-body antialiased">
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
