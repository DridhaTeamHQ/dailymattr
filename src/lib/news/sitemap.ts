import { CACHE } from "@/lib/cache";
import { esc } from "@/lib/html";
import { ORIGIN, SITE_NAME } from "@/lib/site";
import { articlePath, cleanHeadline, isValidId } from "@/lib/slug";
import { modifiedAt } from "@/lib/text";
import { artworkFor } from "./media";
import { listBetween, listRecentForNews } from "./queries";
import type { SitemapRow } from "./types";

/* XML sitemaps for the news section:
 *   /news/sitemap.xml             Google News sitemap — stories from the last 48 h
 *   /news/sitemap-index.xml       the news sitemap, then one sitemap per month and
 *                                 one per day, each newest first
 *   /news/sitemap-YYYY-MM.xml     every live story published that month (UTC), no images
 *   /news/sitemap-YYYY-MM-DD.xml  every live story published that day (UTC)
 * Only the current month and today change, so past files cache for long and
 * crawlers re-fetch one small daily file instead of the whole month.
 * Every value is from the CMS and is escaped; every URL is on ORIGIN. */

export type XmlDoc = { body: string; cache: string };

export const SITEMAP_TAGS = "news,news-sitemap";

/* the first month with live stories — nothing before it to list */
const FIRST_MONTH = { y: 2026, m: 8 };
const FIRST_DAY = Date.UTC(FIRST_MONTH.y, FIRST_MONTH.m - 1, 1);
const DAY_MS = 86400e3;

const XML_HEAD = `<?xml version="1.0" encoding="UTF-8"?>\n`;

/* a row the article route can resolve; anything else is left out */
const listable = (p: SitemapRow) => isValidId(p.published_id) && Boolean(p.headline) && Boolean(p.published_at);

const pad = (n: number) => String(n).padStart(2, "0");
const monthKey = (y: number, m: number) => y * 12 + (m - 1);
const startOfDay = (now: Date) => Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

/* every day from FIRST_DAY to today (UTC), newest first */
function daysSoFar(now = new Date()) {
  const out: { y: number; m: number; d: number }[] = [];
  for (let t = startOfDay(now); t >= FIRST_DAY; t -= DAY_MS) {
    const d = new Date(t);
    out.push({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() });
  }
  return out;
}

/* every month from FIRST_MONTH to this month (UTC), newest first */
function monthsSoFar(now = new Date()) {
  const out: { y: number; m: number }[] = [];
  for (let k = monthKey(now.getUTCFullYear(), now.getUTCMonth() + 1); k >= monthKey(FIRST_MONTH.y, FIRST_MONTH.m); k--) {
    out.push({ y: Math.floor(k / 12), m: (k % 12) + 1 });
  }
  return out;
}

/* a monthly or daily archive file: every story with lastmod, plus artwork when
 * images is set (monthly files leave it out — they are for article indexing) */
function archive(posts: SitemapRow[], cache: string, { images = true } = {}): XmlDoc {
  const urls = posts
    .map((p) => {
      const img = images && artworkFor(p);
      return `  <url>
    <loc>${esc(ORIGIN + articlePath(p))}</loc>
    <lastmod>${modifiedAt(p)}</lastmod>${img ? `
    <image:image><image:loc>${esc(img)}</image:loc></image:image>` : ""}
  </url>\n`;
    })
    .join("");
  const ns = images ? ` xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"` : "";
  return {
    body: XML_HEAD + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${ns}>\n${urls}</urlset>\n`,
    cache,
  };
}

export async function newsSitemap(): Promise<XmlDoc> {
  const posts = (await listRecentForNews(48, 1000)).filter(listable);
  const urls = posts
    .map(
      (p) => `  <url>
    <loc>${esc(ORIGIN + articlePath(p))}</loc>
    <news:news>
      <news:publication>
        <news:name>${esc(SITE_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(p.published_at).toISOString()}</news:publication_date>
      <news:title>${esc(cleanHeadline(p.headline))}</news:title>
    </news:news>
  </url>\n`,
    )
    .join("");
  return {
    body:
      XML_HEAD +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${urls}</urlset>\n`,
    cache: CACHE.sitemapNews,
  };
}

export function sitemapIndex(): XmlDoc {
  const locs = [
    `${ORIGIN}/news/sitemap.xml`,
    ...monthsSoFar().map(({ y, m }) => `${ORIGIN}/news/sitemap-${y}-${pad(m)}.xml`),
    ...daysSoFar().map(({ y, m, d }) => `${ORIGIN}/news/sitemap-${y}-${pad(m)}-${pad(d)}.xml`),
  ];
  return {
    body:
      XML_HEAD +
      `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locs.map((l) => `  <sitemap><loc>${esc(l)}</loc></sitemap>\n`).join("")}</sitemapindex>\n`,
    cache: CACHE.sitemapIndex,
  };
}

/* An archive file name — "2026-10" (month) or "2026-10-27" (day) — that
 * names a period with a sitemap: a real calendar day in [FIRST_DAY, today],
 * or a month in [FIRST_MONTH, this month], UTC. Pure date arithmetic, so the
 * proxy can answer 404 before anything is queried. */
export type ArchivePeriod = { kind: "day"; y: number; m: number; d: number } | { kind: "month"; y: number; m: number };

export function archivePeriod(key: string, now = new Date()): ArchivePeriod | null {
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (day) {
    const [y, m, d] = [Number(day[1]), Number(day[2]), Number(day[3])];
    const t = Date.UTC(y, m - 1, d);
    const date = new Date(t);
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
    if (t < FIRST_DAY || t > startOfDay(now)) return null;
    return { kind: "day", y, m, d };
  }
  const month = /^(\d{4})-(\d{2})$/.exec(key);
  if (month) {
    const [y, m] = [Number(month[1]), Number(month[2])];
    const k = monthKey(y, m);
    if (m < 1 || m > 12 || k < monthKey(FIRST_MONTH.y, FIRST_MONTH.m) || k > monthKey(now.getUTCFullYear(), now.getUTCMonth() + 1)) {
      return null;
    }
    return { kind: "month", y, m };
  }
  return null;
}

/* the archive file for a period; null when it is out of range */
export async function archiveSitemap(key: string): Promise<XmlDoc | null> {
  const now = new Date();
  const period = archivePeriod(key, now);
  if (!period) return null;
  if (period.kind === "day") {
    const t = Date.UTC(period.y, period.m - 1, period.d);
    const posts = (await listBetween(new Date(t).toISOString(), new Date(t + DAY_MS).toISOString())).filter(listable);
    return archive(posts, t === startOfDay(now) ? CACHE.sitemapDayCurrent : CACHE.sitemapMonthPast);
  }
  const start = new Date(Date.UTC(period.y, period.m - 1, 1)).toISOString();
  const end = new Date(Date.UTC(period.y, period.m, 1)).toISOString();
  const posts = (await listBetween(start, end)).filter(listable);
  const current = monthKey(period.y, period.m) === monthKey(now.getUTCFullYear(), now.getUTCMonth() + 1);
  return archive(posts, current ? CACHE.sitemapMonthCurrent : CACHE.sitemapMonthPast, { images: false });
}

/* XML with the cache policy and CDN tags the hand-rolled router sent */
export const xmlDocResponse = ({ body, cache }: XmlDoc) =>
  new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": cache,
      "Vercel-Cache-Tag": SITEMAP_TAGS,
    },
  });
