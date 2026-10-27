import { GA_ID } from "@/lib/site";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { preconnect } from "react-dom";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import "@/styles/news.css";

/* the icons the /news pages always linked */
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/assets/favicon.svg?v=3", type: "image/svg+xml" },
    ],
    apple: "/assets/apple-touch-icon.png?v=3",
  },
};

/* the function budget the hand-rolled router had */
export const maxDuration = 10;

/* Every /news page: the site nav (it marks News as current), the page, the
 * site footer with its column of news hubs (every article links into every
 * section, so crawl depth stays flat) and the Google tag. Under 861px the
 * page keeps room at the foot for the article's arrow bar, on every page,
 * as the original stylesheet did. */
export default function NewsLayout({ children }: { children: React.ReactNode }) {
  /* the CMS artwork host */
  preconnect("https://coggfnbqqyiqfsxvtaym.supabase.co");
  return (
    <>
      <SiteNav />
      <main className="bg-paper pt-[calc(var(--spacing-nav)_+_28px)] pb-20 [@media(max-width:860px)]:pb-[calc(100px_+_env(safe-area-inset-bottom))]">
        {children}
      </main>
      <SiteFooter />
      <GoogleAnalytics gaId={GA_ID} />
    </>
  );
}
