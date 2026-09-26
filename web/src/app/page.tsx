// Home — the board's Top tab. The promise line, live counters, search, then the top 20 by score,
// computed with the same engine and order as the leaderboard, /formula and GET /api/rank
// (src/lib/rows.ts). Trending and New are sibling routes: /trending, /new.
import { HomeBoard } from "@/components/home-board";

export const runtime = "nodejs";

export default function HomePage() {
  return <HomeBoard tab="top" />;
}
