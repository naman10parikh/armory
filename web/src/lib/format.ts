// Display formatting shared by the server tables and the client Ask page. Pure, no dependencies.

const INT = new Intl.NumberFormat("en-US");

/** 12,345 */
export const int = (n: number): string => INT.format(n);

/**
 * A score printed to `dp` decimals from its four-decimal exact value. Integer arithmetic, so the
 * same number prints the same digits on every page (a float `toFixed` can round 2.0500 either way).
 */
export function scoreText(exact: number, dp: 1 | 2 | 3 | 4): string {
  const e4 = Math.round(exact * 1e4);
  const scaled = String(Math.round(e4 / 10 ** (4 - dp))).padStart(dp + 1, "0");
  return `${scaled.slice(0, -dp)}.${scaled.slice(-dp)}`;
}

/**
 * Scores for a ranked list: three decimals, and a fourth only where a neighbour would otherwise
 * print the same three. Every digit is the formula's own; none is invented to pull two rows apart.
 * At one decimal the top of the board is a wall of 100.0 and 99.9 (the percentiles saturate).
 */
export function rankedScoreTexts(exacts: readonly (number | null)[]): (string | null)[] {
  const three = exacts.map((e) => (e == null ? null : scoreText(e, 3)));
  const clash = (i: number, j: number): boolean =>
    j >= 0 && j < three.length && three[j] != null && three[j] === three[i];
  return exacts.map((e, i) => {
    if (e == null) return null;
    return clash(i, i - 1) || clash(i, i + 1) ? scoreText(e, 4) : three[i];
  });
}

const DAY = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "22 Sep 2026", in UTC so the server and the browser print the same day. */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "today" · "3 days ago" · "5 months ago" · "2 years ago", measured from `now`. */
export function ago(iso: string, now: number): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const days = Math.floor((now - t) / DAY);
  if (days < 1) return "today";
  if (days < 2) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 730) return `${Math.floor(days / 30.44)} months ago`;
  return `${Math.floor(days / 365.25)} years ago`;
}

/** "40 minutes ago" · "5 hours ago" · "2 days ago" — for a refresh time, where hours matter. */
/** "26 Sep 2026, 09:04 UTC": a fixed time for server HTML, true however old the cached page is. */
export function utcStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hm = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  return `${shortDate(iso)}, ${hm} UTC`;
}

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
