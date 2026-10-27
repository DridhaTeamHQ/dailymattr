import { NextResponse, type NextRequest } from "next/server";
import { CACHE } from "@/lib/cache";
import { categoryById } from "@/lib/categories";
import { articlePath, slugify } from "@/lib/slug";
import { lookupPublishedId } from "./queries";
import { GONE_PATH, INTERNAL_HEADER, NOT_FOUND_PATH, resolveNewsPath, type NewsRoute } from "./routing";

/* The part of the /news router App Router pages can't do: 301s to the one
 * canonical spelling of every URL, the 410 for withdrawn stories, and the
 * rewrites that map public URLs onto src/app/news (see routing.ts). Returns
 * undefined to let the route render untouched. */

/* ---------- article lookups ---------- */

type Article = { gone: true } | { gone: false; path: string; slug: string; tags: string };

/* canonical path by id, so a busy story costs one lookup per instance per
 * ten minutes rather than one per view. A miss is remembered briefly only:
 * a scheduled story must start answering soon after it goes live. */
const TTL_MS = 10 * 60e3;
const MISS_TTL_MS = 60e3;
const known = new Map<string, { value: Article | null; until: number }>();

async function lookupArticle(id: string): Promise<Article | null> {
  const hit = known.get(id);
  if (hit && hit.until > Date.now()) return hit.value;
  const found = await lookupPublishedId(id);
  let value: Article | null = null;
  if (found && "gone" in found) value = { gone: true };
  else if (found) {
    const cat = categoryById(found.post.category_id);
    value = {
      gone: false,
      path: articlePath(found.post),
      slug: slugify(found.post.headline),
      tags: ["news", `news-post-${found.post.published_id}`, ...(cat ? [`news-cat-${cat.slug}`] : [])].join(","),
    };
  }
  if (known.size > 5000) known.clear();
  known.set(id, { value, until: Date.now() + (value ? TTL_MS : MISS_TTL_MS) });
  return value;
}

/* ---------- responses ---------- */

const withHeaders = (res: NextResponse, cache?: string, tags?: string) => {
  /* Next leaves a Cache-Control it finds on the response alone, so the old
   * CDN policy survives; ISR still decides when the HTML is re-rendered */
  if (cache) res.headers.set("Cache-Control", cache);
  if (tags) res.headers.set("Vercel-Cache-Tag", tags);
  return res;
};

const rewrite = (request: NextRequest, to: string, cache?: string, tags?: string) =>
  withHeaders(NextResponse.rewrite(new URL(`${to}${request.nextUrl.search}`, request.url)), cache, tags);

const notFound = (request: NextRequest) => rewrite(request, NOT_FOUND_PATH, CACHE.gone, "news");

/* Proxy responses need an absolute Location; Next sends it relative again
 * for same-host targets, as the hand-rolled router did */
const moved = (request: NextRequest, location: string) =>
  new Response(`Moved permanently: ${location}\n`, {
    status: 301,
    headers: {
      Location: new URL(location, request.url).href,
      "Cache-Control": CACHE.redirect,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });

/* The 410 page is an ordinary prerendered page (app/news/withdrawn), fetched
 * once per instance and served with the right status. Should that fetch
 * fail, a bare document says the same thing. */
let goneHtml: { body: string; until: number } | null = null;

const GONE_FALLBACK = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Story no longer available — dailymattr</title>
  <meta name="description" content="This story is not available." />
  <meta name="robots" content="noindex,follow" />
</head>
<body>
  <main>
    <h1>This story is no longer available</h1>
    <p>It was taken down after publication. Head back to <a href="/news/">the latest news</a> or the <a href="/">home page</a>.</p>
  </main>
</body>
</html>
`;

async function goneBody(request: NextRequest): Promise<string> {
  if (goneHtml && goneHtml.until > Date.now()) return goneHtml.body;
  try {
    const res = await fetch(new URL(GONE_PATH, request.url), { headers: { [INTERNAL_HEADER]: "1" } });
    if (res.ok) {
      const body = await res.text();
      goneHtml = { body, until: Date.now() + TTL_MS };
      return body;
    }
    console.error("[news proxy] withdrawn page answered", res.status);
  } catch (err) {
    console.error("[news proxy] withdrawn page", err);
  }
  return GONE_FALLBACK;
}

async function gone(request: NextRequest): Promise<Response> {
  /* a client-side navigation (RSC fetch) gets no page: a non-OK answer makes
   * the router load the URL as a document, which then gets the page below */
  const rsc = request.headers.get("rsc") === "1";
  return new Response(rsc ? "Gone\n" : await goneBody(request), {
    status: 410,
    headers: {
      "Content-Type": rsc ? "text/plain; charset=utf-8" : "text/html; charset=utf-8",
      "Cache-Control": CACHE.gone,
      "Vercel-Cache-Tag": "news",
    },
  });
}

/* ---------- the proxy ---------- */

export async function newsProxy(request: NextRequest): Promise<Response | undefined> {
  const { pathname, searchParams } = request.nextUrl;

  /* the 410 page answers the proxy's own fetch only */
  if (pathname === GONE_PATH && request.headers.get(INTERNAL_HEADER) === "1") return undefined;

  const route: NewsRoute = resolveNewsPath(pathname, searchParams);
  switch (route.kind) {
    case "redirect":
      return moved(request, route.location);
    case "notFound":
      return notFound(request);
    case "rewrite":
      return rewrite(request, route.to, route.cache, route.tags);
    case "pass":
      return route.cache || route.tags ? withHeaders(NextResponse.next(), route.cache, route.tags) : undefined;
    case "article": {
      let article: Article | null;
      try {
        article = await lookupArticle(route.id);
      } catch (err) {
        /* lookup failed: let the page answer (it does its own lookup) */
        console.error("[news proxy]", err);
        return undefined;
      }
      if (!article) return notFound(request);
      if (article.gone) return gone(request);
      /* one URL per story: a stale or mistyped slug, or a stray trailing
       * slash, redirects rather than serving duplicate content */
      if (route.trailing || route.slug !== article.slug) return moved(request, article.path);
      return withHeaders(NextResponse.next(), CACHE.article, article.tags);
    }
  }
}
