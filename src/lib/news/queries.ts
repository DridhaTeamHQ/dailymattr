import { PAGE_SIZE } from "@/lib/site";
import { hasHeadline } from "@/lib/slug";
import { dateRangeForDay, isValidDateStr } from "@/lib/text";
import { hasSnapshot, snapshot, type ListLiveArgs } from "./snapshot";
import { hasServiceKey, pixDb } from "./supabase";
import type { FeedPage, Neighbours, PixPost, PostLookup, SitemapRow } from "./types";

/* Only the columns a page needs. The carousel and keywords are pulled out of
 * published_response with JSON-path aliases so the (large) blob itself never
 * crosses the wire. */
const COLS = [
  "id", "headline", "detail_body", "main_image_url", "category_id", "state_id",
  "published_at", "updated_at", "published_id", "source_url", "user_name",
  "approved", "rejected",
  /* web_pages: the rendered cards the CMS copies to the public Supabase
   * bucket at publish. media_pages: the same cards on the app backend's
   * private S3, kept for the day a CDN sits in front of it. */
  "web_pages",
  "media_pages:published_response->response->data->media_pages",
  "keywords:published_response->response->data->keywords",
].join(",");

const SITEMAP_COLS =
  "headline,published_id,published_at,updated_at,main_image_url,web_pages," +
  "media_pages:published_response->response->data->media_pages";

/* what the proxy needs to answer 301 / 410 for an article URL */
const LOOKUP_COLS = "id,headline,published_id,published_at,approved,rejected,category_id";

/* a post is public once QA approved it, nobody rejected it afterwards, its
 * publish time has passed and it has a headline. Headline-less posts (the
 * "Daily Wrap" cards) are app-only and never get a web page. */
const live = (cols: string) =>
  pixDb()
    .from("pix_posts")
    .select(cols)
    .eq("approved", true)
    .eq("rejected", false)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .filter("headline", "match", "[[:alnum:]]");

type Flags = Pick<PixPost, "approved" | "rejected" | "published_at" | "headline">;

const wasPublished = (p: Flags) => Boolean(p.published_at) && new Date(p.published_at) <= new Date();

const isLive = (p: Flags) => Boolean(p.approved) && !p.rejected && wasPublished(p) && hasHeadline(p);

/* was public once: rejected after its publish time had passed, or a
 * headline-less post that used to get a page */
const wasTakenDown = (p: Flags) => wasPublished(p) && (Boolean(p.rejected) || (Boolean(p.approved) && !hasHeadline(p)));

const fail = (error: { message: string }, what: string): never => {
  throw new Error(`${what}: ${error.message}`);
};

/* supabase-js cannot type a select list built from JSON-path aliases, so the
 * rows are cast to the shape the select string asks for */
const rows = <T>(data: unknown): T[] => (Array.isArray(data) ? (data as T[]) : []);

/* Without the service-role key the real table is unreachable (no anon policy),
 * so development falls back to the checked-out snapshot. */
const useSnapshot = () => !hasServiceKey() && hasSnapshot();

export const dataSource = (): "supabase" | "snapshot" | "none" =>
  hasServiceKey() ? "supabase" : useSnapshot() ? "snapshot" : "none";

function classify<T extends Flags>(data: T[]): { post: T } | { gone: true } | null {
  if (!data.length) return null;
  const post = data.find(isLive);
  if (post) return { post };
  return data.some(wasTakenDown) ? { gone: true } : null;
}

