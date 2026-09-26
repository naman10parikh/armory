import type { Metadata } from "next";

// /ask is a client page, and a client page cannot export metadata, so its tab title lives here
// (COPY.md §3: `<Page> · Armory`; CP138 T51).
export const metadata: Metadata = {
  title: "Ask · Armory",
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
