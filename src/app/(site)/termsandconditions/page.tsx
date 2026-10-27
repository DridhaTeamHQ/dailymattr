import type { Metadata } from "next";
import { HeroEyebrow, HeroSub, HeroTitle, HeroUpdated, LegalHero } from "@/components/legal/hero";
import { LegalBody, LegalMain, type LegalSectionData } from "@/components/legal/legal-page";
import { ContactCard, H3, Item, List, P, Strong, TextLink } from "@/components/legal/prose";
import { PageJsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { pageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = pageMetadata("termsandconditions");

const SECTIONS: LegalSectionData[] = [
  {
    id: "introduction",
    title: "Introduction and Acceptance",
    body: (
      <>
        <P>These Terms and Conditions of Use (“Terms”), together with our <TextLink href="/privacypolicy/">Privacy Policy</TextLink>, form a legally binding agreement (the “Agreement”) between you and <Strong>Dridha Technologies Private Limited</Strong>, a company incorporated under the Companies Act, 2013, having its office at Madhapur, Hyderabad, Telangana, India – 500081 (“Company”, “we”, “us” or “our”), governing your access to and use of the <TextLink href="/">dailymattr mobile application</TextLink> and any related services (together, the “App”).</P>
        <P>By downloading, installing, accessing or using the App, you confirm that you have read, understood and agree to be bound by this Agreement. If you do not agree, please do not access or use the App.</P>
        <P>Our Privacy Policy is incorporated into these Terms by reference and explains how we handle your personal data. In the event of a conflict between these Terms and the Privacy Policy on a data-protection matter, the Privacy Policy prevails.</P>
      </>
    ),
  },
  {
    id: "definitions",
    title: "Definitions",
    body: (
      <List>
        <Item><Strong>“App”</Strong> means the dailymattr application, including all content, features, updates and related services made available by us.</Item>
        <Item><Strong>“AI Assistant”</Strong> means the artificial-intelligence assistant feature made available within the App, as described in <TextLink href="#ai-assistant">Section 9</TextLink>.</Item>
        <Item><Strong>“Content”</Strong> means all news summaries, text, graphics, images, audio, video, data, compilations and other material made available through the App.</Item>
        <Item><Strong>“User Content”</Strong> means any content you submit, post or transmit through the App, including comments and inputs to the AI Assistant.</Item>
        <Item><Strong>“User”, “you” or “your”</Strong> means any person who accesses or uses the App.</Item>
      </List>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility",
    body: (
      <P>The App is intended for users who are 18 years of age or older. By accessing or using the App, you represent and warrant that you are at least 18 years old, of sound mind, and competent to enter into a binding contract under applicable law, and that you are not barred from using the App under any applicable law.</P>
    ),
  },
  {
    id: "the-service",
    title: "The Service",
    body: (
      <>
        <P>dailymattr is a news and infotainment platform that curates, edits and presents <TextLink href="/news/">summaries of news</TextLink> and information drawn from published news sources. Where appropriate, summaries may link to the corresponding source. When you follow such a link, you leave the App, and we are not responsible for the content, accuracy, availability or practices of those external sources.</P>
        <P>The summaries and curation presented within the App are our <TextLink href="/editorialguidelines/">editorial product</TextLink>. While we take reasonable care in preparing them, they are provided for general information only, may be condensed, and may not capture the full context of the original source. You should refer to the original source and verify information before relying on it.</P>
        <P>The App may also contain or link to third-party websites, applications or materials, and may host content submitted by other users. We do not endorse, and are not responsible for, such third-party or user-submitted content, and you access it at your own risk.</P>
        <P>We may modify, suspend, add to or discontinue any part of the App at any time, with or without notice. We will not be liable to you or any third party for any such modification, suspension or discontinuance.</P>
      </>
    ),
  },
  {
    id: "licence",
    title: "Licence to Use the App",
    body: (
      <>
        <P>Subject to your compliance with this Agreement, we grant you a limited, personal, non-exclusive, non-transferable, non-sub-licensable and revocable licence to install and use the App on a device that you own or control, solely for your personal, non-commercial use.</P>
        <P>Except as expressly permitted, you may not copy, reproduce, modify, adapt, translate, create derivative works from, distribute, publicly display, sell, license, frame, scrape, data-mine or otherwise commercially exploit the App or any Content, in whole or in part, without our prior written consent.</P>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    body: (
      <>
        <P>The App, the dailymattr name and logo, and all Content, software, design, layout, selection, arrangement and compilation made available by us are owned by or licensed to the Company and are protected by intellectual-property and database rights and other laws. The curation and arrangement of Content reflects our editorial effort and is our proprietary compilation.</P>
        <P>Nothing in this Agreement transfers any intellectual-property rights to you. Source material referenced in summaries remains the property of the respective rights holders, and any use of such material beyond the App is governed by the terms of those rights holders. All rights not expressly granted to you are reserved.</P>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts and Security",
    body: (
      <P>Some features, such as posting comments and using the AI Assistant, require you to register and log in using your phone number. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to provide accurate information, to keep it updated, and to notify us promptly of any unauthorised use of your account. We may suspend or terminate accounts that we reasonably believe are being misused or that breach this Agreement.</P>
    ),
  },
  {
    id: "user-content",
    title: "User Content and Conduct",
    body: (
      <>
        <P>You are solely responsible for your User Content and for the consequences of posting or transmitting it. You represent that you own or have the necessary rights to your User Content and that it does not infringe any third-party rights or violate any law.</P>
        <P>By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, transferable and sub-licensable licence to host, store, reproduce, display, adapt and distribute that User Content for the purpose of operating, promoting and improving the App, for as long as is necessary for those purposes and as permitted by law.</P>
        <P>You agree that you will not host, upload, post, transmit, share or otherwise make available any User Content, or use the App in any manner, that:</P>
        <List>
          <Item>is unlawful, harmful, defamatory, obscene, pornographic, paedophilic, invasive of another’s privacy, harassing, hateful, or that is racially or ethnically objectionable, or otherwise objectionable;</Item>
          <Item>is harmful to a child, or sexualises or endangers a minor in any way;</Item>
          <Item>infringes any patent, trademark, copyright, database right or other proprietary right of any person;</Item>
          <Item>is false, misleading or deceptive, or impersonates any person or entity, or misrepresents your affiliation with any person or entity;</Item>
          <Item>threatens the unity, integrity, defence, security or sovereignty of India, friendly relations with foreign States, or public order, or incites the commission of any cognisable offence;</Item>
          <Item>contains any virus, malware or code designed to interrupt, damage or limit the functioning of any software, hardware or system;</Item>
          <Item>violates any applicable law, regulation or third-party agreement; or</Item>
          <Item>attempts to gain unauthorised access to, interfere with, or disrupt the App, its servers or networks, or circumvent any security or access-control measure.</Item>
        </List>
        <P>We are not obliged to monitor User Content, but we may review, moderate, refuse, edit or remove any User Content, and suspend or terminate accounts, at our discretion and in accordance with applicable law, where we reasonably believe this Agreement has been breached or removal is required by law.</P>
      </>
    ),
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    body: (
      <>
        <P>The App may make available the AI Assistant, which you may use to explore, summarise or ask questions about news and infotainment content. Your use of the AI Assistant is subject to this Section and the rest of this Agreement.</P>

        <H3>9.1 Acceptable use</H3>
        <P>The AI Assistant is provided for lawful, personal and reasonable use in connection with the App. You agree that you will not:</P>
        <List>
          <Item>use the AI Assistant for any unlawful, fraudulent, harmful, harassing, abusive, defamatory or infringing purpose;</Item>
          <Item>use it to generate or spread misinformation, or content that impersonates any person or entity;</Item>
          <Item>use it to generate content that is obscene, hateful, sexually explicit, or harmful to minors;</Item>
          <Item>attempt to reverse-engineer, extract or copy the underlying models, prompts or training data, or to circumvent any usage limits, content filters or safety measures;</Item>
          <Item>access the AI Assistant through bots, scrapers or other automated means, or use it to send spam or bulk or automated requests;</Item>
          <Item>overload, disrupt, degrade or impair the AI Assistant or its supporting infrastructure; or</Item>
          <Item>use the AI Assistant for any purpose other than its intended use, or in a manner that is unnecessary, excessive, abusive of the feature, or that places an unreasonable burden on our systems.</Item>
        </List>
        <P>We may monitor use of the AI Assistant for security, abuse-prevention and compliance purposes, and we may set usage limits and may restrict, suspend or withdraw access to the AI Assistant (in whole or in part) where we reasonably believe it is being misused or used in breach of this Agreement.</P>

        <H3>9.2 No reliance on AI outputs</H3>
        <P>The AI Assistant generates responses automatically, and its outputs may be inaccurate, incomplete or out of date. Its outputs do not constitute professional, legal, financial, medical or other advice. You are responsible for independently verifying any information before relying on or acting on it, and you use the AI Assistant at your own risk. You should not submit passwords, financial account details, sensitive information, or other people’s personal data to the AI Assistant. Our <TextLink href="/privacypolicy/#ai-assistant">Privacy Policy</TextLink> explains how AI Assistant inputs are processed.</P>
      </>
    ),
  },
  {
    id: "advertising",
    title: "Advertising and Sponsored Content",
    toc: "Advertising & Sponsored Content",
    body: (
      <P>The App may display advertising or sponsored content. Where content is sponsored, we will identify it as such (for example, by labelling it “Ad”, “Sponsored” or similar), in line with our <TextLink href="/editorialguidelines/#independence">editorial independence standards</TextLink>. We do not control, endorse or accept responsibility for the products, services or statements of advertisers or sponsors, and any dealings you have with them are solely between you and them. We do not build advertising profiles of you or serve you targeted advertising based on profiling.</P>
    ),
  },
  {
    id: "fees",
    title: "Fees",
    body: (
      <P>The App is currently provided free of charge. We reserve the right to introduce paid features, subscriptions or other charges in the future. Where we do, we will clearly describe the applicable fees and terms before you incur any charge, and your use of those paid features will be subject to the terms presented at that time.</P>
    ),
  },
  {
    id: "third-party",
    title: "Third-Party Services and App Stores",
    toc: "Third-Party Services & App Stores",
    body: (
      <P>You may download the App through third-party platforms such as the Google Play Store or the Apple App Store, and your download and use are also subject to those platforms’ terms. The App may rely on third-party services, including providers that power the AI Assistant. We are not responsible for third-party services, and your use of them may be subject to separate terms.</P>
    ),
  },
  {
    id: "privacy",
    title: "Privacy",
    body: (
      <P>Your use of the App is also governed by our <TextLink href="/privacypolicy/">Privacy Policy</TextLink>, which describes the personal data we collect and how we process it. By using the App, you acknowledge that you have read the Privacy Policy.</P>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    body: (
      <>
        <P>To the maximum extent permitted by law, the App and all Content, including news summaries and AI Assistant outputs, are provided on an “as is” and “as available” basis, without warranties of any kind, whether express, implied or statutory, including any implied warranties of merchantability, fitness for a particular purpose, accuracy, non-infringement or uninterrupted availability.</P>
        <P>We do not warrant that the App will be error-free, secure or available at all times, that defects will be corrected, or that the Content is accurate, complete or current. You use the App and rely on its Content at your own risk.</P>
      </>
    ),
  },
  {
    id: "limitation",
    title: "Limitation of Liability",
    body: (
      <>
        <P>To the maximum extent permitted by law, the Company and its directors, officers, employees and agents will not be liable for any indirect, incidental, special, consequential, punitive or exemplary damages, or for any loss of profits, revenue, data, goodwill or business opportunity, arising out of or in connection with your use of, or inability to use, the App, even if advised of the possibility of such damages.</P>
        <P>To the maximum extent permitted by law, our total aggregate liability arising out of or in connection with the App or this Agreement will not exceed the greater of (a) the total amount you paid to us, if any, for the App in the twelve (12) months preceding the event giving rise to the claim, or (b) INR 1,000. Nothing in this Agreement excludes or limits liability that cannot be excluded or limited under applicable law.</P>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnity",
    body: (
      <P>You agree to indemnify, defend and hold harmless the Company and its directors, officers, employees and agents from and against any claims, demands, losses, liabilities, damages, costs and expenses (including reasonable legal fees) arising out of or in connection with your User Content, your use or misuse of the App, your breach of this Agreement, or your violation of any law or the rights of any third party.</P>
    ),
  },
  {
    id: "termination",
    title: "Suspension and Termination",
    body: (
      <P>We may suspend, restrict or terminate your access to the App or any feature, with or without notice, where we reasonably believe you have breached this Agreement, where required by law, or to protect the App, other users or third parties. You may stop using the App at any time and may <TextLink href="/support/">request closure of your account</TextLink>. Provisions that by their nature should survive termination – including those on intellectual property, disclaimers, limitation of liability, indemnity and governing law – will survive.</P>
    ),
  },
  {
    id: "changes",
    title: "Changes to the App and these Terms",
    body: (
      <P>We may update these Terms from time to time. When we make material changes, we will post the revised Terms within the App and update the “Last updated” date. Your continued use of the App after the changes take effect constitutes your acceptance of the revised Terms. If you do not agree to the changes, you should stop using the App.</P>
    ),
  },
  {
    id: "grievance",
    title: "Grievance Redressal",
    body: (
      <>
        <P>In accordance with applicable law, the contact details of our Grievance Officer are set out below. The Grievance Officer can be contacted for any complaints regarding the App, Content or User Content, including requests to remove unlawful content.</P>
        <ContactCard
          role="Grievance Officer"
          name="Srilekha K"
          email="admin@dridhatechnologies.com"
          address="Dridha Technologies Private Limited, Madhapur, Hyderabad, Telangana – 500081, India"
        />
        <P className="mt-[16px]">We will acknowledge complaints and seek to resolve them within the timelines prescribed under applicable law.</P>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law and Dispute Resolution",
    toc: "Governing Law & Dispute Resolution",
    body: (
      <P>This Agreement is governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with this Agreement will be referred to and finally resolved by arbitration by a sole arbitrator under the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration will be Hyderabad, Telangana, and the proceedings will be conducted in English. Subject to the foregoing, the courts at Hyderabad, Telangana will have exclusive jurisdiction, and nothing in this Section limits any non-waivable rights you may have under applicable consumer-protection law.</P>
    ),
  },
  {
    id: "general",
    title: "General",
    body: (
      <P>If any provision of this Agreement is held to be invalid or unenforceable, that provision will be limited or removed to the minimum extent necessary, and the remaining provisions will remain in full force and effect. Our failure to enforce any provision is not a waiver of our right to do so later. You may not assign or transfer your rights under this Agreement without our prior written consent; we may assign our rights and obligations, including in connection with a merger, acquisition or sale of business. Neither party is liable for any failure or delay caused by events beyond its reasonable control. This Agreement, together with the Privacy Policy, constitutes the entire agreement between you and us regarding the App and supersedes any prior agreements on its subject matter.</P>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <P>For any questions about these Terms, please contact us at <TextLink href="mailto:admin@dridhatechnologies.com">admin@dridhatechnologies.com</TextLink>.</P>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <PageJsonLd page="termsandconditions" />
      <LegalMain>
        <LegalHero>
          <HeroEyebrow mark="LEGAL.">THE FINE PRINT, MADE CLEAR</HeroEyebrow>
          <HeroTitle accent="Conditions">Terms &amp;</HeroTitle>
          <HeroSub>dailymattr — News &amp; Infotainment App · Dridha Technologies Private Limited</HeroSub>
          <HeroUpdated>Last updated · 15 July 2026</HeroUpdated>
        </LegalHero>
        <LegalBody
          sections={SECTIONS}
          crosslink={{
            title: "Privacy Policy",
            text: "See how dailymattr collects, uses and protects your data.",
            href: "/privacypolicy/",
            cta: "Read the Policy",
          }}
        />
        <SiteFooter parentLine={false} />
      </LegalMain>
    </>
  );
}
