import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { UnsubscribeCard, UnsubscribePanel } from "@/components/unsubscribe/unsubscribe-panel";
import { pageMetadata } from "@/lib/page-meta";

/* noindex, and referrer: no-referrer — the URL carries the reader's email
 * and token, so it must never leave as a Referer */
export const metadata: Metadata = pageMetadata("unsubscribe");

/* Outside the (site) group on purpose: no site nav and never the Google
 * tag, whose page_location would carry the email and token. Static, like
 * the original: the query string is read in the browser, and the server
 * HTML is the "Updating your subscription..." card. Deliberately plain (no
 * motion) since readers land here from an email. */
export default function UnsubscribePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f6f8]">
      <header className="flex justify-center px-4 pt-7">
        {/* a full page load, not a client-side <Link>: the Google tag loaded
            by the homepage must never see this URL in the history (Back) */}
        <a className="flex flex-col items-center justify-center gap-0.5" href="/">
          <Image src="/assets/publisher-logo.png" width={156} height={32} alt="dailymattr" loading="eager" className="block h-8 w-[156px] flex-none" />
        </a>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-[clamp(32px,10vh,96px)] pb-12">
        <Suspense fallback={<UnsubscribeCard view={{ kind: "loading" }} />}>
          <UnsubscribePanel />
        </Suspense>
      </main>
    </div>
  );
}