const db = {
  /* { post } | { gone: true } (was published, since rejected) | null (never
   * public: no such id, or not approved / scheduled for later — those may
   * still go live, so they must not be marked permanently gone) */
  async getPostByPublishedId(id: string): Promise<PostLookup> {
    const { data, error } = await pixDb().from("pix_posts").select(COLS).eq("published_id", String(id)).limit(5);
    if (error) fail(error, "getPostByPublishedId");
    return classify(rows<PixPost>(data));
  },

  /* the same answer from a handful of small columns, for the proxy */
  async lookupPublishedId(id: string): Promise<{ post: ArticleRef } | { gone: true } | null> {
    const { data, error } = await pixDb().from("pix_posts").select(LOOKUP_COLS).eq("published_id", String(id)).limit(5);
    if (error) fail(error, "lookupPublishedId");
    return classify(rows<ArticleRef>(data));
  },

  /* The chronological neighbours within the same category: up to `span` older
   * and `span` newer. The reader swipes through these one page at a time, and
   * every one is a real link in the markup, so crawlers walk the same chain. */
  async getNeighbours(post: PixPost, span = 3): Promise<Neighbours> {
    const base = () => {
      const q = live(COLS).neq("id", post.id);
      return post.category_id != null ? q.eq("category_id", post.category_id) : q;
    };
    const [older, newer] = await Promise.all([
      base().lt("published_at", post.published_at).order("published_at", { ascending: false }).limit(span),
      base().gt("published_at", post.published_at).order("published_at", { ascending: true }).limit(span),
    ]);
    if (older.error) fail(older.error, "getOlder");
    if (newer.error) fail(newer.error, "getNewer");
    return { older: rows<PixPost>(older.data), newer: rows<PixPost>(newer.data) };
  },

  /* one page of the feed or a hub. Requests size+1 rows so "is there a next
   * page" costs no count query. */
  async listLive({ categoryId = null, page = 1, size = PAGE_SIZE, date = null }: ListLiveArgs = {}): Promise<FeedPage> {
    const from = (page - 1) * size;
    let q = live(COLS).order("published_at", { ascending: false }).order("id", { ascending: false });
    if (categoryId != null) q = q.eq("category_id", categoryId);
    if (date && isValidDateStr(date)) {
      const { startIso, endIso } = dateRangeForDay(date);
      q = q.gte("published_at", startIso).lte("published_at", endIso);
    }
    const { data, error } = await q.range(from, from + size);
    if (error) fail(error, "listLive");
    const list = rows<PixPost>(data);
    return { posts: list.slice(0, size), hasNext: list.length > size };
  },

  /* Google News sitemap window: last 48 h, newest first, hard cap 1,000 */
  async listRecentForNews(hours = 48, cap = 1000): Promise<SitemapRow[]> {
    const since = new Date(Date.now() - hours * 3600e3).toISOString();
    const { data, error } = await live(SITEMAP_COLS)
      .gte("published_at", since)
      .order("published_at", { ascending: false })
      .limit(cap);
    if (error) fail(error, "listRecentForNews");
    return rows<SitemapRow>(data);
  },

  /* every live post in [start, end), oldest first. PostgREST caps a response
   * at 1,000 rows, so page through with range(). The unique id breaks ties
   * between simultaneous publishes so page boundaries never shuffle them. */
  async listBetween(startIso: string, endIso: string): Promise<SitemapRow[]> {
    const out: SitemapRow[] = [];
    const step = 1000;
    for (let from = 0; ; from += step) {
      const { data, error } = await live(SITEMAP_COLS)
        .gte("published_at", startIso)
        .lt("published_at", endIso)
        .order("published_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, from + step - 1);
      if (error) fail(error, "listBetween");
      const batch = rows<SitemapRow>(data);
      out.push(...batch);
      if (batch.length < step) break;
    }
    return out;
  },
};

/* the slice of a post that decides its canonical URL and its hub */
export type ArticleRef = Pick<PixPost, "id" | "headline" | "published_id" | "published_at" | "approved" | "rejected" | "category_id">;

export const getPostByPublishedId = (id: string) =>
  useSnapshot() ? snapshot.getPostByPublishedId(id) : db.getPostByPublishedId(id);

export const lookupPublishedId = (id: string): Promise<{ post: ArticleRef } | { gone: true } | null> =>
  useSnapshot() ? snapshot.getPostByPublishedId(id) : db.lookupPublishedId(id);

export const getNeighbours = (post: PixPost, span = 3) =>
  useSnapshot() ? snapshot.getNeighbours(post, span) : db.getNeighbours(post, span);

export const listLive = (args: ListLiveArgs = {}) => (useSnapshot() ? snapshot.listLive(args) : db.listLive(args));

export const listRecentForNews = (hours = 48, cap = 1000) =>
  useSnapshot() ? snapshot.listRecentForNews(hours, cap) : db.listRecentForNews(hours, cap);

export const listBetween = (startIso: string, endIso: string) =>
  useSnapshot() ? snapshot.listBetween(startIso, endIso) : db.listBetween(startIso, endIso);
