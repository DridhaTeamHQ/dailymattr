/* CDN cache policy for responses built in route handlers (sitemaps, feeds,
 * redirects). Vercel's CDN honours s-maxage / stale-while-revalidate and
 * strips them before the browser sees the response. */
export const CACHE = {
  article:  "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  redirect: "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  gone:     "public, max-age=0, s-maxage=300, stale-while-revalidate=600", // 404 and 410
  feed:     "public, max-age=0, s-maxage=120, stale-while-revalidate=600",
  sitemapIndex:        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  sitemapNews:         "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
  sitemapMonthCurrent: "public, max-age=0, s-maxage=1800, stale-while-revalidate=3600",
  sitemapMonthPast:    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800", // also past days
  sitemapDayCurrent:   "public, max-age=0, s-maxage=600, stale-while-revalidate=1800",
  error:    "no-store",
} as const;

export type CachePolicy = (typeof CACHE)[keyof typeof CACHE];

/* a 301 that CDNs keep for a day, as the hand-rolled routes sent them */
export function moved(location: string) {
  return new Response(`Moved permanently: ${location}\n`, {
    status: 301,
    headers: { Location: location, "Cache-Control": CACHE.redirect, "Content-Type": "text/plain; charset=utf-8" },
  });
}

export function xmlResponse(body: string, cache: string) {
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": cache } });
}
