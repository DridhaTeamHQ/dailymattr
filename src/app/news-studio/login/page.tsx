import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { FeedView } from "@/components/studio/feed-view";
import { feedInitial, privateMetadata } from "@/lib/studio/server";

/* the feed with the auth drawer open over it (Log in, or the Account
 * panel when signed in) — old links still land here; never indexed */
export const revalidate = 120;

export const metadata: Metadata = privateMetadata();

export default async function LoginPage() {
  return <FeedView initial={await feedInitial()} drawer="auth" footer={<SiteFooter />} />;
}
