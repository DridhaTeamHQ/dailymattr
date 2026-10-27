/* Walks every /news URL shape through the real modules and asserts the SEO
 * payload is present, exact and safe. Read-only. Reads the real database when
 * PIX_SUPABASE_SERVICE_ROLE_KEY is set (env, .env.local or .env), otherwise
 * the dev snapshot (src/lib/news/_data/pix-snapshot.json).
 *
 *   node scripts/smoke-news.mjs                              modules only
 *   node scripts/smoke-news.mjs --base=http://localhost:3000 also the running app
 *
 * The modules are TypeScript with "@/" imports, which Node can't load on its
 * own; jiti (already installed with Tailwind) transpiles them on the fly.
 * The first part covers the proxy (every 301 / rewrite / 404 / 410 decision),
 * the metadata and JSON-LD builders, the sitemaps and latest.json. Rendered
 * HTML needs a server (next dev or next start): pass --base for that part. */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

/* same loader as pull-pix-snapshot.mjs; values are never printed */
for (const f of [".env.local", ".env"]) {
  const p = join(root, f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
}

let createJiti;
try {
  ({ createJiti } = await import("jiti"));
} catch {
  console.error("This script loads the TypeScript modules with jiti: npm i -D jiti");
  process.exit(2);
}
const src = join(root, "src").replace(/\\/g, "/");
const jiti = createJiti(import.meta.url, { alias: { "@/": `${src}/` }, interopDefault: true, moduleCache: true });
const load = (p) => jiti.import(`${src}/${p}`);

const { dataSource, listLive } = await load("lib/news/queries.ts");
const { newsProxy } = await load("lib/news/proxy.ts");
const { NOT_FOUND_PATH, GONE_PATH, INTERNAL_HEADER } = await load("lib/news/routing.ts");
const { articleSeo, articleMetadata, articleJsonLd, hubMetadata, hubJsonLd, errorMetadata } = await load("lib/news/seo.ts");
const { feedView } = await load("lib/news/feed.ts");
const { newsSitemap, sitemapIndex, archiveSitemap } = await load("lib/news/sitemap.ts");
const { latestJsonBody } = await load("lib/news/latest.ts");
const { slidesFor, posterFor, artworkFor } = await load("lib/news/media.ts");
const { slugify, cleanHeadline } = await load("lib/slug.ts");
const { esc, safeJsonLd } = await load("lib/html.ts");
const { categoryBySlug } = await load("lib/categories.ts");
const { CACHE } = await load("lib/cache.ts");
const { NextRequest } = await jiti.import("next/server");

const ORIGIN = "https://www.dailymattr.com";
const base = process.argv.find((a) => a.startsWith("--base="))?.slice(7).replace(/\/+$/, "");

let failures = 0;
const check = (name, cond, extra = "") => {
  if (cond) console.log(`  ok   ${name}`);
  else {
    console.log(`  FAIL ${name}${extra ? " — " + extra : ""}`);
    failures++;
  }
};

console.log("data source:", dataSource());
if (dataSource() === "none") {
  console.error(
    "\nNo data to render: set PIX_SUPABASE_URL and PIX_SUPABASE_SERVICE_ROLE_KEY (env, .env.local or .env),\nor pull the dev snapshot with scripts/pull-pix-snapshot.mjs.",
  );
  process.exit(2);
}

const { posts } = await listLive({ page: 1, size: 1 });
const sample = posts[0];
const canonicalTail = `${slugify(sample.headline)}-${sample.published_id}`;

/* ---------- the proxy: what each URL turns into ---------- */

/* a host that resolves nowhere, so the 410 page fetch can't leave the machine */
const HOST = "http://news.test";

async function route(path, headers = {}) {
  const res = await newsProxy(new NextRequest(HOST + path, { headers }));
  if (!res) return { kind: "render" };
  const h = res.headers;
  const cache = h.get("cache-control");
  const tags = h.get("vercel-cache-tag");
  if (res.status === 301) {
    const u = new URL(h.get("location"));
    return { kind: "301", location: u.pathname + u.search, cache, body: await res.text() };
  }
  if (h.get("x-middleware-rewrite")) {
    const u = new URL(h.get("x-middleware-rewrite"));
    return { kind: u.pathname === NOT_FOUND_PATH ? "404" : "rewrite", to: u.pathname, cache, tags };
  }
  if (h.get("x-middleware-next")) return { kind: "render", cache, tags };
  return { kind: String(res.status), cache, tags, type: h.get("content-type"), body: await res.text() };
}

const expectRoute = async (path, want, headers) => {
  const r = await route(path, headers);
  const ok = Object.entries(want).every(([k, v]) => r[k] === v);
  check(`${path} -> ${Object.values(want).join(" ")}`, ok, JSON.stringify(r));
  return r;
};

console.log("\nfeed and hubs");
await expectRoute("/news", { kind: "301", location: "/news/" });
await expectRoute("/news?date=2026-09-01", { kind: "301", location: "/news/?date=2026-09-01" });
{
  const r = await expectRoute("/news/", { kind: "render", cache: CACHE.feed, tags: "news,news-hub" });
  check("301 body as before", (await route("/news")).body === "Moved permanently: /news/\n");
  check("301 cache policy", (await route("/news")).cache === CACHE.redirect);
  void r;
}
await expectRoute("/news/?date=2026-09-01", { kind: "rewrite", to: "/news/page/1/2026-09-01", cache: "no-store" });
await expectRoute("/news/?date=2026-02-30", { kind: "render" });
await expectRoute("/news/?date=2026-09-01&date=2026-09-02", { kind: "render" });
await expectRoute("/news/page/2/", { kind: "render", cache: CACHE.feed });
await expectRoute("/news/page/2", { kind: "301", location: "/news/page/2/" });
await expectRoute("/news/page/1/", { kind: "301", location: "/news/" });
await expectRoute("/news/page/1/?date=2026-09-01", { kind: "301", location: "/news/?date=2026-09-01" });
await expectRoute("/news/page/0/", { kind: "404" });
await expectRoute("/news/page/0002/", { kind: "301", location: "/news/page/2/" });
await expectRoute("/news/page/2/?date=2026-09-01", { kind: "rewrite", to: "/news/page/2/2026-09-01" });
await expectRoute("/news/india/", { kind: "rewrite", to: "/news/india/page/1", cache: CACHE.feed, tags: "news,news-hub,news-cat-india" });
await expectRoute("/news/india", { kind: "301", location: "/news/india/" });
await expectRoute("/news/india/?date=2026-09-01", { kind: "rewrite", to: "/news/india/page/1/2026-09-01" });
await expectRoute("/news/india/page/2/", { kind: "render", tags: "news,news-hub,news-cat-india" });
await expectRoute("/news/india/page/1/", { kind: "301", location: "/news/india/" });
await expectRoute("/news/india/page/02/", { kind: "301", location: "/news/india/page/2/" });
await expectRoute("/news/india/page/0/", { kind: "404" });
await expectRoute("/news/India/", { kind: "404" });
await expectRoute("/news/not-a-category/", { kind: "404" });

console.log("\nfiles");
await expectRoute("/news/sitemap.xml", { kind: "rewrite", to: "/news/sitemaps/news" });
await expectRoute("/news/sitemap-index.xml", { kind: "rewrite", to: "/news/sitemaps/index" });
await expectRoute("/news/sitemap-2026-08.xml", { kind: "rewrite", to: "/news/sitemaps/2026-08" });
await expectRoute("/news/sitemap-2026-08-15.xml", { kind: "rewrite", to: "/news/sitemaps/2026-08-15" });
await expectRoute("/news/sitemap-1999-01-01.xml", { kind: "404" });
await expectRoute("/news/sitemap-2026-02-30.xml", { kind: "404" });
await expectRoute("/news/sitemap-1999-01.xml", { kind: "404" });
await expectRoute("/news/sitemap.xml/", { kind: "404" });
await expectRoute("/news/latest.json", { kind: "render" });
await expectRoute("/news/latest.json/", { kind: "404" });

console.log("\ninternal paths are not public URLs");
await expectRoute(GONE_PATH, { kind: "404" });
await expectRoute(GONE_PATH, { kind: "render" }, { [INTERNAL_HEADER]: "1" });
await expectRoute("/news/sitemaps/news", { kind: "404" });
await expectRoute("/news/india/page/1", { kind: "301", location: "/news/india/" });
await expectRoute("/news/page/1/2026-09-01", { kind: "404" });
await expectRoute(NOT_FOUND_PATH, { kind: "404" });

console.log("\narticle");
{
  const r = await route(`/news/${canonicalTail}`);
  check(
    `/news/${canonicalTail} -> render, article cache, post tag`,
    r.kind === "render" && r.cache === CACHE.article && Boolean(r.tags?.startsWith(`news,news-post-${sample.published_id}`)),
    JSON.stringify(r),
  );
}
await expectRoute(`/news/${canonicalTail}?date=2026-09-01`, { kind: "render" });
await expectRoute(`/news/wrong-slug-${sample.published_id}`, { kind: "301", location: `/news/${canonicalTail}` });
await expectRoute(`/news/${canonicalTail}/`, { kind: "301", location: `/news/${canonicalTail}` });
await expectRoute(`/news/${sample.published_id}`, { kind: "301", location: `/news/${canonicalTail}` });
await expectRoute("/news/definitely-not-a-story-999999999", { kind: "404" });
{
  /* a story that was public and has been taken down */
  let goneId = null;
  if (dataSource() === "supabase") {
    const { pixDb } = await load("lib/news/supabase.ts");
    const { data } = await pixDb()
      .from("pix_posts")
      .select("published_id")
      .eq("rejected", true)
      .lte("published_at", new Date().toISOString())
      .not("published_id", "is", null)
      .limit(1);
    goneId = data?.[0]?.published_id ?? null;
  }
  if (goneId) {
    await expectRoute(`/news/x-${goneId}`, { kind: "410", cache: CACHE.gone }, { rsc: "1" });
    console.log("  (the 410 page fetch can't reach news.test, so the proxy's fallback document is served)");
    const page = await route(`/news/x-${goneId}`);
    check("410 document is HTML with noindex", page.kind === "410" && /text\/html/.test(page.type) && page.body.includes("noindex"));
  } else console.log("  --   no withdrawn story to test the 410 with");
}

/* ---------- head: metadata and JSON-LD ---------- */

console.log("\narticle head");
{
  const seo = articleSeo(sample);
  const meta = articleMetadata(seo);
  const url = `${ORIGIN}/news/${canonicalTail}`;
  check("canonical self", meta.alternates.canonical === url, meta.alternates.canonical);
  check("robots", meta.robots === "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
  check("<title> carries the brand, og:title doesn't", meta.title.absolute === `${seo.title} | dailymattr` && meta.openGraph.title === seo.title);
  check("title has no accent markers", !/[[\]{}()]/.test(seo.title) || seo.title === cleanHeadline(sample.headline));
  check("og:type article, og:locale en_IN, og:site_name", meta.openGraph.type === "article" && meta.openGraph.locale === "en_IN" && meta.openGraph.siteName === "dailymattr");
  check("og:url is the canonical", meta.openGraph.url === url);
  check("twitter large image", meta.twitter.card === "summary_large_image");
  const og = meta.openGraph.images?.[0];
  check("og:image is resized", !og || /\/render\/image\/public\/.*width=\d+/.test(og.url), og?.url);
  check("og:image:width only when known, never the old 920 guess", !og || og.width === undefined || (og.width > 0 && og.width <= 1200));
  check("twitter:image is the poster as stored", !seo.poster || meta.twitter.images?.[0]?.url === seo.poster);
  check("article times", meta.openGraph.publishedTime === new Date(sample.published_at).toISOString() && new Date(meta.openGraph.modifiedTime) >= new Date(meta.openGraph.publishedTime));
  check("description <= 155 chars", !meta.description || meta.description.length <= 155);

  const [graph, ld, crumbs] = articleJsonLd(seo);
  check("@graph: WebSite + WebPage", graph["@graph"]?.[0]?.["@type"] === "WebSite" && graph["@graph"]?.[1]?.["@type"] === "WebPage");
  check("NewsArticle", ld["@type"] === "NewsArticle");
  check("mainEntityOfPage is self", ld.mainEntityOfPage["@id"] === url);
  check("dateModified >= datePublished", new Date(ld.dateModified) >= new Date(ld.datePublished));
  check("articleBody is the bullets", ld.articleBody.length > 100 && !ld.articleBody.includes("["));
  check("author is the desk", ld.author?.name === "dailymattr Editorial Team");
  check("BreadcrumbList", crumbs["@type"] === "BreadcrumbList" && crumbs.itemListElement.at(-1).item === url);
  check("every JSON-LD block survives escaping", [graph, ld, crumbs].every((g) => JSON.stringify(JSON.parse(safeJsonLd(g))) === JSON.stringify(g)));
  check("slides use the resizer or are dropped", seo.heroImages.every((h) => h.url.startsWith("https://")));
  check("slide images are reachable hosts only", !JSON.stringify(seo).includes("shortly-bucket"));
}

console.log("\nhub head");
{
  const p1 = await listLive({ page: 1, size: 30 });
  const v1 = feedView({ page: 1, cat: null, date: null }, p1);
  const m1 = hubMetadata(v1);
  check("feed title", m1.title.absolute === "Latest news — dailymattr");
  check("feed canonical", m1.alternates.canonical === `${ORIGIN}/news/`);
  check("feed robots", m1.robots === "index,follow,max-image-preview:large");
  check("og:url = canonical, og:image default, no og:locale", m1.openGraph.url === `${ORIGIN}/news/` && m1.openGraph.images[0].url === `${ORIGIN}/assets/og-default.jpg` && !m1.openGraph.locale);
  check("no rel=prev on page 1", !m1.pagination.previous);
  check("rel=next when there is a page 2", !p1.hasNext || m1.pagination.next === `${ORIGIN}/news/page/2/`);
  const [site, coll, crumbs] = hubJsonLd(v1);
  check("WebSite + CollectionPage + BreadcrumbList", site["@type"] === "WebSite" && site["@context"] && coll["@type"] === "CollectionPage" && crumbs["@type"] === "BreadcrumbList");
  check("ItemList links are canonical article URLs", coll.mainEntity.itemListElement.every((it) => /^https:\/\/www\.dailymattr\.com\/news\/[a-z0-9-]+-\d+$/.test(it.url)));

  const p2 = await listLive({ page: 2, size: 30 });
  if (p2.posts.length) {
    const v2 = feedView({ page: 2, cat: null, date: null }, p2);
    const m2 = hubMetadata(v2);
    check("page 2 canonical", m2.alternates.canonical === `${ORIGIN}/news/page/2/`);
    check("page 2 title", m2.title.absolute === "Latest news — page 2 — dailymattr");
    check("page 2 description is its own", m2.description.endsWith(" — page 2"));
    check("page 2 rel=prev is page 1", m2.pagination.previous === `${ORIGIN}/news/`);
    check("page 2 ItemList starts after page 1", hubJsonLd(v2)[1].mainEntity.itemListElement[0].position === 31);
  }

  const india = categoryBySlug("india");
  const vi = feedView({ page: 1, cat: india, date: null }, await listLive({ categoryId: india.id, page: 1, size: 30 }));
  const mi = hubMetadata(vi);
  check("hub heading and title", vi.heading === "India news" && mi.title.absolute === "India news — dailymattr");
  check("hub canonical", mi.alternates.canonical === `${ORIGIN}/news/india/`);
  check("hub description is the section's", mi.description === india.description);
  check("hub breadcrumb Home > News > India", hubJsonLd(vi)[2].itemListElement.map((i) => i.name).join(">") === "Home>News>India");

  const vd = feedView({ page: 2, cat: null, date: "2026-09-01" }, { posts: p1.posts, hasNext: true });
  const md = hubMetadata(vd);
  check("date filter is noindex", md.robots === "noindex,follow");
  check("date filter canonical drops the date", md.alternates.canonical === `${ORIGIN}/news/page/2/`);
  check("rel=prev/next keep ?date", md.pagination.previous === `${ORIGIN}/news/?date=2026-09-01` && md.pagination.next === `${ORIGIN}/news/page/3/?date=2026-09-01`);
  check("date filter title", md.title.absolute === "Latest news (1 September 2026) — page 2 — dailymattr", md.title.absolute);
  check("pager keeps ?date", vd.prevHref === "/news/?date=2026-09-01" && vd.nextHref === "/news/page/3/?date=2026-09-01");
}

console.log("\nerror heads");
{
  const e404 = errorMetadata(404);
  const e410 = errorMetadata(410);
  check("404 head", e404.title.absolute === "Not found — dailymattr" && e404.description === "This story is not available." && e404.robots === "noindex,follow");
  check("410 head", e410.title.absolute === "Story no longer available — dailymattr" && e410.robots === "noindex,follow");
}

console.log("\nhead safety");
{
  const nasty = `</title><script>x</script> & "q"`;
  const seo = articleSeo({ id: 1, headline: nasty, detail_body: "• x", published_at: "2026-09-01T00:00:00Z", published_id: "1" });
  check("JSON-LD can't close its <script>", !safeJsonLd(articleJsonLd(seo)).includes("</script>"));
  const bad = articleSeo({ id: 1, headline: "x", detail_body: "• x", published_at: "2026-09-01T00:00:00Z", published_id: `1"><script>` });
  check("malformed published_id never reaches the head", bad.url.endsWith("/news/") && !JSON.stringify(articleMetadata(bad)).includes(`"><script>`));
}

/* ---------- files ---------- */

console.log("\nsitemaps");
{
  const wellFormed = (x) => {
    const s = String(x);
    if (!s.startsWith('<?xml version="1.0" encoding="UTF-8"?>')) return false;
    if (/&(?!amp;|lt;|gt;|quot;|#39;)/.test(s)) return false;
    const stack = [];
    for (const [, close, name, self] of s.replace(/<\?xml[^>]*\?>/, "").matchAll(/<(\/?)([a-zA-Z:]+)[^>]*?(\/?)>/g)) {
      if (self) continue;
      if (close) {
        if (stack.pop() !== name) return false;
      } else stack.push(name);
    }
    return stack.length === 0;
  };
  const n = await newsSitemap();
  check("news sitemap well-formed", wellFormed(n.body));
  check("news sitemap cache", n.cache === CACHE.sitemapNews);
  check("news sitemap uses ORIGIN", !/<loc>(?!https:\/\/www\.dailymattr\.com\/news\/)/.test(n.body));
  const i = sitemapIndex();
  check("sitemap index well-formed", wellFormed(i.body) && i.cache === CACHE.sitemapIndex);
  const days = [...i.body.matchAll(/sitemap-(\d{4}-\d{2}-\d{2})\.xml/g)].map((x) => x[1]);
  check("sitemap index lists daily files, newest first", days.length >= 1 && days.join() === [...days].sort().reverse().join());
  const months = [...i.body.matchAll(/sitemap-(\d{4}-\d{2})\.xml/g)].map((x) => x[1]);
  check("sitemap index lists monthly files, newest first", months.length >= 1 && months.join() === [...months].sort().reverse().join());
  const today = await archiveSitemap(days[0]);
  check("daily sitemap well-formed", today && wellFormed(today.body) && today.cache === CACHE.sitemapDayCurrent);
  const past = days[1] && (await archiveSitemap(days[1]));
  check("past day cached longer than today", past && past.cache === CACHE.sitemapMonthPast);
  check("day out of range -> none", (await archiveSitemap("1999-01-01")) === null);
  check("impossible date -> none", (await archiveSitemap("2026-02-30")) === null);
  const mth = await archiveSitemap("2026-08");
  check("monthly sitemap served", mth && wellFormed(mth.body));
  check("monthly sitemap has article URLs but no image tags", /<loc>https:\/\/www\.dailymattr\.com\/news\//.test(mth.body) && !/image:/.test(mth.body));
  check("month out of range -> none", (await archiveSitemap("1999-01")) === null);
}

console.log("\nlatest.json");
{
  const { stories } = JSON.parse(await latestJsonBody());
  check("up to 10 stories", Array.isArray(stories) && stories.length > 0 && stories.length <= 10);
  check("each has title, path, section, publishedAt", stories.every((s) => s.title && /^\/news\/[a-z0-9-]+-\d+$/.test(s.path) && typeof s.section === "string" && !Number.isNaN(Date.parse(s.publishedAt))));
  check("images carry src + srcset (lowercase key, as the homepage reads it)", stories.every((s) => s.image === null || (s.image.src && s.image.srcset)));
}

console.log("\nescaping");
{
  const nasty = `</script><img src=x onerror=alert(1)>"&'`;
  check("esc neutralises tags+quotes", esc(nasty) === "&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;&quot;&amp;&#39;");
  check("safeJsonLd escapes <", !safeJsonLd({ a: nasty }).includes("</script>"));
}

console.log("\ncard source precedence");
{
  const sb = "https://coggfnbqqyiqfsxvtaym.supabase.co/storage/v1/object/public/pix-media/";
  const s3 = "https://shortly-bucket.s3.ap-south-1.amazonaws.com/processed/";
  const b = { main_image_url: sb + "bg/art.png", media_pages: [{ url: s3 + "a.webp", sort_order: 1 }, { url: s3 + "b.webp", sort_order: 2 }] };
  check("private S3 pages are dropped -> background only", slidesFor(b).length === 1 && slidesFor(b)[0].url.includes("/bg/art.png"));
  const withWeb = {
    ...b,
    web_pages: [
      { url: sb + "web/x/2-text.jpg", width: 920, height: 1700, sort_order: 2 },
      { url: sb + "web/x/1-poster.jpg", width: 920, height: 1700, sort_order: 1 },
    ],
  };
  const ws = slidesFor(withWeb);
  check("web_pages win and are ordered by sort_order", ws.length === 2 && ws[0].url.endsWith("1-poster.jpg") && ws[1].url.endsWith("2-text.jpg"));
  check("og:image poster is the rendered card", posterFor(withWeb).endsWith("1-poster.jpg"));
  check("page/grid artwork is the plain picture even when cards exist", artworkFor(withWeb).endsWith("/bg/art.png"));
  check("artwork falls back to the card when there is no picture", artworkFor({ ...withWeb, main_image_url: null }).endsWith("1-poster.jpg"));
  const badHost = { ...b, web_pages: [{ url: "https://evil.example/x.jpg", sort_order: 1 }] };
  check("web_pages on a foreign host are ignored", slidesFor(badHost)[0].url.includes("/bg/art.png"));
}

console.log("\nslug");
{
  const d = "[Daayra opens at ₹85 lakh], becomes Kareena Kapoor's lowest";
  check("markers stripped", slugify(d) === "daayra-opens-at-rs-85-lakh-becomes-kareena-kapoors-lowest", slugify(d));
  check("percent spelled out", slugify("Trump 100% tariffs") === "trump-100-percent-tariffs", slugify("Trump 100% tariffs"));
  check("ascii only", /^[a-z0-9-]+$/.test(slugify("Volker Türk urges — action")), slugify("Volker Türk urges — action"));
  check("length capped", slugify("a".repeat(200)).length <= 80);
  check("cleanHeadline keeps words", cleanHeadline("(KTR demands answers) over arrest") === "KTR demands answers over arrest");
}

/* ---------- the running app ---------- */

if (base) {
  console.log(`\nHTTP ${base}`);
  /* a link-preview bot gets the metadata in <head> (others may get it
   * streamed into <body> on dynamic pages) */
  const UA = "Twitterbot/1.0";
  const get = async (path) => {
    const res = await fetch(base + path, { redirect: "manual", headers: { "User-Agent": UA } });
    return { status: res.status, location: res.headers.get("location"), type: res.headers.get("content-type"), cache: res.headers.get("cache-control"), body: await res.text() };
  };
  const tag = (body, re) => re.test(body);
  const lds = (body) => [...body.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

  {
    const r = await get("/news");
    check("/news -> 301 /news/", r.status === 301 && r.location === "/news/", `${r.status} ${r.location}`);
  }
  {
    const r = await get("/news/");
    check("/news/ 200", r.status === 200, String(r.status));
    check("canonical", tag(r.body, /<link rel="canonical" href="https:\/\/www\.dailymattr\.com\/news\/"\s*\/?>/));
    check("robots", r.body.includes('<meta name="robots" content="index,follow,max-image-preview:large"'));
    check("h1", r.body.includes(">Latest news</h1>"));
    check("CollectionPage + ItemList", lds(r.body).some((g) => g["@type"] === "CollectionPage" && g.mainEntity["@type"] === "ItemList"));
    check("article links", (r.body.match(/href="\/news\/[a-z0-9-]+-\d+"/g) || []).length >= 20);
    check("thumbs are responsive", (r.body.match(/srcSet="[^"]+320w[^"]*480w"|srcset="[^"]+320w[^"]*480w"/gi) || []).length >= 20);
    check("first 3 eager, rest lazy", /fetchPriority="high"|fetchpriority="high"/i.test(r.body) && r.body.includes('loading="lazy"'));
    check("every resized URL keeps aspect", (r.body.match(/render\/image\/public\/[^"\s]+/g) || []).every((u) => u.includes("resize=contain")));
    check("Supabase preconnect without crossorigin", tag(r.body, /<link rel="preconnect" href="https:\/\/coggfnbqqyiqfsxvtaym\.supabase\.co"\s*\/?>/));
  }
  {
    const r = await get("/news/india/");
    check("/news/india/ 200", r.status === 200, String(r.status));
    check("hub h1", r.body.includes(">India news</h1>"));
    check("hub canonical", r.body.includes('href="https://www.dailymattr.com/news/india/"'));
  }
  {
    const r = await get("/news/page/2/");
    check("/news/page/2/ 200 + rel=prev", r.status === 200 && r.body.includes('rel="prev"'), String(r.status));
  }
  {
    const r = await get("/news/?date=2026-09-01");
    check("date filter 200 + noindex", r.status === 200 && r.body.includes('content="noindex,follow"'), String(r.status));
  }
  {
    const r = await get(`/news/${canonicalTail}`);
    check("article 200", r.status === 200, String(r.status));
    check("article canonical", r.body.includes(`href="${ORIGIN}/news/${canonicalTail}"`));
    check("og:type article", r.body.includes('property="og:type" content="article"'));
    check("max-image-preview:large", r.body.includes("max-image-preview:large"));
    const g = lds(r.body);
    check("NewsArticle + BreadcrumbList JSON-LD", g.some((x) => x["@type"] === "NewsArticle") && g.some((x) => x["@type"] === "BreadcrumbList"));
    check("one carousel, with alt text", (r.body.match(/aria-label="Story cards"/g) || []).length >= 1 && /<img[^>]+alt="[^"]{10,}"/.test(r.body));
    check("bullets rendered", (r.body.match(/<li[^>]*>[^<]{30,}<\/li>/g) || []).length >= 3);
    check("app prompt present and hidden", /id="app-gate"[^>]*\shidden/.test(r.body));
    check("prompt shows the three app screens", ["app-brief", "app-qix", "app-pix"].every((n) => r.body.includes(`${n}.webp`)));
  }
  {
    const r = await get(`/news/wrong-slug-${sample.published_id}`);
    check("bad slug -> 301 canonical", r.status === 301 && r.location === `/news/${canonicalTail}`, `${r.status} ${r.location}`);
  }
  {
    const r = await get("/news/definitely-not-a-story-999999999");
    check("unknown story -> 404 page", r.status === 404 && r.body.includes("Story not found"), String(r.status));
  }
  {
    const r = await get("/news/page/9999/");
    check("page past end -> 404", r.status === 404, String(r.status));
  }
  {
    const r = await get(GONE_PATH);
    check("internal 410 page is a 404 from outside", r.status === 404, String(r.status));
  }
  {
    const r = await get("/news/sitemap.xml");
    check("news sitemap 200 xml", r.status === 200 && /application\/xml/.test(r.type) && r.cache === CACHE.sitemapNews, `${r.status} ${r.type} ${r.cache}`);
  }
  {
    const r = await get("/news/latest.json");
    check("latest.json 200 json", r.status === 200 && /application\/json/.test(r.type) && r.cache === CACHE.feed, `${r.status} ${r.type} ${r.cache}`);
  }
} else {
  console.log("\n(rendered pages not checked: pass --base=http://localhost:3000 with the app running)");
}

console.log(failures ? `\n${failures} FAILED` : "\nall passed");
process.exit(failures ? 1 : 0);
