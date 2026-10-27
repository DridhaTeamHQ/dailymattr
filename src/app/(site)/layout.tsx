import { GoogleAnalytics } from "@next/third-parties/google";
import { Grain } from "@/components/site/grain";
import { SiteNav } from "@/components/site/site-nav";
import { GA_ID } from "@/lib/site";

/* The marketing pages: the shared top bar stays mounted while you move
 * between them. Each page renders its own footer (the newsletter page has
 * none). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Grain />
      <SiteNav />
      {children}
      <GoogleAnalytics gaId={GA_ID} />
    </>
  );
}
