/* The SEO lookups: one light PostgREST request each, shared by the pages'
 * metadata and JSON-LD (server.ts), the sitemaps and the proxy's canonical
 * redirects. Plain fetch — no Supabase client — so the proxy stays small.
 * Server only. */
import { safeUrl } from "@/lib/html";
import { SERVER_SUPABASE_ANON_KEY, SERVER_SUPABASE_URL } from "./config";
import { decodeEntities, stripArtifacts } from "./text";

type RestResult<T> = { ok: true; rows: T[] } | { ok: false; status: number };

async function rest<T>(path: string): Promise<RestResult<T>> {
  const res = await fetch(`${SERVER_SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SERVER_SUPABASE_ANON_KEY, Authorization: `Bearer ${SERVER_SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) return { ok: false, status: res.status };
  return { ok: true, rows: (await res.json()) as T[] };
}

/* ---------- stories ---------- */

export type SeoStory = {
  id: string;
  headline: string;
  summary: string;
  body: string;
  source: string;
  sourceUrl: string;
  topic: string | null;
  publishedAt: string;
  modifiedAt: string;
  image: string | null;
};

type SeoStoryRow = {
  id: string;
  title: string | null;
  edited_title: string | null;
  summary: string | null;
  edited_summary: string | null;
  source: string | null;
  url: string | null;
  topic: string | null;
  reviewed_at: string | null;
  scraped_at: string | null;
  created_at: string;
  image_url?: string | null;
};

/* same visibility as the app (content.ts): the public feed view, completed
 * statuses only; the base table and the image-less column list are
 * fallbacks for a staggered deploy, exactly as the app falls back */
const COLS = "id,title,edited_title,summary,edited_summary,source,url,topic,category,status,reviewed_at,scraped_at,created_at";
const STATUSES = "status=in.(summarized,approved,sent)";

function toItem(row: SeoStoryRow): SeoStory {
  const summary = stripArtifacts(decodeEntities(row.edited_summary || row.summary || ""));
  return {
    id: row.id,
    headline: decodeEntities(row.edited_title || row.title),
    summary,
    body: summary,
    source: decodeEntities(row.source || ""),
    sourceUrl: (row.url || "").split("#shortly")[0],
    topic: row.topic || null,
    publishedAt: row.reviewed_at || row.scraped_at || row.created_at,
    modifiedAt: row.reviewed_at || row.scraped_at || row.created_at,
    image: row.image_url || null,
  };
}

export async function fetchStories(filter: string, what: string): Promise<SeoStory[]> {
  const q = (rel: string, cols: string) => rest<SeoStoryRow>(`${rel}?${filter}&${STATUSES}&select=${cols}`);
  let r = await q("public_articles_feed", `${COLS},image_url`);
  if (!r.ok && r.status === 404) r = await q("articles", `${COLS},image_url`);
  if (!r.ok && r.status === 400) r = await q("public_articles_feed", COLS);
  if (!r.ok) throw new Error(`${what} failed (${r.status})`);
  return r.rows.map(toItem);
}

export async function fetchStory(id: string): Promise<SeoStory | null> {
  return (await fetchStories(`id=eq.${id}&limit=1`, "story lookup"))[0] || null;
}

/* the newest stories, for the feed's ItemList */
export const fetchLatest = (limit: number) => fetchStories(`order=created_at.desc&limit=${limit}`, "latest stories");

/* ---------- topics ---------- */

export type SeoTopic = {
  id: string;
  title: string;
  description: string;
  approvedAt: string | null;
  modifiedAt: string | null;
  image: string | null;
  stories: { id: string; headline: string; publishedAt: string }[];
};

type SeoTopicArticle = {
  id: string;
  title: string | null;
  edited_title: string | null;
  status: string;
  image_url: string | null;
  reviewed_at: string | null;
  scraped_at: string | null;
  created_at: string;
};
type SeoTopicRow = {
  id: string;
  title: string | null;
  description: string | null;
  approved_at: string | null;
  topic_articles: { position: number | null; added_at: string | null; articles: SeoTopicArticle | null }[] | null;
};

/* the app only shows topics with 3+ approved members (content.ts) */
const TOPIC_COLS =
  "id,title,description,approved_at,topic_articles(position,added_at,articles(id,title,edited_title,status,image_url,reviewed_at,scraped_at,created_at))";
const PUBLIC = new Set(["summarized", "approved", "sent"]);

function toTopic(t: SeoTopicRow): SeoTopic | null {
  if ((t.topic_articles || []).length < 3) return null;
  /* timeline order, as the app shows it: position, then when it was added */
  const members = [...(t.topic_articles || [])].sort((a, b) =>
    a.position != null && b.position != null
      ? a.position - b.position
      : a.position != null
        ? -1
        : b.position != null
          ? 1
          : new Date(a.added_at || 0).getTime() - new Date(b.added_at || 0).getTime(),
  );
  const arts = members.map((m) => m.articles).filter((a): a is SeoTopicArticle => Boolean(a));
  const stories = arts
    .filter((a) => PUBLIC.has(a.status))
    .map((a) => ({
      id: a.id,
      headline: decodeEntities(a.edited_title || a.title || ""),
      publishedAt: a.reviewed_at || a.scraped_at || a.created_at,
    }))
    .filter((s) => s.headline);
  const times = stories.map((s) => new Date(s.publishedAt).getTime()).filter((n) => n > 0);
  return {
    id: t.id,
    title: decodeEntities(t.title || ""),
    description: decodeEntities(t.description || ""),
    approvedAt: t.approved_at,
    modifiedAt: times.length ? new Date(Math.max(...times)).toISOString() : t.approved_at,
    image: arts.map((a) => a.image_url).find(Boolean) || null,
    stories,
  };
}

export async function fetchTopic(id: string): Promise<SeoTopic | null> {
  const r = await rest<SeoTopicRow>(`topics?id=eq.${id}&select=${TOPIC_COLS}&limit=1`);
  if (!r.ok) throw new Error(`topic lookup failed (${r.status})`);
  return r.rows[0] ? toTopic(r.rows[0]) : null;
}

/* every approved topic with a timeline, newest first (RLS hides the rest) */
export async function fetchTopics(): Promise<SeoTopic[]> {
  const r = await rest<SeoTopicRow>(`topics?select=${TOPIC_COLS}&order=approved_at.desc`);
  if (!r.ok) throw new Error(`topics lookup failed (${r.status})`);
  return r.rows.map(toTopic).filter((t): t is SeoTopic => t !== null);
}

/* ---------- shared formatting ---------- */

export const iso = (d: string | null | undefined): string | undefined => {
  if (!d) return undefined;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? undefined : t.toISOString();
};

/* scraped lead images come from the outlets' own CDNs; only https ones are
 * used, anything else falls back to the site card */
export const imageOf = (u: string | null | undefined): string => {
  const s = safeUrl(u);
  return s.startsWith("https://") ? s : "";
};
