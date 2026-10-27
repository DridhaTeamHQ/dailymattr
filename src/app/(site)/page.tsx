import { PageJsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { Faq } from "@/components/home/faq";
import { Features } from "@/components/home/features";
import { FlyPhone } from "@/components/home/fly-phone";
import { Hero } from "@/components/home/hero";
import { HomeScene } from "@/components/home/home-scene";
import { IntroCurtain } from "@/components/home/intro-curtain";
import { LatestNews } from "@/components/home/latest-news";
import { Showcase } from "@/components/home/showcase";
import { pageMetadata } from "@/lib/page-meta";
import "@/styles/home.css";

export const metadata = pageMetadata("home");

/* Without JavaScript there is no curtain to lift and no pinned story: the
 * desktop feature panels stack as plain blocks and the scroll-only stages
 * are dropped. Unlayered, so it outranks the utilities. */
const NOSCRIPT_CSS = `<style>#intro { display: none !important; }
#features-pin { display: grid !important; height: auto; gap: 24px; padding: 48px 20px; }
#features-pin [data-feature-copy] { position: relative; inset: auto; transform: none; opacity: 1; width: 100%; max-width: 640px; margin: 0 auto; }
#features-pin [data-rows], #features-pin [data-masonry], #features-pin [data-stage-veil],
#features-pin [data-scene-progress], [data-features-mobile] { display: none !important; }
[data-showcase-stage] { display: none; }
</style>`;

export default function HomePage() {
  return (
    <>
      <PageJsonLd page="home" />
      <HomeScene>
        <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />
        <IntroCurtain />
        <main id="top">
          <Hero />
          <Showcase />
          <Features />
          {/* filled from /news/latest.json on the client */}
          <LatestNews />
          <Faq />
          <SiteFooter home />
        </main>
        {/* the flying phone (PNG fallback for the baked sequence) */}
        <FlyPhone />
      </HomeScene>
    </>
  );
}
