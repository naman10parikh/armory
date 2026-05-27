import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono, Poppins } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

// Instrument Serif (display) + Poppins (body) + JetBrains Mono (data/slugs).
// next/font => zero CLS, self-hosted, no layout shift.
const display = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Poppins({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Armory — the registry of agent harness components",
  description:
    "The Armory of agent harness components. For agents, by agents, of agents. An open, self-improving registry of MCPs, skills, hooks, sub-agents, memory, evals, observability, infrastructure, and the workflows that compose them.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh font-sans antialiased">
        <div aria-hidden className="grain" />
        <SiteNav />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
