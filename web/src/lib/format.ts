// Display formatting shared by the server tables and the client Ask page. Pure, no dependencies.

const INT = new Intl.NumberFormat("en-US");

/** 12,345 */
export const int = (n: number): string => INT.format(n);

/**
 * A score printed to `dp` decimals from its four-decimal exact value, cut DOWN like the engine's
 * one-decimal score, so 100.0 appears only for a row that scores 100 (CP138 T23). Integer
 * arithmetic, so the same number prints the same digits on every page.
 */
export function scoreText(exact: number, dp: 1 | 2 | 3 | 4): string {
  const e4 = Math.round(exact * 1e4);
  const scaled = String(Math.floor(e4 / 10 ** (4 - dp))).padStart(dp + 1, "0");
  return `${scaled.slice(0, -dp)}.${scaled.slice(-dp)}`;
}

/**
 * Scores for a ranked list, all to the same number of decimals: three, or four for the whole list
 * when two different scores would print the same three (CP138 T23: one column mixed the two). Every
 * digit is the formula's own. At one decimal the top of the board is a wall of 99.9, because the
 * percentiles saturate. Rows whose exact scores are equal print the same text and share a rank.
 */
export function rankedScoreTexts(exacts: readonly (number | null)[]): (string | null)[] {
  const at = (dp: 3 | 4) => exacts.map((e) => (e == null ? null : scoreText(e, dp)));
  const three = at(3);
  const seen = new Map<string, number>();
  const clash = exacts.some((e, i) => {
    const t = three[i];
    if (e == null || t == null) return false;
    if (seen.has(t) && seen.get(t) !== e) return true;
    seen.set(t, e);
    return false;
  });
  return clash ? at(4) : three;
}

/**
 * Standard competition ranks for a list in score order: a row whose exact score equals the row above
 * it takes that row's rank (37, 37, 39), so one score is never printed beside two ranks.
 */
export function tiedRank(prev: { rank: number; exact: number | null } | undefined, exact: number | null, position: number): number {
  return prev != null && exact != null && prev.exact === exact ? prev.rank : position;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "22 Sep 2026", in UTC so the server and the browser print the same day. */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * The date most GitHub figures were read on or after, from catalog.json's github_read: `since` is the
 * date from which the logged reads cover 90% of repositories (CP138 T23: the page said "Updated 12
 * minutes ago" over commit dates three weeks old). Callers say "or later": some rows were read since.
 */
export function githubReadText(read: { since: string | null; latest: string }): string {
  return shortDate(read.since ?? read.latest);
}

/** "26 Sep 2026, 09:04 UTC": a fixed time for server HTML, true however old the cached page is. */
export function utcStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hm = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  return `${shortDate(iso)}, ${hm} UTC`;
}

/** "40 minutes ago" · "5 hours ago" · "2 days ago" — for a refresh time, where hours matter. */
export function sinceText(iso: string, now: number): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const minutes = Math.max(0, Math.floor((now - t) / 60_000));
  if (minutes < 60) return minutes <= 1 ? "a minute ago" : `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return hours === 1 ? "an hour ago" : `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

/** GitHub owner of our own repositories: rows from here carry an "Ours" label (CP143 default). */
export const OUR_OWNER = "naman10parikh";

export function isOurs(url: string | null | undefined): boolean {
  return typeof url === "string" && url.toLowerCase().includes(`github.com/${OUR_OWNER}/`);
}

/**
 * The feed that contributed a row, from its first `<name>-feed` tag: "sentinel-feed" → "Sentinel"
 * (CP143 T26). Read from the tag, never hard-coded, so a new feed labels itself.
 */
export function contributorOf(tags: readonly unknown[] | null | undefined): string | null {
  for (const tag of tags ?? []) {
    const m = typeof tag === "string" ? /^(.+)-feed$/.exec(tag.trim()) : null;
    if (m) return m[1].charAt(0).toUpperCase() + m[1].slice(1);
  }
  return null;
}

/**
 * A row's catalog `title`, when it has a non-empty one: the name a person reads where the row's slug
 * had to differ (clis-tools/microsoft-playwright-2 reads "microsoft-playwright"). Pages print
 * `title || name`; links, keys, the API and `armory install` keep the slug `name`.
 */
export function titleOf(raw: { title?: unknown } | null | undefined): string | undefined {
  return typeof raw?.title === "string" && raw.title ? raw.title : undefined;
}
