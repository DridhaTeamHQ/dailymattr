import type { Metadata } from "next";
import { HeroEyebrow, HeroSub, HeroTitle, HeroUpdated, LegalHero } from "@/components/legal/hero";
import { LegalBody, LegalMain, type LegalSectionData } from "@/components/legal/legal-page";
import { ContactCard, Item, List, Note, P, Strong, TextLink } from "@/components/legal/prose";
import { PageJsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { pageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = pageMetadata("editorialguidelines");

const SECTIONS: LegalSectionData[] = [
  {
    id: "about",
    title: "About This Policy",
    body: (
      <>
        <P>dailymattr (“dailymattr”, “we”, “us” or “our”) is a news and infotainment platform owned and operated by <Strong>Dridha Technologies Private Limited</Strong>, a company incorporated under the Companies Act, 2013, with its office at Madhapur, Hyderabad, Telangana, India – 500081. This Editorial Guidelines describes the standards and practices that govern how we select, produce, verify and present editorial content across the <TextLink href="/">dailymattr app</TextLink>, <TextLink href="/newsletter/">newsletters</TextLink> and related channels.</P>
        <P>This Policy is publicly available and applies to everyone who creates or edits content for dailymattr, whether an employee, editor, contributor, or automated tool operating under human supervision.</P>
      </>
    ),
  },
  {
    id: "mission",
    title: "Our Editorial Mission and Values",
    body: (
      <>
        <P>dailymattr exists to give readers — primarily young Indian students and working professionals — clear, concise and reliable news and infotainment that helps them understand what matters, with the context to make sense of it. Our editorial work is guided by five core values:</P>
        <List>
          <Item><Strong>Accuracy</Strong> – we prioritise getting the facts right over being first.</Item>
          <Item><Strong>Fairness and balance</Strong> – we represent issues honestly and, on contested matters, reflect all the main sides.</Item>
          <Item><Strong>Independence</Strong> – editorial judgement is not dictated by commercial, political or personal interests.</Item>
          <Item><Strong>Clarity</Strong> – we write in plain, accessible language and clearly distinguish fact from analysis.</Item>
          <Item><Strong>Accountability</Strong> – we correct mistakes openly and remain answerable to our readers.</Item>
        </List>
      </>
    ),
  },
  {
    id: "what-we-publish",
    title: "What dailymattr Publishes",
    body: (
      <>
        <P>dailymattr is a news-synthesis and curation platform. We publish two kinds of editorial content, and we keep them clearly distinguishable:</P>
        <List>
          <Item><Strong><TextLink href="/news/">News summaries</TextLink>.</Strong> Original, concise accounts of news developments and current affairs, written in our own words by synthesising facts reported across multiple published, credible sources.</Item>
          <Item><Strong>dailymattr analysis and opinion.</Strong> Commentary, perspective and analysis that is our own, which may be published as a dailymattr magazine or an opinion item. Any opinion published on dailymattr is dailymattr’s editorial voice; we do not republish the opinion or editorial content of other publications. Analysis and opinion are labelled as such and kept distinguishable from straight news.</Item>
        </List>
        <P>Except where a piece is expressly presented as our own analysis or commentary, we are transparent that dailymattr’s core product is synthesised and curated news rather than original on-the-ground reporting.</P>
      </>
    ),
  },
  {
    id: "authorship",
    title: "Authorship and How We Produce News",
    body: (
      <>
        <P>Every story published on dailymattr is authored by dailymattr. Our editorial team decides what to cover, writes every headline and summary in our own words, and determines the structure, emphasis and presentation of each piece. dailymattr is the author and publisher of — and takes editorial responsibility for — all content it carries. Our practices are as follows:</P>
        <List>
          <Item><Strong>Research across the public record.</Strong> A typical dailymattr story is researched by reviewing several published reports of the same development — commonly three to four or more — alongside official releases and other reputable public information, and distilling the common, verifiable facts into a single original piece of our own.</Item>
          <Item><Strong>Original expression.</Strong> We write our summaries in our own words, with our own structure, selection and presentation. We do not reproduce or closely paraphrase the wording, structure or creative expression of any source, and we do not host or copy source publishers’ photographs or other protected media.</Item>
          <Item><Strong>Public facts, not others’ opinions.</Strong> We summarise publicly reported facts and events. We do not copy or restate the editorial opinions, exclusive analysis or creative commentary of other publications as our content.</Item>
          <Item><Strong>Citation where a source is distinctive.</Strong> Where a story rests on the exclusive or distinctive reporting of a particular publisher, or where we quote or reference a specific report, statement or figure attributable to one outlet, we cite that source by name.</Item>
        </List>
        <P>Because the facts in our stories are typically part of the public record — reported concurrently by multiple independent outlets — no single third party is “the source” of a dailymattr story. The source of each story in our app is dailymattr: the reporting judgement, headline, wording and presentation are our own original editorial work. Readers with questions or concerns about any story, including how it was researched, can reach our editorial team using the contact details in <TextLink href="#contact">Section 11</TextLink>.</P>
      </>
    ),
  },
  {
    id: "accuracy",
    title: "Accuracy, Verification and Fact-Checking",
    body: (
      <>
        <P>Before publishing, our editors take reasonable steps to verify that the facts in a story are supported by credible sources.</P>
        <List>
          <Item>Cross-verification across multiple independent reports is built into our production model: a fact is presented as established when it is consistently reported by credible sources, and attributed or qualified when it is not.</Item>
          <Item>We attribute claims to their source rather than stating contested or unverified claims as fact.</Item>
          <Item>We report figures, statistics and financial data as stated by the underlying source. We do not generate our own calculations, projections or estimates and present them as fact.</Item>
          <Item>Where information is developing, provisional or unconfirmed, we say so.</Item>
          <Item>We take care with quotes, statistics, dates and named individuals, and we do not fabricate or embellish facts.</Item>
        </List>
      </>
    ),
  },
  {
    id: "independence",
    title: "Editorial Independence and Advertising",
    body: (
      <>
        <P>Editorial decisions at dailymattr are made on editorial merit and are kept separate from commercial considerations.</P>
        <List>
          <Item><TextLink href="/termsandconditions/#advertising">Advertising or sponsored content</TextLink>, where present, is clearly identified as such (for example, labelled “Ad” or “Sponsored”), so that readers can always tell paid content from editorial content.</Item>
          <Item>Advertisers and sponsors do not control, approve or influence our editorial coverage.</Item>
          <Item>We do not build advertising profiles of our readers or serve them targeted advertising based on profiling, as set out in our <TextLink href="/privacypolicy/#how-we-use">Privacy Policy</TextLink>.</Item>
        </List>
      </>
    ),
  },
  {
    id: "ai",
    title: "Use of Artificial Intelligence",
    body: (
      <>
        <P>dailymattr uses AI tools to assist in gathering, summarising and drafting content, and offers an <TextLink href="/termsandconditions/#ai-assistant">in-app AI assistant</TextLink> to help readers explore topics. We use AI responsibly and under human control:</P>
        <List>
          <Item><Strong>Human review of AI-assisted content.</Strong> AI may draft or summarise, but a human editor reviews, edits and approves content before it is published. AI does not have final editorial authority.</Item>
          <Item><Strong>Labelling of synthetic media.</Strong> Any AI-generated or synthetically altered images are labelled in accordance with India’s Information Technology Rules and are never presented as documentary photographs of real events. We do not use AI to depict real, identifiable individuals in misleading ways.</Item>
          <Item><Strong>The in-app AI assistant.</Strong> Its responses are automated, may be incomplete or inaccurate, and do not constitute professional, legal, financial or medical advice. We encourage readers to verify information independently.</Item>
        </List>
        <Note>The same accuracy, sourcing and fairness standards set out in this Policy apply to <Strong>AI-assisted content</Strong>.</Note>
      </>
    ),
  },
  {
    id: "conduct",
    title: "Standards of Conduct — What We Will Not Publish",
    toc: "Standards of Conduct",
    body: (
      <>
        <P>Regardless of source, we do not knowingly publish content that:</P>
        <List>
          <Item>is false, misleading or designed to deceive, or that we know to be misinformation;</Item>
          <Item>is defamatory, obscene or hateful, or that incites violence or discrimination on grounds such as religion, caste, gender, ethnicity or region;</Item>
          <Item>is harmful to children or sexualises minors;</Item>
          <Item>infringes the intellectual-property or privacy rights of others; or</Item>
          <Item>is unlawful under applicable Indian law.</Item>
        </List>
        <P>We handle sensitive subjects — including contested political, communal and electoral matters — with particular care, neutrality and reliance on credible sourcing, and we avoid sensationalism.</P>
      </>
    ),
  },
  {
    id: "corrections",
    title: "Corrections and Updates",
    body: (
      <P>We aim to correct significant errors of fact promptly and transparently once we become aware of them. Readers can report a suspected error or request a correction using the contact details in <TextLink href="#contact">Section 11</TextLink>, and we will review such reports and take appropriate action. Because news develops over time, we update or refresh content as facts change, and we keep our published news content current rather than static.</P>
    ),
  },
  {
    id: "responsibility",
    title: "Editorial Responsibility",
    body: (
      <P>Responsibility for editorial standards at dailymattr rests with the dailymattr editorial team, operating under Dridha Technologies Private Limited. Our editors are responsible for applying this Policy to the selection, verification, editing and publication of content, including content produced with the assistance of AI tools.</P>
    ),
  },
  {
    id: "contact",
    title: "Contact and Grievances",
    body: (
      <>
        <P>We welcome feedback, corrections and complaints about our editorial content, including requests to identify the sources behind a published story or to correct or remove content. Our Grievance Officer can be reached at:</P>
        <ContactCard
          role="Grievance Officer"
          name="K. Srilekha"
          email="team@dailymattr.com"
          address="Dridha Technologies Private Limited, Madhapur, Hyderabad, Telangana – 500081, India"
        />
        <P>We will acknowledge and seek to resolve complaints within the timelines required under applicable law.</P>
      </>
    ),
  },
  {
    id: "review",
    title: "Review of This Guidelines",
    toc: "Review of This Policy",
    body: (
      <P>We may update this Editorial Guidelines from time to time to reflect changes in our practices or in applicable law. The version published here, together with its “Last updated” date, is the current version.</P>
    ),
  },
];

export default function EditorialGuidelinesPage() {
  return (
    <>
      <PageJsonLd page="editorialguidelines" />
      <LegalMain>
        <LegalHero>
          <HeroEyebrow mark="EDITORIAL.">STANDARDS &amp; PRACTICE</HeroEyebrow>
          <HeroTitle accent="Guidelines">Editorial</HeroTitle>
          <HeroSub>dailymattr — News &amp; Infotainment App · Dridha Technologies Private Limited</HeroSub>
          <HeroUpdated>Last updated · 4 August 2026</HeroUpdated>
        </LegalHero>
        <LegalBody
          sections={SECTIONS}
          crosslink={{
            title: "Privacy Policy",
            text: "See what personal data we collect and how we protect it.",
            href: "/privacypolicy/",
            cta: "Read the Policy",
          }}
        />
        <SiteFooter parentLine={false} />
      </LegalMain>
    </>
  );
}
