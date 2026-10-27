import type { Metadata } from "next";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { PageJsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/page-meta";
import { cn } from "@/lib/utils";
import "@/styles/forms.css";

export const metadata: Metadata = pageMetadata("newsletter");

/* entrance: rise into place (was .nl-rise; the card follows .1s later) */
const rise = "opacity-0 [transform:translateY(18px)] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none";

/* the floating doodles: wide screens only, each popping in at its own
 * angle (--rot) after its own delay (--d) */
const doodle =
  "absolute hidden font-serif leading-none opacity-0 [transform:rotate(var(--rot,0deg))_scale(.5)] drop-shadow-[0_1px_1px_rgba(20,20,23,.12)] animate-[nl-pop_.55s_cubic-bezier(.26,1.3,.5,1)_var(--d,.3s)_forwards] min-[1024px]:block motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none";
const DOODLES = [
  { glyph: "✦", className: "top-[18%] left-[5%] text-[42px] text-[#3979ff] [--d:.25s] [--rot:-12deg]" },
  { glyph: "☻", className: "top-[19%] right-[7%] text-[44px] text-[#8db4ff] [--d:.33s] [--rot:12deg]" },
  { glyph: "✉", className: "bottom-[20%] left-[8%] text-[42px] text-[#2c66ea] [--d:.41s] [--rot:-12deg]" },
  { glyph: "☕", className: "right-[5%] bottom-[24%] text-[38px] text-[#5b93ff] [--d:.49s] [--rot:12deg]" },
  { glyph: "⚡", className: "top-[38%] left-[21%] text-[30px] text-[#3979ff] [--d:.57s] [--rot:12deg]" },
  { glyph: "✎", className: "top-[40%] right-[22%] text-[38px] text-[#8db4ff] [--d:.65s] [--rot:-12deg]" },
];

const POINTS = [
  { icon: "📰", text: "5 top stories summarised" },
  { icon: "✅", text: "Fact checked & handpicked" },
  { icon: "🔗", text: "Source shared" },
];

export default function NewsletterPage() {
  return (
    <>
      <PageJsonLd page="newsletter" />
      <main className="relative isolate min-h-screen overflow-hidden px-4 pt-[calc(var(--spacing-nav)+44px)] pb-20 [@media(max-width:899px)]:px-3 [@media(max-width:899px)]:pt-[calc(var(--spacing-nav)+28px)] [@media(max-width:899px)]:pb-14">
        {/* soft background blobs + doodles */}
        <div className="pointer-events-none absolute inset-0 -z-1 overflow-hidden" aria-hidden="true">
          <div className="absolute top-[190px] -left-[90px] size-[280px] rounded-full bg-[rgba(57,121,255,.16)] blur-[70px]" />
          <div className="absolute top-[110px] -right-[100px] size-[320px] rounded-full bg-[rgba(141,180,255,.28)] blur-[70px]" />
          <div className="absolute bottom-[5%] left-[34%] size-[260px] rounded-full bg-[rgba(57,121,255,.12)] blur-[70px]" />
          {DOODLES.map((d) => (
            <span key={d.glyph} className={`${doodle} ${d.className}`}>
              {d.glyph}
            </span>
          ))}
          <svg
            className="absolute top-[30%] left-[10%] hidden h-[70px] w-[175px] animate-[nl-fade_.6s_ease_.7s_forwards] opacity-0 min-[1024px]:block motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none"
            viewBox="0 0 175 70"
            fill="none"
          >
            <path d="M5 57C32 18 49 70 73 34C92 5 119 41 170 8" stroke="#3979ff" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 8" />
            <path d="M163 5l8 3-5 7" stroke="#3979ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="mx-auto max-w-[1100px]">
          <div className={cn("mb-[clamp(32px,5vh,44px)] animate-[nl-rise_.55s_cubic-bezier(.22,1,.36,1)_forwards] text-center", rise)}>
            <h1 className="mx-auto max-w-[780px] text-[length:clamp(40px,6vw,74px)] leading-[1.02] font-bold tracking-[-0.045em] text-ink">
              We make being informed a{" "}
              <span className="relative inline-block text-brand">
                daily habit
                <span aria-hidden="true" className="absolute -bottom-[6px] left-0 h-[7px] w-full -rotate-2 rounded-full bg-[rgba(57,121,255,.3)]" />
              </span>{" "}
              not a daily battle.
            </h1>
          </div>

          <section
            className={cn(
              "grid overflow-hidden rounded-panel border border-solid border-[#e4edff] bg-white shadow-[0_30px_80px_-30px_rgba(20,20,23,.25)] min-[900px]:grid-cols-[.86fr_1.14fr]",
              "animate-[nl-rise_.55s_cubic-bezier(.22,1,.36,1)_.1s_forwards]",
              rise,
            )}
          >
            <aside className="relative overflow-hidden bg-[radial-gradient(120%_100%_at_20%_0%,#5b93ff_0%,var(--color-brand)_60%)] p-[clamp(28px,4vw,44px)] text-white">
              <div className="absolute -top-12 -right-12 size-48 rounded-full border-[18px] border-solid border-white/22" aria-hidden="true" />
              <div className="absolute -bottom-16 -left-10 size-44 rounded-full border-[17px] border-solid border-white/14" aria-hidden="true" />
              <p className="relative text-[13px] font-bold tracking-[.18em] text-white/75 uppercase">Your new daily ritual</p>
              <h2 className="relative mt-4 max-w-[300px] text-[length:clamp(28px,3vw,40px)] leading-[1.06] font-semibold tracking-[-0.04em]">
                Open your inbox to stories that mattr.
              </h2>
              <div className="relative mt-[34px] grid gap-[14px]">
                {POINTS.map((point) => (
                  <div key={point.text} className="flex items-center gap-3">
                    <span className="flex size-9 flex-none items-center justify-center rounded-full bg-white text-[18px] shadow-[0_4px_14px_rgba(10,20,40,.28)]">
                      {point.icon}
                    </span>
                    <p className="text-[15px] leading-[1.45] font-medium text-white">{point.text}</p>
                  </div>
                ))}
              </div>
              <p className="relative mt-[38px] text-[13px] font-medium text-white/80">No doomscrolling. No clutter. Unsubscribe whenever.</p>
            </aside>

            <div className="flex min-h-[300px] items-center p-[clamp(24px,4vw,44px)]">
              <NewsletterForm />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
