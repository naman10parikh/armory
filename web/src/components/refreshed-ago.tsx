"use client";

import { useEffect, useState } from "react";
import { sinceText } from "@/lib/format";

/**
 * "refreshed 5 hours ago", true at the moment it is read. The server renders the text it computed at
 * render time (so the HTML is complete for agents and screenshots); after mount the browser recomputes
 * it against its own clock, once a minute. The ISO time stays in <time datetime> throughout.
 */
export function RefreshedAgo({ iso, initial }: { iso: string; initial: string }) {
  const [text, setText] = useState(initial);
  useEffect(() => {
    const tick = () => setText(sinceText(iso, Date.now()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [iso]);
  return <time dateTime={iso}>{text}</time>;
}
