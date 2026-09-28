"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/*
  The section links, in the order the approved wireframe draws them (docs/ui-2026-09-26/wireframe.html),
  with the current section marked. A client component only because it reads the path; it renders on the
  server too, so the mark is in the served HTML. Top is the board: /, /trending and /new. A component's
  own page sits under Browse, and a shelf page under Components.
*/
const LINKS: readonly { href: string; label: string; also?: readonly string[]; under?: string }[] = [
  { href: "/", label: "Top", also: ["/trending", "/new"] },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/c", label: "Components", under: "/c/" },
  { href: "/stack", label: "Stack" },
  { href: "/browse", label: "Browse", under: "/e/" },
  { href: "/formula", label: "Formula" },
  { href: "/ask", label: "Ask" },
];

export function NavLinks() {
  const path = usePathname() ?? "";
  return (
    <>
      {LINKS.map((l) => {
        const current = path === l.href || (l.also?.includes(path) ?? false) || (l.under ? path.startsWith(l.under) : false);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={current ? "page" : undefined}
            className={`cursor-pointer rounded-lg px-2.5 py-1.5 font-medium transition-colors duration-150 ease-state hover:bg-raise-2 hover:text-accent-hover ${
              current ? "bg-raise-2 text-ink-hi" : "text-ink-body"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
