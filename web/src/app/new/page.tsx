// New — the most recently listed components, each with the day it entered the catalog
// (web/changes.json, from the catalog's own git history).
import type { Metadata } from "next";
import { HomeBoard } from "@/components/home-board";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "New · Armory",
  description: "Agent components most recently added to the Armory catalog, with the date each was listed.",
};

export default async function NewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = (await searchParams).page;
  const page = Number(Array.isArray(raw) ? raw[0] : raw);
  return <HomeBoard tab="new" page={Number.isFinite(page) ? page : 1} />;
}
