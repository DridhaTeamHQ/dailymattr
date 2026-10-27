import type { Metadata } from "next";
import { HeroSub, HeroTitle, HeroUpdated, LegalHero } from "@/components/legal/hero";
import { LegalBody, LegalMain, type LegalSectionData } from "@/components/legal/legal-page";
import { Item, List, P, Strong, TextLink } from "@/components/legal/prose";
import { PageJsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { pageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = pageMetadata("about");

const SECTIONS: LegalSectionData[] = [
  {
    id: "intro",
    body: (
      <>
        <P>We live in the most connected era in history, yet staying informed has never felt harder. Every day, thousands of headlines compete for a few minutes of our attention across feeds, apps, alerts and forwards.</P>
        <P>India&apos;s news and information space is still largely owned by legacy media brands. The way we live, work and consume content has changed completely, but the way news is packaged has barely moved.</P>
      </>
    ),
  },
  {
    id: "problem",
    title: "The problem",
    body: (
      <>
        <P>The result is a paradox: we have more information than ever, and understand less of it.</P>
        <P>Social media is built to keep you scrolling, not to keep you informed, and doomscrolling has become a habit across every age group. News apps are cluttered, sensational and often opinion-led, giving you more than you need and less of what you actually want: clarity.</P>
        <P>So a growing number of Indians are tuning out of the news altogether. Not because they don&apos;t care, but because there&apos;s no good way to stay informed without the noise.</P>
        <P><Strong>An informed country needs facts, not takes.</Strong></P>
      </>
    ),
  },
  {
    id: "solution",
    title: "How DailyMattr solves it",
    body: (
      <>
        <P>DailyMattr is a finishable daily briefing built for urban India. Every day, we bring you the 100 stories that matter, across business, tech, finance, policy, sport, culture and world affairs, in clean, swipeable cards you can actually get through. No clutter. No fluff. No opinions dressed up as news.</P>
        <List>
          <Item><Strong>Finishable by design.</Strong> We cap each day at 100 top stories, so you end informed, not hooked.</Item>
          <Item><Strong>Facts first.</Strong> Every story passes a fact-check layer and our built-in <TextLink href="/editorialguidelines/">editorial standards</TextLink>.</Item>
          <Item><Strong>Learn your way.</Strong> Go deeper with original audio and video explainers, <TextLink href="/newsletter/">newsletters</TextLink> and our <TextLink href="https://www.instagram.com/dailymattr?stkn=MTF1bzNiZ25kNHJ6" newTab>Instagram pages</TextLink>.</Item>
          <Item><Strong>Built for habit.</Strong> Streaks and reader ranks reward consistency, turning scroll time into time well spent.</Item>
        </List>
      </>
    ),
  },
  {
    id: "audience",
    title: "Who we're for",
    body: <P>Students, young professionals, senior leaders and the self-employed: anyone who wants to stay on top of the world without losing an hour to it.</P>,
  },
  {
    id: "promise",
    title: "Our promise",
    body: (
      <>
        <P>DailyMattr isn&apos;t here to tell you what to think. We&apos;re here to make sure you know what&apos;s happening, why it matters and what it means for you, in a few minutes a day.</P>
        <P><Strong>Stay informed. Stay sharp. Stay on what matters.</Strong></P>
      </>
    ),
  },
];

export default function AboutPage() {
  return (
    <>
      <PageJsonLd page="about" />
      <LegalMain>
        <LegalHero>
          <HeroTitle accent="Us">About</HeroTitle>
          <HeroUpdated as="p">15 Oct 2026</HeroUpdated>
          <HeroSub>News that matters. Nothing that doesn&apos;t.</HeroSub>
        </LegalHero>
        <LegalBody sections={SECTIONS} />
        <SiteFooter logoLink={false} />
      </LegalMain>
    </>
  );
}
