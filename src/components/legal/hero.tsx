import type { ReactNode } from "react";
import "@/styles/legal.css";

/* The dark rounded hero panel of the long-form pages (was .legal-hero /
 * .legal-hero-inner). Its children rise in one after another: each piece
 * below carries its own delay, so the order they are written in does not
 * change the timing (About shows the date above the strapline). */
export function LegalHero({ children }: { children: ReactNode }) {
  return (
    <section className="px-[16px] pt-[calc(var(--spacing-nav)+11px)] mobile:px-[12px]">
      <div
        className={
          "relative overflow-hidden rounded-panel bg-[radial-gradient(120%_130%_at_50%_0%,#1c1c1f_0%,var(--color-coal)_60%)] px-[24px] pt-[clamp(64px,9vw,110px)] pb-[clamp(72px,9vw,120px)] text-center " +
          /* blue glow rising from under the panel's bottom edge */
          "before:pointer-events-none before:absolute before:top-full before:left-1/2 before:h-[480px] before:w-[720px] before:-translate-x-1/2 before:-translate-y-[40%] before:bg-[radial-gradient(circle,rgba(57,121,255,.22)_0%,transparent_62%)] before:blur-[40px] before:content-['']"
        }
      >
        {children}
      </div>
    </section>
  );
}

/* "LEGAL. YOUR DATA, RESPECTED" — the white-highlighted kicker */
export function HeroEyebrow({ mark, children }: { mark: string; children: ReactNode }) {
  return (
    <p className="animate-[legal-rise_.85s_cubic-bezier(.22,.7,.25,1)_.08s_both] text-[12px] font-semibold tracking-[3.5px] text-[rgba(255,255,255,.85)] motion-reduce:animate-none mobile:pr-[24px]">
      <mark className="bg-white px-[6px] py-[3px] text-coal">{mark}</mark> {children}
    </p>
  );
}

/* the page title; `accent` is the italic serif word(s) in brand blue */
export function HeroTitle({ accent, children }: { accent: string; children: ReactNode }) {
  return (
    <h1 className="mt-[22px] animate-[legal-rise_.85s_cubic-bezier(.22,.7,.25,1)_.18s_both] text-[length:clamp(38px,5.4vw,72px)] leading-[1.06] font-bold tracking-[-1.5px] text-white motion-reduce:animate-none">
      {children} <em className="font-serif font-extrabold text-brand-soft italic">{accent}</em>
    </h1>
  );
}

export function HeroSub({ children }: { children: ReactNode }) {
  return (
    <p className="mt-[18px] animate-[legal-rise_.85s_cubic-bezier(.22,.7,.25,1)_.3s_both] text-[length:clamp(14px,1.6vw,17px)] text-[rgba(255,255,255,.62)] motion-reduce:animate-none">
      {children}
    </p>
  );
}

/* the "Last updated" pill; About renders it as a <p>, the policies as a <span> */
export function HeroUpdated({ as: Tag = "span", children }: { as?: "p" | "span"; children: ReactNode }) {
  return (
    <Tag className="mt-[26px] inline-flex animate-[legal-rise_.85s_cubic-bezier(.22,.7,.25,1)_.42s_both] items-center gap-[8px] rounded-[999px] border border-solid border-[rgba(255,255,255,.12)] bg-[rgba(255,255,255,.07)] px-[18px] py-[9px] text-[12px] font-semibold tracking-[2px] text-[rgba(255,255,255,.75)] uppercase motion-reduce:animate-none">
      <i className="inline-block size-[7px] rounded-[50%] bg-brand-soft" />
      {children}
    </Tag>
  );
}
