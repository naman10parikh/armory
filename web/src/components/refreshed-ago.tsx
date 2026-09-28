"use client";

import { useEffect, useState } from "react";
import { sinceText } from "@/lib/format";

/**
 * "5 hours ago", true at the moment it is read. The server renders `initial` (a fixed time, or nothing)
 * because a cached page can be served hours after it was built, and a relative time baked into it would
 * be wrong for agents and curl (CP138 T51). After mount the browser switches to the relative time against
 * its own clock, once a minute. The ISO time stays in <time datetime>. `prefix` ("· ") is printed only
 * with the relative time, so an empty server render leaves no stray separator (CP147: the home page shows
 * the exact update time AND how long ago it was).
 */
export function RefreshedAgo({ iso, initial, prefix = "" }: { iso: string; initial: string; prefix?: string }) {
  const [text, setText] = useState(initial);
  useEffect(() => {
    const tick = () => setText(sinceText(iso, Date.now()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [iso]);
  if (!text) return null;
  return (
    <time dateTime={iso}>
      {text !== initial ? prefix : ""}
      {text}
    </time>
  );
}
