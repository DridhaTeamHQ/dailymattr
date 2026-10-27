/* News Studio sitemaps — same shape as the /news sitemaps:
 *   /news-studio/sitemap.xml             Google News sitemap — stories from the last 48 h
 *   /news-studio/sitemap-index.xml       that, the topics, then one file per day, newest first
 *   /news-studio/sitemap-topics.xml      every trending-topic timeline
 *   /news-studio/sitemap-YYYY-MM-DD.xml  every story added that day (UTC)
 * Server only. */
import { cleanHeadline } from "@/lib/slug";
import { esc } from "@/lib/html";
import { CACHE } from "@/lib/cache";
import { ORIGIN, SITE_NAME } from "@/lib/site";
import { BASE, storyPath, topicPath } from "./routes";
import { fetchStories, fetchTopics, imageOf, iso, type SeoStory } from "./seo-data";

export type SitemapResponse = { status: number; type: "xml" | "text"; cache: string; tags: string[]; body: string };

/* the first day with News Studio stories — nothing before it to list */
const FIRST_DAY = Date.UTC(2026, 5, 23);
const DAY_MS = 86400e3;
const TAGS = ["news-studio-sitemap"];

const pad = (n: number) => String(n).padStart(2, "0");
const xml = (body: string, cache: string): SitemapResponse => ({
  status: 200,
  type: "xml",
  cache,
  tags: TAGS,
  body: `<?xml version="1.0" encoding="UTF-8"?>\n${body}`,
});
const urlset = (urls: string[], cache: string, ns = "") =>
  xml(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${ns}>\n${urls.join("")}</urlset>\n`, cache);
const startOfDay = (d = new Date()) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};
const loc = (path: string, lastmod: string | null | undefined, extra = "") => {
  const mod = iso(lastmod);
  return `  <url>\n    <loc>${esc(ORIGIN + path)}</loc>${mod ? `\n    <lastmod>${mod}</lastmod>` : ""}${extra}\n  </url>\n`;
};
const listable = (s: SeoStory) => Boolean(s.id && s.headline);

async function newsSitemap(): Promise<SitemapResponse> {
  const since = new Date(Date.now() - 48 * 3600e3).toISOString();
  const stories = (await fetchStories(`created_at=gte.${since}&order=created_at.desc&limit=1000`, "news sitemap")).filter(listable);
  return urlset(
    stories.map((s) =>
      loc(
        storyPath(s),
        null,
        `
    <news:news>
      <news:publication>
        <news:name>${esc(SITE_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${iso(s.publishedAt)}</news:publication_date>
      <news:title>${esc(cleanHeadline(s.headline))}</news:title>
    </news:news>`,
      ),
    ),
    CACHE.sitemapNews,
    ` xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"`,
  );
}

function sitemapIndex(): SitemapResponse {
  const locs = [`${BASE}/sitemap.xml`, `${BASE}/sitemap-topics.xml`];
  for (let t = startOfDay(); t >= FIRST_DAY; t -= DAY_MS) locs.push(`${BASE}/sitemap-${dayKey(t)}.xml`);
  return xml(
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locs.map((l) => `  <sitemap><loc>${esc(ORIGIN + l)}</loc></sitemap>\n`).join("")}</sitemapindex>\n`,
    CACHE.sitemapIndex,
  );
}

async function topicsSitemap(): Promise<SitemapResponse> {
  const topics = await fetchTopics();
  return urlset(
    topics.map((t) => loc(topicPath(t), t.modifiedAt)),
    CACHE.sitemapDayCurrent,
  );
}

/* null when the date is not a real calendar day or is outside [FIRST_DAY, today] */
async function daySitemap(y: number, m: number, d: number): Promise<SitemapResponse | null> {
  const t = Date.UTC(y, m - 1, d);
  if (dayKey(t) !== `${y}-${pad(m)}-${pad(d)}`) return null;
  const today = startOfDay();
  if (t < FIRST_DAY || t > today) return null;
  const start = new Date(t).toISOString();
  const end = new Date(t + DAY_MS).toISOString();
  const stories = (
    await fetchStories(`created_at=gte.${start}&created_at=lt.${end}&order=created_at.desc&limit=5000`, "sitemap stories")
  ).filter(listable);
  return urlset(
    stories.map((s) => {
      const img = imageOf(s.image);
      return loc(storyPath(s), s.modifiedAt, img ? `\n    <image:image><image:loc>${esc(img)}</image:loc></image:image>` : "");
    }),
    t === today ? CACHE.sitemapDayCurrent : CACHE.sitemapMonthPast,
    ` xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`,
  );
}

const NOT_FOUND: SitemapResponse = { status: 404, type: "text", cache: CACHE.gone, tags: [], body: "Not found\n" };

/* `file` is the last path segment of /news-studio/<file>; a 404 for an
 * out-of-range day or any other name */
export async function routeStudioSitemap(file: string): Promise<SitemapResponse> {
  if (file === "sitemap.xml") return newsSitemap();
  if (file === "sitemap-index.xml") return sitemapIndex();
  if (file === "sitemap-topics.xml") return topicsSitemap();
  const day = /^sitemap-(\d{4})-(\d{2})-(\d{2})\.xml$/.exec(file);
  if (day) return (await daySitemap(Number(day[1]), Number(day[2]), Number(day[3]))) || NOT_FOUND;
  return NOT_FOUND;
}

const TYPES = { xml: "application/xml; charset=utf-8", text: "text/plain; charset=utf-8" } as const;

export function sitemapResponse({ status, type, cache, tags, body }: SitemapResponse): Response {
  const headers = new Headers({ "Content-Type": TYPES[type], "Cache-Control": cache });
  /* tags make `vercel cache invalidate --tag news-studio-sitemap` possible */
  if (tags.length) headers.set("Vercel-Cache-Tag", tags.join(","));
  return new Response(body, { status, headers });
}
