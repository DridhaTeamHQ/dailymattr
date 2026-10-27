import { CACHE } from "@/lib/cache";
import { categoryBySlug, type Category } from "@/lib/categories";
import { isValidId } from "@/lib/slug";
import { isValidDateStr } from "@/lib/text";
import { archivePeriod } from "./sitemap";

/* The public URL space of /news, exactly as the hand-rolled router drew it,
 * and where each URL lives in src/app/news. The proxy (proxy.ts) acts on the
 * answer; this module makes no requests, so the smoke test can walk every
 * shape.
 *
 * App Router pages cannot tell /news/page/2/ from /news/page/2, nor send a
 * 301 or a 410, so those decisions are made here, before routing:
 *   - every non-canonical spelling (missing or extra trailing slash, a
 *     zero-padded or page-1 number, bare /news) gets a 301
 *   - a hub's first page and every ?date= filtered page are rewritten to the
 *     route that renders them (the date becomes a path segment, so the
 *     unfiltered pages stay statically cached)
 *   - anything that is not a public URL — including those internal rewrite
 *     targets when requested directly — is rewritten to the 404 route
 *   - an article URL needs a lookup (stale slug -> 301, withdrawn -> 410) */

/* a path only the [...rest] catch-all matches; it renders the news 404 */
export const NOT_FOUND_PATH = "/news/_/not-found";

/* the page whose HTML the proxy serves with a 410 (fetched with the header) */
export const GONE_PATH = "/news/withdrawn";
export const INTERNAL_HEADER = "x-dailymattr-news-internal";

/* Where the sitemaps are answered: one route handler, app/news/sitemaps/
 * [name], with name "news" (/news/sitemap.xml), "index" (/news/sitemap-
 * index.xml) or an archive period ("2026-10", "2026-10-27"). A route folder
 * can't be called sitemap.xml: Next takes any route ending in /sitemap.xml
 * for its own metadata-file convention. */
export const sitemapPath = (name: string) => `/news/sitemaps/${name}`;

export type NewsRoute =
  | { kind: "redirect"; location: string }
  /* render the URL as it is (headers: CDN policy + tags) */
  | { kind: "pass"; cache?: string; tags?: string }
  | { kind: "rewrite"; to: string; cache?: string; tags?: string }
  | { kind: "notFound" }
  | { kind: "article"; slug: string; id: string; trailing: boolean };

/* ?date=YYYY-MM-DD, a real day. Repeated, it is ignored, as the original
 * serverless function did (it arrived there as an array). */
export function dateParam(query: URLSearchParams): string | null {
  const all = query.getAll("date");
  if (all.length !== 1) return null;
  const raw = all[0].trim();
  return isValidDateStr(raw) ? raw : null;
}

export const feedTags = (cat: Category | null) => ["news", "news-hub", ...(cat ? [`news-cat-${cat.slug}`] : [])].join(",");

function feed(page: number, cat: Category | null, date: string | null): NewsRoute {
  const tags = feedTags(cat);
  const base = cat ? `/news/${cat.slug}` : "/news";
  /* a filtered day renders per request and is never cached, as before */
  if (date) return { kind: "rewrite", to: `${base}/page/${page}/${date}`, cache: CACHE.error, tags };
  /* /news/<cat>/ is the hub route's page 1 */
  if (cat && page === 1) return { kind: "rewrite", to: `${base}/page/1`, cache: CACHE.feed, tags };
  return { kind: "pass", cache: CACHE.feed, tags };
}

export function resolveNewsPath(pathname: string, query: URLSearchParams): NewsRoute {
  const date = dateParam(query);
  const qs = date ? `?date=${encodeURIComponent(date)}` : "";
  const redirect = (location: string): NewsRoute => ({ kind: "redirect", location });

  if (pathname === "/news") return redirect(`/news/${qs}`);
  if (!pathname.startsWith("/news/")) return { kind: "notFound" };

  /* everything after "/news/", trailing slash included */
  const rest = pathname.slice("/news/".length);
  const trailing = rest.endsWith("/");
  const body = trailing ? rest.slice(0, -1) : rest;

  /* /news/sitemap.xml (Google News, last 48 h), /news/sitemap-index.xml, the
   * monthly /news/sitemap-YYYY-MM.xml and daily /news/sitemap-YYYY-MM-DD.xml */
  if (rest === "sitemap.xml") return { kind: "rewrite", to: sitemapPath("news") };
  if (rest === "sitemap-index.xml") return { kind: "rewrite", to: sitemapPath("index") };
  const archive = /^sitemap-(\d{4}-\d{2}(?:-\d{2})?)\.xml$/.exec(rest);
  if (archive) {
    return archivePeriod(archive[1]) ? { kind: "rewrite", to: sitemapPath(archive[1]) } : { kind: "notFound" };
  }

  /* /news/latest.json — the newest stories, for the homepage section */
  if (rest === "latest.json") return { kind: "pass" };

  /* /news/ and /news/page/N/ — page 0 doesn't exist, and a zero-padded
   * number redirects to the one canonical form like every other variant */
  if (body === "") return trailing || rest === "" ? feed(1, null, date) : redirect(`/news/${qs}`);
  const feedPage = /^page\/(\d{1,4})$/.exec(body);
  if (feedPage) {
    const n = Number(feedPage[1]);
    if (n < 1) return { kind: "notFound" };
    if (n === 1) return redirect(`/news/${qs}`);
    return trailing && feedPage[1] === String(n) ? feed(n, null, date) : redirect(`/news/page/${n}/${qs}`);
  }

  /* /news/<category>/ and /news/<category>/page/N/ */
  const hub = /^([a-z]{2,30})(?:\/page\/(\d{1,4}))?$/.exec(body);
  if (hub) {
    const cat = categoryBySlug(hub[1]);
    if (cat) {
      const n = hub[2] ? Number(hub[2]) : 1;
      if (n < 1) return { kind: "notFound" };
      const base = `/news/${cat.slug}/`;
      if (hub[2] && n === 1) return redirect(`${base}${qs}`);
      const want = n === 1 ? `${base}${qs}` : `${base}page/${n}/${qs}`;
      return trailing && (!hub[2] || hub[2] === String(n)) ? feed(n, cat, date) : redirect(want);
    }
  }

  /* /news/<slug>-<published_id> — resolution is by the trailing id only */
  const art = /^(?:(.*)-)?(\d{1,12})$/.exec(body);
  if (art && isValidId(art[2])) return { kind: "article", slug: art[1] || "", id: art[2], trailing };

  return { kind: "notFound" };
}
