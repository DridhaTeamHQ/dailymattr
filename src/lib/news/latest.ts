import { categoryById } from "@/lib/categories";
import { articlePath, cleanHeadline } from "@/lib/slug";
import { artworkFor, thumbAttrs, type ImgAttrs } from "./media";
import { listLive } from "./queries";
import type { PixPost } from "./types";

/* /news/latest.json — the newest stories, for the homepage's "Latest news"
 * row. A failed query returns an empty list and the homepage simply hides
 * the row. */

const LATEST_COUNT = 10;

export type LatestStory = {
  title: string;
  path: string;
  section: string;
  publishedAt: string;
  /* our own Pix artwork, host-checked by artworkFor() */
  image: ImgAttrs | null;
};

export async function latestJsonBody(): Promise<string> {
  let posts: PixPost[] = [];
  try {
    ({ posts } = await listLive({ page: 1, size: LATEST_COUNT }));
  } catch (err) {
    console.error("[latest]", err);
  }
  const stories: LatestStory[] = posts.map((p) => {
    const art = artworkFor(p);
    return {
      title: cleanHeadline(p.headline),
      path: articlePath(p),
      section: categoryById(p.category_id)?.label || "",
      publishedAt: new Date(p.published_at).toISOString(),
      image: art ? thumbAttrs(art) : null,
    };
  });
  return JSON.stringify({ stories });
}
