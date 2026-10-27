import { archiveSitemap, newsSitemap, sitemapIndex, xmlDocResponse } from "@/lib/news/sitemap";

/* Every /news sitemap. The proxy rewrites the public file names here:
 *   /news/sitemap.xml            -> news   (Google News, last 48 h)
 *   /news/sitemap-index.xml      -> index
 *   /news/sitemap-YYYY-MM.xml    -> YYYY-MM     (out-of-range periods are a
 *   /news/sitemap-YYYY-MM-DD.xml -> YYYY-MM-DD   404 page before they get here)
 * and answers 404 to this path requested directly. Bodies, Content-Type and
 * Cache-Control are byte-for-byte what the hand-rolled router sent; the CDN
 * caches them, so the handler itself runs per request. */
export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const doc = name === "news" ? await newsSitemap() : name === "index" ? sitemapIndex() : await archiveSitemap(name);
  if (!doc) return new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return xmlDocResponse(doc);
}
