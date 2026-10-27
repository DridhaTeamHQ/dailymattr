import { hubPath, type Category } from "@/lib/categories";
import type { Crumb } from "@/lib/schema";
import { SITE_NAME } from "@/lib/site";
import { formatDate } from "@/lib/text";
import type { HubHead } from "./seo";
import type { FeedPage } from "./types";

/* One page of the "Latest" feed or of a section hub, optionally filtered to
 * one day (?date=YYYY-MM-DD, Indian time). */
export type FeedQuery = { page: number; cat: Category | null; date: string | null };

export const FEED_DESCRIPTION =
  "The latest news in short from dailymattr — 100 fact-checked, human-picked stories a day across India, world, business, technology, sports and entertainment.";

export type FeedView = HubHead & {
  heading: string;
  /* the on-page intro; the meta description adds " — page N" after page 1 */
  intro: string;
  formattedDate: string;
  querySuffix: string;
  prevHref: string;
  nextHref: string;
};

/* everything the hub page and its <head> say, from the query and its rows */
export function feedView({ page, cat, date }: FeedQuery, { posts, hasNext }: FeedPage): FeedView {
  const path = cat ? hubPath(cat) : "/news/";
  const heading = cat ? `${cat.label} news` : "Latest news";
  const formattedDate = date ? formatDate(`${date}T00:00:00+05:30`) : "";
  const intro = date
    ? `Browse ${cat ? cat.label.toLowerCase() : "latest"} news from ${formattedDate || date} on dailymattr.`
    : cat
      ? cat.description
      : FEED_DESCRIPTION;
  const trail: Crumb[] = [
    { name: "Home", path: "/" },
    ...(cat ? [{ name: "News", path: "/news/" }, { name: cat.label, path }] : [{ name: "News", path: "/news/" }]),
  ];
  const title = `${heading}${date ? ` (${formattedDate || date})` : ""}${page > 1 ? ` — page ${page}` : ""} — ${SITE_NAME}`;
  const querySuffix = date ? `?date=${encodeURIComponent(date)}` : "";

  return {
    title,
    /* page 2+ would otherwise repeat page 1's meta description word for
     * word; the title already carries the same marker */
    description: page > 1 ? `${intro} — page ${page}` : intro,
    path,
    posts,
    page,
    hasNext,
    trail,
    date,
    heading,
    intro,
    formattedDate,
    querySuffix,
    prevHref: page === 2 ? `${path}${querySuffix}` : `${path}page/${page - 1}/${querySuffix}`,
    nextHref: `${path}page/${page + 1}/${querySuffix}`,
  };
}

/* "7" from a /page/7/ segment: 1-4 digits, at least 1 */
export function parsePageParam(n: string): number | null {
  if (!/^\d{1,4}$/.test(n)) return null;
  const page = Number(n);
  return page >= 1 ? page : null;
}
