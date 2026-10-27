/* Dates and times on News Studio. The newsroom runs on IST — every "which
 * day is this story from" question (date headers, trending freshness) keys
 * off istDayKey so they can never disagree. Anything relative to "now"
 * takes the clock as an argument, so a server render and the first browser
 * render can agree on it (components/studio/now.tsx). */

export const IST = "Asia/Kolkata";

/* a stable per-day key ('16/7/2026'); an identity, NOT sortable (en-IN
 * renders dd/mm/yyyy) — order by timestamp */
export const istDayKey = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { timeZone: IST }) : "";

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/* "Today, 16th July, 2026" / "Wednesday, 15th July, 2026" */
export function dayHeading(iso: string, now: number): { label: string; today: boolean } {
  const d = new Date(iso);
  const today = istDayKey(new Date(now).toISOString()) === istDayKey(iso);
  const day = Number(d.toLocaleDateString("en-IN", { timeZone: IST, day: "numeric" }));
  const month = d.toLocaleDateString("en-IN", { timeZone: IST, month: "long" });
  const year = d.toLocaleDateString("en-IN", { timeZone: IST, year: "numeric" });
  const weekday = d.toLocaleDateString("en-IN", { timeZone: IST, weekday: "long" });
  return { label: `${today ? "Today" : weekday}, ${ordinal(day)} ${month}, ${year}`, today };
}

/* "30 mins ago" / "5 hrs ago" / "2 days ago" — BBC-style relative time */
export function timeAgo(iso: string | null | undefined, now: number): string {
  if (!iso) return "";
  const mins = Math.max(1, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/* rough reading time (~200 wpm), at least a minute */
export function readTime(...texts: (string | null | undefined)[]): number {
  const words = texts.filter(Boolean).join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/* the outlet's favicon, for source rows */
export function favicon(url: string | null | undefined): string {
  try {
    return `https://www.google.com/s2/favicons?domain=${new URL(String(url)).hostname}&sz=32`;
  } catch {
    return "";
  }
}

/* A calendar date in the reader's own time zone, as the app always showed
 * it. The server can't know that zone, so until the page has booted it
 * renders in IST (the newsroom's zone); the browser then re-renders. */
export function localDate(d: Date, opts: Intl.DateTimeFormatOptions, booted: boolean): string {
  return d.toLocaleDateString("en-IN", booted ? opts : { ...opts, timeZone: IST });
}
