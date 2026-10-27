import { FeedPage, feedMetadata } from "@/components/news/feed-page";
import type { FeedQuery } from "@/lib/news/feed";

/* /news/ — the "Latest" feed, page 1. Re-rendered at most every two minutes
 * (the old CDN policy, s-maxage=120, which the proxy still sends). The
 * ?date= filtered version is a separate, uncached route (page/[n]/[date]). */
export const revalidate = 120;

const query: FeedQuery = { page: 1, cat: null, date: null };

export function generateMetadata() {
  return feedMetadata(query);
}

export default function LatestNews() {
  return <FeedPage query={query} />;
}
