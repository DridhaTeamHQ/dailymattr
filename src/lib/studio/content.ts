import type { SupabaseClient } from "@supabase/supabase-js";
import { decodeEntities, stripArtifacts } from "./text";
import { istDayKey } from "./time";
import type { ArticleRow, CategorySlug, FeedPage, Story, TopicRow, TrendingTopic } from "./types";

/* Live content layer — reads completed content straight from the email
 * agent's safe public feed, so every summarized article appears without
 * waiting for email approval; editor changes win through edited_title /
 * edited_summary. Status in ('summarized','approved','sent') only.
 *
 * Every query takes the Supabase client to run on: the browser's
 * (supabase.ts browserDb) for the live feed, the server's
 * (server.ts) for the server-rendered first paint — same queries, same
 * shapes, so the two always agree. */

/* The five topic categories; everything else (general news tagged
 * India/World/Business/Explained/…) is the "General" feed. */
const TOPIC_SLUG: Record<string, CategorySlug> = {
  "Real Estate": "real-estate",
  Automobile: "automobile",
  "Health & Wellness": "health-wellness",
  "Tech & AI": "tech-ai",
  "Markets & Startups": "markets-startups",
};
const slugFor = (category: string | null): CategorySlug => (category && TOPIC_SLUG[category]) || "general";

/* drop the synthetic fragment the agent appends to make synced rows unique
 * (e.g. "…/article#shortly-corporate-case-<uuid>") */
const cleanUrl = (u: string | null | undefined) => (u ? u.split("#shortly")[0] || u : "");

/* Reader-facing label for the scraper's internal feed topic ("India" reads
 * as "National"); category stories carry no tag. */
const TOPIC_LABEL: Record<string, string> = {
  India: "National",
  Politics: "Politics",
  World: "World",
  Business: "Business",
  Explained: "Explained",
  Sports: "Sports",
  Science: "Science",
  Technology: "Tech",
};
export function topicLabel(item: Pick<Story, "category" | "topic"> | null | undefined): string | null {
  if (item?.category) return null;
  const t = item?.topic;
  return t ? TOPIC_LABEL[t] || t : null;
}

/* label for a category slug (the reader's header) */
export const SLUG_LABEL: Record<CategorySlug, string> = {
  general: "News Studio",
  "real-estate": "Real Estate",
  automobile: "Automobile",
  "health-wellness": "Health & Wellness",
  "tech-ai": "Tech & AI",
  "markets-startups": "Markets & Startups",
};

export function normalize(row: ArticleRow): Story {
  const text = stripArtifacts(decodeEntities(row.edited_summary || row.summary || ""));
  return {
    id: row.id,
    kind: "article",
    headline: decodeEntities(row.edited_title || row.title),
    summary: text,
    body: text,
    source: decodeEntities(row.source || ""),
    sourceUrl: cleanUrl(row.url),
    publishedAt: row.reviewed_at || row.scraped_at || row.created_at,
    category: row.category || null,
    topic: row.topic || null,
    bucket: row.category || row.topic || "",
    slug: slugFor(row.category),
    edited: !!(row.edited_title || row.edited_summary),
    prominence: row.prominence ?? null,
    importance: row.prominence != null && row.prominence >= 4 ? row.prominence : null,
    factScore: row.fact_score ?? null,
    factLabel: row.fact_label || null,
    factNotes: row.fact_notes || null,
    versions: row.versions || null,
    image: row.image_url || null,
    relatedUrls: (row.fact_notes?.sources || []).map((s) => cleanUrl(s?.url)).filter(Boolean),
  };
}

export const newestFirst = (a: Pick<Story, "publishedAt">, b: Pick<Story, "publishedAt">) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

/* Light list payload — no raw_content (the full scraped text is large
 * enough to hit the anon role's statement timeout). Fact check + versions
 * arrived later; the base list is the fallback while that migration is
 * missing, so the feed never breaks on deploy order. */
const SELECT_BASE =
  "id,title,edited_title,summary,edited_summary,source,url,topic,category,section,prominence,status,reviewed_at,scraped_at,created_at";
const SELECT = `${SELECT_BASE},fact_score,fact_label,fact_notes,versions,image_url`;
const PUBLIC_RELATION = "public_articles_feed";
const PUBLIC_STATUSES = ["summarized", "approved", "sent"];

type PgError = { message?: string } | null;
const missingRelation = (error: PgError) => !!error && /relation|schema cache|could not find/i.test(error.message || "");
const missingColumn = (error: PgError) => !!error && /column|does not exist/i.test(error.message || "");

/* how many stories one feed request pulls; the rest infinite-scrolls in */
export const FEED_PAGE_SIZE = 30;

/* PostgREST filter values: quote anything with spaces/&, and strip the
 * characters that would break out of an or=(…) list */
