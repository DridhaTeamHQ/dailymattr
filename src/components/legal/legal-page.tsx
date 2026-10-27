import Link from "next/link";
import type { ReactNode } from "react";
import { pill } from "@/components/site/pill";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { SmoothScroll } from "./smooth-scroll";
import { LegalToc } from "./toc";

export type LegalSectionData = {
  id: string;
  /** the <h2>; leave out for an unnumbered lead-in (About's intro), which
   * then gets no number and no entry in the contents rail */
  title?: string;
  /** contents-rail label, where it is shorter than or worded unlike the <h2> */
  toc?: string;
  body: ReactNode;
};

export type CrosslinkData = { title: string; text: string; href: string; cta: string };

/* <main> of a long-form page: hero, contents + article, footer */
export function LegalMain({ children }: { children: ReactNode }) {
  return (
    <main>
      <SmoothScroll />
      {children}
    </main>
  );
}

/* Sticky contents rail + article (was .legal-body). Section numbers and the
 * rail are derived from `sections`. */
export function LegalBody({ sections, crosslink }: { sections: LegalSectionData[]; crosslink?: CrosslinkData }) {
  let n = 0;
  const numbered = sections.map((s) => ({ ...s, num: s.title ? ++n : undefined }));
  const contents = numbered.flatMap((s) => (s.num ? [{ id: s.id, label: `${s.num}. ${s.toc ?? s.title}` }] : []));

  return (
    <div className="mx-auto grid max-w-[1200px] grid-cols-[280px_minmax(0,1fr)] gap-[clamp(40px,6vw,96px)] px-[clamp(20px,4vw,40px)] pt-[clamp(56px,8vw,100px)] pb-[clamp(70px,9vw,120px)] mobile:grid-cols-[1fr] mobile:gap-[36px]">
      <LegalToc items={contents} spy={sections.map((s) => s.id)} />
      <article className="text-[15.5px] leading-[1.75] text-[#3a3a40]">
        {numbered.map(({ id, num, title, body }) => (
          <Reveal
            key={id}
            as="section"
            id={id}
            className="scroll-mt-[calc(var(--spacing-nav)+26px)] border-t border-solid border-[#ececf0] py-[34px] first-of-type:border-t-0 first-of-type:pt-0"
          >
            {num !== undefined && (
              <span className="mb-[10px] block text-[12px] font-bold tracking-[3px] text-brand">{String(num).padStart(2, "0")}</span>
            )}
            {title && (
              <h2 className="mb-[16px] text-[length:clamp(21px,2.2vw,27px)] leading-[1.25] font-bold tracking-[-.5px] text-ink">{title}</h2>
            )}
            {body}
          </Reveal>
        ))}
        {crosslink && <Crosslink {...crosslink} />}
      </article>
    </div>
  );
}

/* the banner pointing on to the companion page (was .legal-crosslink) */
function Crosslink({ title, text, href, cta }: CrosslinkData) {
  return (
    <Reveal className="mt-[44px] flex flex-wrap items-center justify-between gap-[20px] rounded-panel bg-mist px-[clamp(24px,4vw,44px)] py-[clamp(24px,3.5vw,36px)]">
      <div>
        <h3 className="mb-[4px] text-[18px] font-bold text-ink">{title}</h3>
        <p className="text-[14px] text-ink-soft">{text}</p>
      </div>
      {/* Two corrections to the shared pill, so this matches the original
          .btn: the hover lift (a `translate`) is transitioned, .25s ease;
          and the shine's resting offset is a `transform`, which the shine
          keyframes replace, rather than a `translate` they would add to. */}
      <Link
        href={href}
        className={cn(
          pill({ variant: "brand", shine: true }),
          "group px-[24px] py-[13px] text-[15px]",
        )}
      >
        {cta}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="transition-transform duration-[250ms] ease-[ease] group-hover:translate-x-[3px]"
        >
          <path d="M5 12h14m-6-7 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </Reveal>
  );
}
