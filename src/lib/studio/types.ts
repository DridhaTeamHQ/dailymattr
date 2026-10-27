/* Shapes of the News Studio data: the Supabase rows as PostgREST returns
 * them, and the normalised objects the pages render. */

/* ---------- rows ---------- */

/* AI fact check (email agent docs/FACT_CHECKING.md): the per-claim audit
 * trail, the outlets the claims were checked against, and source signals */
export type FactVerdict = "supported" | "partially-supported" | "unsupported" | "contradicted";
export type FactClaim = { claim?: string; verdict?: FactVerdict | string };
export type FactSource = { url?: string | null; source?: string | null };
export type FactSignals = Partial<Record<"attribution" | "specificity" | "tone", number | null>>;
export type FactNotes = {
  source_count?: number | null;
  sources?: (FactSource | null)[] | null;
  rationale?: string | null;
  claims?: FactClaim[] | null;
  signals?: FactSignals | null;
};

/* alternate reader versions generated at approval */
export type StoryVersions = {
  eli5?: string | null;
  tldr?: string[] | null;
  deep_dive?: string | null;
  key_numbers?: string[] | null;
  key_points?: string[] | null;
};

/* public_articles_feed / articles */
export type ArticleRow = {
  id: string;
  title: string | null;
  edited_title: string | null;
  summary: string | null;
  edited_summary: string | null;
  source: string | null;
  url: string | null;
  topic: string | null;
  category: string | null;
  section?: string | null;
  prominence?: number | null;
  status: string;
  reviewed_at: string | null;
  scraped_at: string | null;
  created_at: string;
  fact_score?: number | null;
  fact_label?: string | null;
  fact_notes?: FactNotes | null;
  versions?: StoryVersions | null;
  image_url?: string | null;
};

/* topics + topic_articles(articles(…)) as the trending rail selects them */
export type TopicMemberRow = {
  article_id: string;
  position: number | null;
  added_at: string | null;
  articles: { source: string | null; image_url: string | null; reviewed_at: string | null; scraped_at: string | null } | null;
};
export type TopicRow = {
  id: string;
  title: string | null;
  slug: string | null;
  description: string | null;
  score: number | null;
  approved_at: string | null;
  created_at: string | null;
  topic_articles: TopicMemberRow[] | null;
};

/* ---------- what the pages render ---------- */

export type CategorySlug = "general" | "real-estate" | "automobile" | "health-wellness" | "tech-ai" | "markets-startups";

/* one completed story (content.ts normalize) */
export type Story = {
  id: string;
  kind: "article";
  headline: string;
  summary: string;
  body: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: string | null;
  topic: string | null;
  /* raw agent label */
  bucket: string;
  slug: CategorySlug;
  edited: boolean;
  /* editor prominence, 1-5 where 5 = breaking */
  prominence: number | null;
  importance: number | null;
  factScore: number | null;
  factLabel: string | null;
  factNotes: FactNotes | null;
  versions: StoryVersions | null;
  /* lead image scraped from the source (often null) */
  image: string | null;
  /* the other outlets' copies of this story (same-story dedupe) */
  relatedUrls: string[];
};

/* one approved trending topic (content.ts shapeTopic) */
export type TrendingTopic = {
  id: string;
  title: string;
  slug: string | null;
  description: string;
  score: number | null;
  approvedAt: string | null;
  latestAt: string | null;
  latestDayKey: string;
  sourceCount: number;
  trendScore: number;
  image: string | null;
  memberIds: string[];
};

/* a page of the feed */
export type FeedPage = { items: Story[]; hasMore: boolean };

/* ---------- server-rendered initial state ----------
 * `now` is the server's clock at render time: relative times ("5 mins ago")
 * and the breaking selection render against it until the page has booted
 * in the browser, so the HTML and the first client render agree. */

export type FeedInitial = { now: number; page: FeedPage | null; topics: TrendingTopic[] };
/* `list` is the default (no ?topic=) reading sequence around the story, or
 * null when the server could not load it (the browser loads it instead) */
export type StoryInitial = { now: number; id: string; list: Story[] | null };
export type TopicInitial = { now: number; topic: TrendingTopic | null; members: Story[] | null };
