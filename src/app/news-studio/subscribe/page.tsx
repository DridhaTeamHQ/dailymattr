import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { FeedView } from "@/components/studio/feed-view";
import { feedInitial, privateMetadata } from "@/lib/studio/server";

/* the feed with the subscribe drawer open over it (?category= preselects
 * one) — old emails and bookmarks still land here; never indexed */
export const revalidate = 120;

export const metadata: Metadata = privateMetadata();

export default async function SubscribePage() {
  return <FeedView initial={await feedInitial()} drawer="subscribe" footer={<SiteFooter />} />;
}
