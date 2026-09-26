// Trending — most practitioner mentions gained over the last two weeks (web/changes.json, from the
// catalog's own git history). Same board as the home page, a different ordering.
import type { Metadata } from "next";
import { HomeBoard } from "@/components/home-board";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Trending · Armory",
  description: "Agent components gaining practitioner mentions over the last two weeks.",
};

export default function TrendingPage() {
  return <HomeBoard tab="trending" />;
}
