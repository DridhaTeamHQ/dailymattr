import type { Metadata } from "next";
import { HeroEyebrow, HeroSub, HeroTitle, LegalHero } from "@/components/legal/hero";
import { LegalBody, LegalMain, type LegalSectionData } from "@/components/legal/legal-page";
import { Item, List, P, Strong, TextLink } from "@/components/legal/prose";
import { PageJsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { pageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = pageMetadata("author");

const SECTIONS: LegalSectionData[] = [
  {
    id: "about",
    title: "About the Team",
    body: (
      <>
        <P>The dailymattr Editorial Team researches, writes, reviews and publishes news and infotainment content on <TextLink href="/">dailymattr</TextLink>. The team is responsible for selecting stories, writing headlines and summaries in original language, and maintaining editorial standards across published content. dailymattr operates under <Strong>Dridha Technologies Private Limited</Strong>, based in Madhapur, Hyderabad, India.</P>
        <P>Our goal is to help readers stay informed through clear, concise and accessible coverage of important developments in India and around the world. Learn more about our approach to publishing through our <TextLink href="/editorialguidelines/">Editorial Guidelines</TextLink>.</P>
      </>
    ),
  },
  {
    id: "how-we-work",
    title: "How We Work",
    body: (
      <>
        <List>
          <Item><Strong>Research and source verification</Strong> – We review multiple published reports, official announcements and other credible sources to establish verifiable facts before preparing news summaries.</Item>
          <Item><Strong>Accuracy and fact-checking</Strong> – We check important details, including names, dates, figures and key claims, against available sources and relevant information.</Item>
          <Item><Strong>Original news summaries</Strong> – We present information in our own words, focusing on factual accuracy, clarity and relevant context for readers.</Item>
          <Item><Strong>Human review of AI-assisted content</Strong> – AI tools may support certain content-production tasks, but a human editor reviews and approves every story before publication.</Item>
          <Item><Strong>Corrections and updates</Strong> – We address significant factual errors and update published stories when necessary to reflect verified information.</Item>
        </List>
        <P>Read our complete <TextLink href="/editorialguidelines/">Editorial Guidelines</TextLink> to learn more about our publishing standards, editorial practices and corrections process.</P>
      </>
    ),
  },
  {
    id: "coverage",
    title: "Our Coverage",
    body: (
      <>
        <P>The dailymattr Editorial Team covers current affairs, public developments and stories across a range of topics. Explore our <TextLink href="/news/">latest news</TextLink> or browse the sections below to find coverage relevant to your interests.</P>
        <List>
          <Item><TextLink href="/news/india/">India News</TextLink> – National news, public affairs and important developments across India.</Item>
          <Item><TextLink href="/news/world/">World News</TextLink> – International events and significant global developments.</Item>
          <Item><TextLink href="/news/business/">Business News</TextLink> – Business developments, markets, companies and economic updates.</Item>
          <Item><TextLink href="/news/technology/">Technology News</TextLink> – Technology trends, digital developments and industry news.</Item>
          <Item><TextLink href="/news/sports/">Sports News</TextLink> – Sports updates, competitions and major sporting developments.</Item>
          <Item><TextLink href="/news/entertainment/">Entertainment News</TextLink> – Film, television, celebrity and entertainment industry updates.</Item>
          <Item><TextLink href="/news/lifestyle/">Lifestyle News</TextLink> – Lifestyle trends, culture and topics relevant to everyday life.</Item>
          <Item><TextLink href="/news/states/">State News</TextLink> – Regional news and significant developments across Indian states.</Item>
        </List>
      </>
    ),
  },
  {
    id: "standards",
    title: "Editorial Standards and Transparency",
    body: (
      <>
        <P>We believe that trustworthy news begins with responsible reporting, clear attribution and editorial accountability. The dailymattr Editorial Team aims to present information accurately, distinguish verified facts from developing reports, and provide appropriate context when covering important events.</P>
        <List>
          <Item><Strong>Editorial responsibility</Strong> – The team is responsible for the accuracy, presentation and review of its published content.</Item>
          <Item><Strong>Source transparency</Strong> – We aim to identify and link to relevant sources where appropriate, helping readers understand the information behind a report.</Item>
          <Item><Strong>Responsible AI use</Strong> – AI-assisted workflows remain subject to human editorial review.</Item>
          <Item><Strong>Reader accountability</Strong> – We welcome feedback and review reported factual concerns in accordance with our editorial policies.</Item>
        </List>
        <P>Learn more about our publishing principles in the <TextLink href="/editorialguidelines/">dailymattr Editorial Guidelines</TextLink>.</P>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact and Corrections",
    body: (
      <>
        <P>We value reader feedback and take concerns about published information seriously. If you identify a factual error, need clarification about a story or have feedback about our reporting, contact our editorial team.</P>
        <List>
          <Item><Strong>Editorial email:</Strong> <TextLink href="mailto:team@dailymattr.com">team@dailymattr.com</TextLink></Item>
          <Item><Strong>Corrections and feedback:</Strong> Contact us with the article URL and details of the issue so our team can review it.</Item>
          <Item><Strong>Editorial policies and grievances:</Strong> Read our <TextLink href="/editorialguidelines/#contact">Contact and Grievances policy</TextLink>.</Item>
        </List>
        <P>We review reported issues and make appropriate corrections or updates when warranted. Our aim is to keep our coverage accurate, transparent and useful to readers.</P>
      </>
    ),
  },
];

export default function AuthorPage() {
  return (
    <>
      <PageJsonLd page="author" />
      <LegalMain>
        <LegalHero>
          <HeroEyebrow mark="AUTHOR.">THE NEWSROOM</HeroEyebrow>
          <HeroTitle accent="Editorial Team">dailymattr</HeroTitle>
          <HeroSub>The team behind every story on dailymattr</HeroSub>
        </LegalHero>
        <LegalBody
          sections={SECTIONS}
          crosslink={{
            title: "Editorial Guidelines",
            text: "See how we select, produce, verify and present the news.",
            href: "/editorialguidelines/",
            cta: "Read the Guidelines",
          }}
        />
        <SiteFooter />
      </LegalMain>
    </>
  );
}