const pgQuote = (v: string) => `"${String(v).replace(/["\\]/g, "")}"`;
const searchTerm = (q: string) => String(q || "").replace(/[,()*%\\"]/g, " ").trim();

export type PageQuery = { slug?: CategorySlug; topic?: string | null; query?: string; offset?: number; limit?: number };

/* One page of completed items, newest first, filtered in the database:
 *   slug   'general' (no topic category) or one of the five topic slugs
 *   topic  a General section ('India', 'World', …) or null for all
 *   query  free-text search over headline, brief and outlet
 * Falls back to the base table during a staggered deploy, and to the base
 * column list if the fact-check migration hasn't been applied. */
export async function fetchApprovedPage(
  db: SupabaseClient,
  { slug = "general", topic = null, query = "", offset = 0, limit = FEED_PAGE_SIZE }: PageQuery = {},
): Promise<FeedPage> {
  const category = Object.keys(TOPIC_SLUG).find((c) => TOPIC_SLUG[c] === slug);
  const q = searchTerm(query);
  const run = async (relation: string, cols: string) => {
    let req = db.from(relation).select(cols).in("status", PUBLIC_STATUSES);
    if (category) req = req.eq("category", category);
    /* General = everything outside the five topic categories */
    else req = req.or(`category.is.null,category.not.in.(${Object.keys(TOPIC_SLUG).map(pgQuote).join(",")})`);
    if (topic) req = req.eq("topic", topic);
    if (q) {
      req = req.or(["title", "edited_title", "summary", "edited_summary", "source"].map((c) => `${c}.ilike.${pgQuote(`*${q}*`)}`).join(","));
    }
    /* id breaks timestamp ties so offsets stay stable across pages */
    const { data, error } = await req
      .order("scraped_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);
    return { rows: (data ?? []) as unknown as ArticleRow[], error: error as PgError };
  };
  let r = await run(PUBLIC_RELATION, SELECT);
  if (missingRelation(r.error)) r = await run("articles", SELECT);
  if (missingColumn(r.error)) r = await run(PUBLIC_RELATION, SELECT_BASE);
  if (r.error) throw r.error;
  return { items: r.rows.map(normalize), hasMore: r.rows.length === limit };
}

/* Specific completed articles by id — the topic timelines, whose members can
 * be older than the loaded feed pages, and stories outside the feed's newest
 * page. Same SELECT, fallbacks and normalize() as the feed. */
export async function fetchArticlesByIds(db: SupabaseClient, ids: string[]): Promise<Story[]> {
  if (!ids.length) return [];
  const run = async (relation: string, cols: string) => {
    const { data, error } = await db.from(relation).select(cols).in("id", ids).in("status", PUBLIC_STATUSES);
    return { rows: (data ?? []) as unknown as ArticleRow[], error: error as PgError };
  };
  let r = await run(PUBLIC_RELATION, SELECT);
  if (missingRelation(r.error)) r = await run("articles", SELECT);
  if (missingColumn(r.error)) r = await run(PUBLIC_RELATION, SELECT_BASE);
  if (r.error) throw r.error;
  return r.rows.map(normalize);
}

/* ---------- trending topics ----------
 * Clusters the agent has approved. RLS restricts `topics` (and its joined
 * topic_articles) to status='approved'; never selects heavy columns. Topics
 * with fewer than 3 members are too thin to be a timeline. */
const TOPIC_SELECT =
  "id,title,slug,description,score,approved_at,created_at,topic_articles(article_id,position,added_at,articles(source,image_url,reviewed_at,scraped_at))";

/* Media OWNERSHIP groups — TOI + ET are both the Times Group, HT + Mint share
 * HT Media, every NDTV feed is NDTV. Counting distinct groups stops one
 * house's syndicated copies posing as independent coverage. */
function mediaGroupOf(source: string): string {
  const s = String(source || "").toLowerCase();
  if (s.includes("times of india") || s.includes("economic times") || s.startsWith("toi")) return "times-group";
  if (s.includes("hindustan times") || s.startsWith("ht ") || s === "mint" || s.includes("livemint")) return "ht-media";
  if (s.includes("ndtv")) return "ndtv";
  if (s.includes("indian express") || s.startsWith("ie ")) return "indian-express";
  if (s.includes("the hindu")) return "the-hindu";
  if (s.includes("bbc")) return "bbc";
  return s || "unknown";
}

function shapeTopic(t: TopicRow, now: number): TrendingTopic {
  const members = [...(t.topic_articles || [])].sort((a, b) => {
    const pa = a.position ?? null;
    const pb = b.position ?? null;
    if (pa != null && pb != null) return pa - pb;
    if (pa != null) return -1;
    if (pb != null) return 1;
    return new Date(a.added_at || 0).getTime() - new Date(b.added_at || 0).getTime();
  });
  /* distinct outlets across the visible members */
  const sourceSet = new Set(members.map((m) => (m.articles?.source || "").trim().toLowerCase()).filter(Boolean));
  /* the topic's NEWEST story — what the card date shows and freshness keys off */
  const memberTimes = members.map((m) => new Date(m.articles?.reviewed_at || m.articles?.scraped_at || 0).getTime());
  const latestMs = Math.max(0, ...memberTimes);
  const latestAt = latestMs > 0 ? new Date(latestMs).toISOString() : t.approved_at;
  /* TREND SCORE, live at view time: every story decayed by an ~18h
   * exponential (velocity) plus distinct media groups worth 2 stories each;
   * a single-outlet cluster is penalised */
  const velocity = memberTimes.reduce((sum, ms) => {
    if (!ms) return sum;
    const ageHours = Math.max(0, (now - ms) / 3_600_000);
    return sum + Math.exp(-ageHours / 18);
  }, 0);
  const groupSet = new Set(members.map((m) => (m.articles?.source || "").trim()).filter(Boolean).map(mediaGroupOf));
  const singleSourcePenalty = sourceSet.size <= 1 ? 0.6 : 1;
  return {
    id: t.id,
    title: decodeEntities(t.title || ""),
    slug: t.slug,
    description: decodeEntities(t.description || ""),
    score: t.score ?? null,
    approvedAt: t.approved_at,
    latestAt,
    latestDayKey: istDayKey(latestAt),
    sourceCount: sourceSet.size,
    trendScore: (velocity + groupSet.size * 2) * singleSourcePenalty,
    /* first member carrying a scraped image — the card's visual */
    image: members.map((m) => m.articles?.image_url).find(Boolean) || null,
    memberIds: members.map((m) => m.article_id),
  };
}

/* every trending topic, MOST trending first (freshest story breaks ties);
 * never throws — the rail just stays empty */
export async function fetchTrendingTopics(db: SupabaseClient): Promise<TrendingTopic[]> {
  try {
    const { data, error } = await db.from("topics").select(TOPIC_SELECT);
    if (error) throw error;
    const now = Date.now();
    return ((data ?? []) as unknown as TopicRow[])
      .map((t) => shapeTopic(t, now))
      .filter((t) => t.memberIds.length >= 3)
      .sort((a, b) => {
        if (b.trendScore !== a.trendScore) return b.trendScore - a.trendScore;
        return new Date(b.latestAt || 0).getTime() - new Date(a.latestAt || 0).getTime();
      });
  } catch {
    return [];
  }
}

/* one approved topic with a timeline, or null */
export async function fetchTopicById(db: SupabaseClient, id: string): Promise<TrendingTopic | null> {
  const { data, error } = await db.from("topics").select(TOPIC_SELECT).eq("id", id).limit(1);
  if (error) throw error;
  const row = ((data ?? []) as unknown as TopicRow[])[0];
  if (!row) return null;
  const topic = shapeTopic(row, Date.now());
  return topic.memberIds.length >= 3 ? topic : null;
}

/* A topic is only TRENDING while it is still getting coverage: keep topics
 * whose newest story falls on the freshest IST day present in `items` (the
 * live feed) — not wall-clock "today", which would empty the rail every
 * morning until the day's stories land. Before the feed loads, pass
 * everything through rather than blanking the rail. */
export function freshTopics(topics: TrendingTopic[], items: Story[]): TrendingTopic[] {
  if (!topics.length) return [];
  if (!items.length) return topics;
  const latestMs = Math.max(...items.map((a) => new Date(a.publishedAt || 0).getTime()));
  if (!Number.isFinite(latestMs) || latestMs <= 0) return topics;
  const latestFeedDay = istDayKey(new Date(latestMs).toISOString());
  return topics.filter((t) => t.latestDayKey === latestFeedDay);
}

/* Breaking score — mirrors the agent's SQL breaking_score: prominence x
 * cross-outlet velocity x fact trust, decayed with a ~5.5h half-life. */
export function breakingScore(item: Story, now: number): number {
  const prominence = item.prominence ?? 2;
  const sources = Number(item.factNotes?.source_count ?? 1);
  const fact = item.factScore ?? 60;
  const ageHours = Math.max((now - new Date(item.publishedAt).getTime()) / 3_600_000, 0);
  const raw = (prominence / 5) * 45 + (Math.min(Math.max(sources - 1, 0), 3) / 3) * 30 + (fact / 100) * 25;
  return raw * Math.exp(-ageHours / 8);
}

/* worth the BREAKING ticker: editor-rated high, corroborated by 2+ outlets
 * (or rated 5), fresh, and not in the unverified band */
export function isBreaking(item: Story, now: number): boolean {
  const prominence = item.prominence ?? 0;
  const sources = Number(item.factNotes?.source_count ?? 1);
  const ageHours = (now - new Date(item.publishedAt).getTime()) / 3_600_000;
  const factOk = item.factScore == null || item.factScore >= 40;
  return prominence >= 4 && (sources >= 2 || prominence === 5) && ageHours < 24 && factOk;
}
