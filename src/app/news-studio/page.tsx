import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { FeedView } from "@/components/studio/feed-view";
import { feedInitial, feedJsonLd, feedMetadata } from "@/lib/studio/server";

/* the feed: regenerated at most every two minutes (CACHE.feed); the browser
 * keeps it live from there */
export const revalidate = 120;

export const metadata: Metadata = feedMetadata();

export default async function NewsStudioFeed() {
  const [jsonLd, initial] = await Promise.all([feedJsonLd(), feedInitial()]);
  return (
    <>
      <JsonLd data={jsonLd} />
      <FeedView initial={initial} footer={<SiteFooter />} />
    </>
  );
}
