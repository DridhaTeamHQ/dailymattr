import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { hasHeadline } from "@/lib/slug";
import { dateRangeForDay, isValidDateStr } from "@/lib/text";
import type { FeedPage, Neighbours, PixPost, PostLookup, SitemapRow } from "./types";

/* Local development fallback. pix_posts has no anon read policy, so without
 * PIX_SUPABASE_SERVICE_ROLE_KEY there is no way to reach the real database —
 * this serves a checked-out sample of live posts instead, so the pages can be
 * built and reviewed offline. Production always has the key and never gets
 * here. Regenerate with scripts/pull-pix-snapshot.mjs.
 *
 * Resolved from the project root (the bundled module does not sit next to
 * _data). The old location is still read so an existing sample keeps working. */
const FILES = [
  join(/* turbopackIgnore: true */ process.cwd(), "src", "lib", "news", "_data", "pix-snapshot.json"),
  join(/* turbopackIgnore: true */ process.cwd(), "src", "server", "_data", "pix-snapshot.json"),
];

const snapshotFile = () => FILES.find((f) => existsSync(/* turbopackIgnore: true */ f)) ?? null;

export const hasSnapshot = () => snapshotFile() !== null;

let cache: PixPost[] | undefined;

const time = (iso: string | null | undefined) => new Date(iso ?? 0).getTime();

function all(): PixPost[] {
  if (!cache) {
    const file = snapshotFile();
    const rows: PixPost[] = file ? JSON.parse(readFileSync(/* turbopackIgnore: true */ file, "utf8")) : [];
    cache = rows
      .filter((p) => p.approved && !p.rejected && p.published_at && hasHeadline(p))
      .sort((a, b) => time(b.published_at) - time(a.published_at));
  }
  return cache;
}

const inCategory = (p: PixPost, categoryId: number | null | undefined) =>
  categoryId == null || p.category_id === categoryId;

export const snapshot = {
  async getPostByPublishedId(id: string): Promise<PostLookup> {
    const post = all().find((p) => String(p.published_id) === String(id));
    return post ? { post } : null;
  },

  async getNeighbours(post: PixPost, span = 3): Promise<Neighbours> {
    /* all() is newest-first, so the rows after this one are the older ones */
    const siblings = all().filter((p) => inCategory(p, post.category_id));
    const i = siblings.findIndex((p) => p.id === post.id);
    if (i < 0) return { older: [], newer: [] };
    return {
      older: siblings.slice(i + 1, i + 1 + span),
      newer: siblings.slice(Math.max(0, i - span), i).reverse(),
    };
  },

  async listLive({ categoryId = null, page = 1, size = 30, date = null }: ListLiveArgs = {}): Promise<FeedPage> {
    let rows = all().filter((p) => inCategory(p, categoryId));
    if (date && isValidDateStr(date)) {
      const { startIso, endIso } = dateRangeForDay(date);
      const s = time(startIso);
      const e = time(endIso);
      rows = rows.filter((p) => {
        const t = time(p.published_at);
        return t >= s && t <= e;
      });
    }
    const from = (page - 1) * size;
    return { posts: rows.slice(from, from + size), hasNext: rows.length > from + size };
  },

  async listRecentForNews(hours = 48, cap = 1000): Promise<SitemapRow[]> {
    const since = Date.now() - hours * 3600e3;
    return all().filter((p) => time(p.published_at) >= since).slice(0, cap);
  },

  async listBetween(startIso: string, endIso: string): Promise<SitemapRow[]> {
    const s = time(startIso);
    const e = time(endIso);
    return all()
      .filter((p) => {
        const t = time(p.published_at);
        return t >= s && t < e;
      })
      .sort((a, b) => time(a.published_at) - time(b.published_at));
  },
};

export type ListLiveArgs = {
  categoryId?: number | null;
  page?: number;
  size?: number;
  date?: string | null;
};
