import type { Metadata } from "next";
import { PageJsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { SupportForm } from "@/components/support/support-form";
import { pageMetadata } from "@/lib/page-meta";
import { SUPPORT_EMAIL } from "@/lib/site";
import "@/styles/forms.css";

export const metadata: Metadata = pageMetadata("support");

/* the two faint rings drifting off the right edge (were .support::before/::after) */
const ring = "before:pointer-events-none before:absolute before:rounded-full before:border before:border-solid before:border-[rgba(72,132,255,.12)] before:content-['']";
const ring2 = "after:pointer-events-none after:absolute after:rounded-full after:border after:border-solid after:border-[rgba(72,132,255,.12)] after:content-['']";

export default function SupportPage() {
  return (
    <>
      <PageJsonLd page="support" />
      <main>
        <section
          id="support"
          aria-labelledby="support-title"
          className={[
            "relative grid min-h-[max(620px,100vh)] grid-cols-[minmax(260px,.9fr)_minmax(420px,1.1fr)] items-start gap-[clamp(52px,9vw,140px)] overflow-hidden bg-coal-2 px-[max(6.5vw,24px)] pt-[calc(130px+var(--spacing-nav))] pb-[130px] text-white",
            ring,
            "before:top-[16%] before:-right-[250px] before:size-[460px]",
            ring2,
            "after:top-[5%] after:-right-[360px] after:size-[680px]",
            "desktop:[@media(max-height:800px)]:pt-[calc(110px+var(--spacing-nav))]",
            "mobile:min-h-0 mobile:grid-cols-[1fr] mobile:gap-10 mobile:px-[clamp(20px,6vw,34px)] mobile:pt-[calc(clamp(64px,10vh,90px)+var(--spacing-nav))] mobile:pb-[clamp(64px,10vh,90px)]",
          ].join(" ")}
        >
          <div className="relative z-[1] animate-[support-rise_.7s_cubic-bezier(.22,1,.36,1)_both] pt-[42px] motion-reduce:animate-none desktop:[@media(max-height:800px)]:pt-7 mobile:pt-0">
            <p className="pl-[69px] text-[12px] font-semibold tracking-[3.5px] text-white/60 mobile:pr-6 mobile:pl-[clamp(20px,6vw,40px)]">
              <mark className="bg-white px-1.5 py-[3px] text-coal">NEED A HAND?</mark> WE&apos;RE HERE.
            </p>
            <h1 id="support-title" className="mt-[22px] text-[length:clamp(40px,4.5vw,66px)] leading-[1.06] font-bold tracking-[-2px] mobile:tracking-[-1.4px]">
              Let’s get you
              <br />
              back on track.
            </h1>
            <p className="mt-7 max-w-[390px] text-[16px] leading-[1.75] text-white/64">
              Tell us what you need and we&apos;ll send it straight to our support team.
            </p>
            <a
              className="mt-[26px] inline-block border-b border-solid border-white/35 pb-[5px] font-semibold text-white transition-[color,border-color] duration-200 ease-[ease] hover:border-[#8db4ff] hover:text-[#8db4ff]"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
          <SupportForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
