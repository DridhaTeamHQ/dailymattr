import { FeedPage, feedMetadata } from "@/components/news/feed-page";
import { feedQuery } from "@/lib/news/loaders";

/* A section hub: /news/<category>/ (rewritten here as page 1 by the proxy)
 * and /news/<category>/page/N/. Unknown sections and pages past the end are
 * 404s. Rendered on first request, then every two minutes. */
export const revalidate = 120;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string; n: string }> };

export async function generateMetadata({ params }: Props) {
  return feedMetadata(feedQuery(await params));
}

export default async function SectionHub({ params }: Props) {
  return <FeedPage query={feedQuery(await params)} />;
}
