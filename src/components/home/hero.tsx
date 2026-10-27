import Image from "next/image";
import { APP_STORE_URL, PLAY_URL } from "@/lib/site";
import { pill } from "@/components/site/pill";

/* merged, so the store variant's px-6/py-3 replace the base px-[18px]/py-[9px]
 * (unmerged, CSS order lets the base padding win) */
const STORE_PILL = pill({ variant: "store" });

/* phone fan — exact Figma geometry (Frame 182, 921x440): upright phones,
 * center largest, sides staggered smaller and lower. On phones only the
 * inner pair peeks from the edges beside the flying phone. */
const FAN_ITEM =
  "absolute overflow-hidden rounded-[22px] border-[5px] border-solid border-[#ececf0] bg-black shadow-[0_30px_70px_rgba(0,0,0,.5)]";
const FAN_IMG = "h-full w-full object-cover object-top";
const FAN_INNER = "mobile:top-[14%] mobile:bottom-auto mobile:h-[72%] mobile:w-[clamp(108px,33vw,228px)]";

export function Hero() {
  return (
    <section id="hero" className="bg-paper pt-[calc(var(--spacing-nav)+11px)] mobile:px-[12px] mobile:pb-[14px]">
      {/* bottom edge meets the dark showcase, so only the top is rounded;
          the background and corners are scroll-tweened to full-bleed */}
      <div
        data-hero-inner
        className={[
          "relative min-h-[880px] overflow-hidden rounded-t-panel px-[24px] pt-[88px] text-center",
          "bg-[radial-gradient(120%_90%_at_50%_0%,#1c1c1f_0%,var(--color-coal)_55%)]",
          "before:pointer-events-none before:absolute before:top-[46%] before:left-1/2 before:h-[560px] before:w-[560px] before:-translate-x-1/2 before:bg-[radial-gradient(circle,rgba(255,255,255,.14)_0%,transparent_62%)] before:blur-[30px] before:content-['']",
          "mobile:min-h-0 mobile:px-[clamp(16px,5vw,28px)] mobile:pt-[56px] mobile:pb-[clamp(64px,11vh,120px)] mobile:before:h-[360px] mobile:before:w-[360px] mobile:before:blur-[14px]",
        ].join(" ")}
      >
        <h1
          data-hero-rise
          className="flex flex-wrap items-center justify-center gap-[22px] text-[clamp(44px,5.1vw,74px)] leading-[1.05] font-bold tracking-[-1.5px] text-white mobile:gap-[clamp(10px,3vw,22px)] [@media(max-width:380px)]:text-[clamp(38px,12vw,50px)]"
        >
          <a href="#top">
            <Image
              src="/assets/publisher-logo.png"
              width={156}
              height={32}
              alt="dailymattr"
              sizes="390px"
              loading="eager"
              className="block h-[80px] w-auto"
            />
          </a>
          {/* visually hidden: gives the h1 real text for search engines and
              screen readers without touching the logo-only design */}
          <span className="sr-only">dailymattr — short news, video and audio explainers</span>
        </h1>
        <p data-hero-rise className="mt-[3px] text-[18px] leading-[1.55] text-[rgba(255,255,255,.86)] mobile:text-[clamp(14px,3.6vw,18px)]">
          <i>The next-gen news &amp; infotainment platform</i> <br />{" "}
        </p>
        <p className="mt-[15px] text-[18px] leading-[1.55] text-[rgba(255,255,255,.86)]">
          <b>100 stories a day ·</b> <b>Image, video &amp; audio explainers</b> <b>·</b> <b>Fact-checked &amp; Hand-picked</b>
        </p>
        <div
          data-hero-rise
          className="mt-[30px] flex justify-center gap-[14px] mobile:flex-wrap mobile:gap-[10px] [@media(max-width:380px)]:gap-[8px]"
        >
          <a data-store-pill className={STORE_PILL} href={PLAY_URL} target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor">
              <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
            </svg>
            Google Play
          </a>
          <a data-store-pill className={STORE_PILL} href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 12.54c-.03-2.9 2.37-4.3 2.48-4.36-1.35-1.98-3.46-2.25-4.2-2.28-1.79-.18-3.5 1.05-4.4 1.05-.9 0-2.3-1.02-3.79-1-1.95.03-3.75 1.13-4.75 2.88-2.03 3.52-.52 8.72 1.46 11.58.97 1.4 2.12 2.96 3.63 2.9 1.46-.06 2-.94 3.77-.94s2.26.94 3.8.91c1.57-.03 2.56-1.42 3.52-2.83 1.11-1.62 1.56-3.2 1.59-3.28-.04-.01-3.05-1.17-3.08-4.63ZM14.16 4c.8-.97 1.34-2.32 1.19-3.66-1.15.05-2.55.77-3.38 1.74-.74.85-1.39 2.23-1.22 3.55 1.29.1 2.6-.65 3.41-1.63Z" />
            </svg>
            App Store
          </a>
        </div>

        <p className="mt-[18px] text-[14px] text-ink-soft">
          <strong className="font-bold text-brand">2k+</strong> app downloads{" "}
          <span className="mx-[6px]" aria-hidden="true">·</span>{" "}
          <strong className="font-bold text-brand">
            <span className="text-[#f5b301]" aria-hidden="true">★</span> 4.9
          </strong>{" "}
          overall rating
        </p>

        <div className="relative mx-auto mt-[56px] aspect-[921/440] w-[min(1060px,88%)] mobile:aspect-auto mobile:h-[clamp(320px,50vh,520px)]">
          <div data-fan-item className={`${FAN_ITEM} top-[21.1%] left-[9.1%] h-[59.5%] w-[13.1%] mobile:hidden`}>
            <Image src="/assets/fan-article.jpg" width={455} height={984} alt="Article brief" loading="eager" className={FAN_IMG} />
          </div>
          <div data-fan-item className={`${FAN_ITEM} top-[10%] left-[21.3%] z-2 h-[74.5%] w-[16.4%] ${FAN_INNER} mobile:right-auto mobile:left-[-12vw]`}>
            {/* the LCP candidate */}
            <Image src="/assets/fan-qix.jpg" width={455} height={984} alt="Qix visual stories" preload className={FAN_IMG} />
          </div>
          {/* where the flying phone sits in the hero */}
          <div
            id="anchor-hero"
            className="absolute top-0 left-[36.9%] z-3 h-full w-[23.2%] mobile:top-[12%] mobile:bottom-auto mobile:left-1/2 mobile:h-[80%] mobile:w-[clamp(166px,54vw,280px)] mobile:-translate-x-1/2"
          />
          <div data-fan-item className={`${FAN_ITEM} top-[10%] left-[59.1%] z-2 h-[74.5%] w-[16.4%] ${FAN_INNER} mobile:right-[-12vw] mobile:left-auto`}>
            <Image src="/assets/fan-pix.jpg" width={455} height={984} alt="Pix visual headlines" loading="eager" className={FAN_IMG} />
          </div>
          <div data-fan-item className={`${FAN_ITEM} top-[21.1%] left-[75.2%] h-[59.5%] w-[13.1%] mobile:hidden`}>
            <Image src="/assets/fan-trax.jpg" width={455} height={984} alt="Trax audio player" loading="eager" className={FAN_IMG} />
          </div>
        </div>
      </div>
    </section>
  );
}
