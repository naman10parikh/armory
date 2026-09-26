"use client";

import { useEffect, useState } from "react";
import { sinceText } from "@/lib/format";

/**
 * "5 hours ago", true at the moment it is read. The server renders a fixed time ("26 Sep 2026, 09:04
 * UTC", from utcStamp) because a cached page can be served hours after it was built, and a relative
 * time baked into it would be wrong for agents and curl (CP138 T51). After mount the browser switches to
 * the relative time against its own clock, once a minute. The ISO time stays in <time datetime>.
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
