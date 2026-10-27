import Link from "next/link";
import { pill } from "@/components/site/pill";
import { FaqAccordion } from "./faq-accordion";

const FAQS = [
  {
    q: "What is this app about?",
    a: "dailymattr is a news app where you can read, watch, listen, and explore news in different formats like Pix, Qix, Trax, Articles, Polls, and Xplaind.",
  },
  {
    q: "How is this different from other news apps?",
    a: "You can consume news your way - explore and read pix visual stories and articles, watch qix videos, listen to audio stories, vote in Polls, and understand topics better through Xplaind.",
  },
  {
    q: "Are the news sources reliable?",
    a: "Yes. dailymattr focuses on verified and trusted news sources to help users stay informed with accurate and relevant updates.",
  },
  {
    q: "Can I listen to news instead of reading?",
    a: "Yes. You can always switch to audio while reading articles which is useful while travelling, working or when you do not want to read. We also have the Trax section where you just listen to our Explainers.",
  },
  {
    q: "Can I personalize my news feed?",
    a: "Yes. You can choose your interests and location so dailymattr can show more relevant news based on your preferences.",
  },
  {
    q: "Is dailymattr free?",
    a: "Absolutely. There's no subscription and no paywall — just download dailymattr from Google Play or the App Store and start exploring every story and format right away.",
  },
];

/* Rises over the section above as a rounded white sheet. The top padding is
 * always 70px: the original's `.home-trend + .faq` rule matched whether or
 * not the latest-news strip was showing. */
export function Faq() {
  return (
    <section
      id="faq"
      className="relative z-5 -mt-[32px] rounded-t-[32px] bg-paper px-[8vw] pt-[70px] pb-[130px] mobile:px-[clamp(20px,6vw,34px)] mobile:pb-[clamp(64px,10vh,90px)]"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-[1fr_1.15fr] gap-[80px] mobile:grid-cols-[1fr] mobile:gap-[40px]">
        <div data-faq-left>
          <p className="text-[12px] font-semibold tracking-[3.5px] text-ink-soft mobile:pr-[24px]">
            <mark className="bg-ink px-[6px] py-[3px] text-white">QUESTIONS.</mark> ANSWERED
          </p>
          <h2 className="mt-[20px] text-[clamp(38px,4vw,56px)] leading-[1.12] font-bold tracking-[-1.5px]">
            Frequently Asked
            <br />
            Questions
          </h2>
          <p className="mt-[22px] max-w-[420px] text-[15px] leading-[1.7] text-ink-soft">
            Learn what dailymattr is, the formats you can read, watch and listen to, how to personalise your feed, and how to save stories for later.
          </p>
          <div className="mt-[56px] flex gap-[10px]">
            <Link className={pill({ variant: "brand", shine: true })} href="/newsletter/">
              Subscribe
            </Link>
          </div>
        </div>
        <div>
          <FaqAccordion items={FAQS} />
        </div>
      </div>
    </section>
  );
}
