import { CACHE } from "@/lib/cache";
import { latestJsonBody } from "@/lib/news/latest";

/* /news/latest.json — the newest stories, for the homepage's "Latest news"
 * row. Same body, Content-Type and Cache-Control as before. */
export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET() {
  return new Response(await latestJsonBody(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": CACHE.feed,
      "Vercel-Cache-Tag": "news,news-hub",
    },
  });
}
