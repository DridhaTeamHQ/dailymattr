/* Row shapes read from the Pixie CMS table pix_posts. Every value comes from
 * the database and is untrusted: JSON columns are typed `unknown` and checked
 * where they are used (media.ts), never trusted to have a shape. */

export type PixPost = {
  id: number;
  headline: string | null;
  detail_body?: string | null;
  main_image_url?: string | null;
  category_id?: number | null;
  state_id?: number | null;
  /* never null for a live post (the queries filter on it) */
  published_at: string;
  updated_at?: string | null;
  published_id: string | number | null;
  source_url?: string | null;
  user_name?: string | null;
  approved?: boolean | null;
  rejected?: boolean | null;
  /* the rendered cards the CMS copies to the public Supabase bucket */
  web_pages?: unknown;
  /* the same cards on the app backend's private S3 */
  media_pages?: unknown;
  keywords?: unknown;
};

/* the columns the sitemaps need */
export type SitemapRow = Pick<
  PixPost,
  "headline" | "published_id" | "published_at" | "updated_at" | "main_image_url" | "web_pages" | "media_pages"
>;

/* getPostByPublishedId: the live post, a post that was public and has been
 * taken down, or null (never public — may still go live) */
export type PostLookup = { post: PixPost } | { gone: true } | null;

export type Neighbours = { older: PixPost[]; newer: PixPost[] };

export type FeedPage = { posts: PixPost[]; hasNext: boolean };
