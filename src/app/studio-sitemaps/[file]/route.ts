import { CACHE } from "@/lib/cache";
import { routeStudioSitemap, sitemapResponse } from "@/lib/studio/sitemaps";

/* /news-studio/sitemap*.xml, rewritten here by next.config.ts (the story
 * pages own every other /news-studio/<segment>). Built per request and
 * cached at the CDN by each file's Cache-Control. */
export const maxDuration = 10;

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  try {
    return sitemapResponse(await routeStudioSitemap((await params).file));
  } catch (err) {
    console.error("[news-studio]", err);
    return sitemapResponse({ status: 500, type: "text", cache: CACHE.error, tags: [], body: "Something went wrong\n" });
  }
}

export const HEAD = GET;
