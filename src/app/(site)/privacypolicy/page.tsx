import type { Metadata } from "next";
import { HeroEyebrow, HeroSub, HeroTitle, HeroUpdated, LegalHero } from "@/components/legal/hero";
import { LegalBody, LegalMain, type LegalSectionData } from "@/components/legal/legal-page";
import { ContactCard, H3, Item, List, Note, P, Strong, TextLink } from "@/components/legal/prose";
import { PageJsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { pageMetadata } from "@/lib/page-meta";

export const metadata: Metadata = pageMetadata("privacypolicy");

const SECTIONS: LegalSectionData[] = [
  {
    id: "who-we-are",
    title: "Who We Are",
    body: (
      <>
        <P>dailymattr (“dailymattr” or the “App”) is a <TextLink href="/">news and infotainment platform</TextLink> owned and operated by <Strong>Dridha Technologies Private Limited</Strong>, a company incorporated under the Companies Act, 2013, with its office at Madhapur, Hyderabad, Telangana, India – 500081 (“we”, “us”, “our” or the “Company”). For the purposes of the Digital Personal Data Protection Act, 2023 (the “DPDP Act”) and the Digital Personal Data Protection Rules, 2025 (the “DPDP Rules”), the Company is the Data Fiduciary for personal data processed through the App.</P>
        <P>This Privacy Policy explains what personal data we collect, why we collect it, how we use, share and protect it, how long we keep it, and the rights available to you. It applies to everyone who uses the App, whether or not you create an account, and should be read together with our <TextLink href="/termsandconditions/">Terms of Use</TextLink>. Words used but not defined here have the meaning given to them in our Terms of Use, the DPDP Act and the DPDP Rules.</P>
      </>
    ),
  },
  {
    id: "consent",
    title: "Consent and Your Choices",
    body: (
      <>
        <P>We process your personal data on the basis of your consent, except where the law permits processing for certain legitimate uses. At or before the point of collection, we provide you with a notice describing the personal data we seek, the purposes for which it will be processed, how you may withdraw your consent, and how you may exercise your rights or make a complaint.</P>
        <P>Your consent is sought through a clear affirmative action. You may withdraw your consent at any time, and doing so will be as easy as giving it. Withdrawal will not affect the lawfulness of processing carried out before withdrawal. If you decline to provide, or withdraw consent to, personal data that is necessary for a feature of the App, we may be unable to provide that feature to you.</P>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: (
      <>
        <H3>3.1 From all users</H3>
        <List>
          <Item><Strong>Approximate location</Strong> – we collect your approximate (not precise) location to show you relevant local news and infotainment content.</Item>
        </List>
        <H3>3.2 When you register and log in</H3>
        <List>
          <Item><Strong>Phone number</Strong> – used to create and secure your account and to verify you at login. Registration is required only if you wish to post comments or use certain features such as the AI Assistant; you can read content without registering.</Item>
        </List>
        <H3>3.3 When you use the AI Assistant</H3>
        <List>
          <Item><Strong>Inputs and outputs</Strong> – the prompts, questions and other inputs you submit to the AI Assistant, together with the responses generated. See <TextLink href="#ai-assistant">Section 6</TextLink> for details.</Item>
        </List>
        <H3>3.4 Technical information</H3>
        <P>We may also process limited technical information necessary to operate, maintain and secure the App, such as basic device and log information. We do not collect categories of personal data beyond those described in this Section 3.</P>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    body: (
      <>
        <P>We use your personal data only for the following purposes:</P>
        <List>
          <Item>to provide, operate, maintain and improve the App and its features, including the AI Assistant, and to present content to you effectively;</Item>
          <Item>to create and secure your account and to enable you to post comments;</Item>
          <Item>to show you relevant local content based on your approximate location;</Item>
          <Item>to communicate with you about the service, including service and transactional messages;</Item>
          <Item>to detect, prevent and address fraud, abuse, technical issues or security incidents; and</Item>
          <Item>to comply with our legal and regulatory obligations.</Item>
        </List>
        <Note>We do <Strong>not</Strong> sell or rent your personal data, and we do not use your personal data to build advertising profiles or to serve you targeted advertising.</Note>
      </>
    ),
  },
  {
    id: "comments",
    title: "Comments and User Content",
    body: (
      <P>If you are a registered user, you may post comments. Your comments, together with your account identifier, are stored by us and may be visible to other users. You are responsible for the content you post and must not include other people’s personal information or any unlawful content. You may edit or delete your own comments at any time, and you may ask us to remove content using the contact details in <TextLink href="#grievance">Section 12</TextLink>. We may remove content or suspend accounts that breach our <TextLink href="/termsandconditions/#user-content">Terms of Use</TextLink> or applicable law.</P>
    ),
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    body: (
      <>
        <P>The App may make available an artificial-intelligence assistant feature (the “AI Assistant”) that you can use to explore, summarise or ask questions about news and infotainment content. The following terms apply when you use it.</P>

        <H3>6.1 Data we process through the AI Assistant</H3>
        <P>When you use the AI Assistant, we process the prompts, questions and other inputs you submit, together with the responses generated, in order to provide, secure and improve the feature. The AI Assistant may be powered in whole or in part by third-party artificial-intelligence service providers acting as our processors. Where this is the case, your inputs may be processed by, and transferred to, such providers in accordance with <TextLink href="#sharing">Section 8 (Sharing and Disclosure)</TextLink> and <TextLink href="#cross-border">Section 9 (Cross-Border Transfers)</TextLink>. We do not use your AI Assistant inputs to serve you targeted advertising.</P>
        <P>You should not submit to the AI Assistant any passwords, financial account details, special-category or sensitive information, or personal data relating to other individuals. You are responsible for the inputs you provide and should not rely on the AI Assistant as a means of storing information.</P>

        <H3>6.2 Acceptable use of the AI Assistant</H3>
        <P>The AI Assistant is provided for lawful, personal and reasonable use in connection with the App. You agree that you will not use the AI Assistant to:</P>
        <List>
          <Item>engage in any unlawful, fraudulent, harmful, harassing, abusive, defamatory or infringing activity;</Item>
          <Item>generate or disseminate misinformation, or content that impersonates any person or entity;</Item>
          <Item>generate content that is obscene, hateful, sexually explicit, or harmful to minors;</Item>
          <Item>attempt to reverse-engineer, extract or copy the underlying models, prompts or training data, or to circumvent any usage limits, content filters or security measures;</Item>
          <Item>access the AI Assistant through automated means such as bots or scrapers, or use it to send spam or bulk or automated content;</Item>
          <Item>overload, disrupt, degrade or impair the AI Assistant or the infrastructure that supports it; or</Item>
          <Item>use the AI Assistant for any purpose other than its intended use, or in a manner that is unnecessary, excessive, or that places an unreasonable burden on our systems.</Item>
        </List>
        <P>We may monitor use of the AI Assistant for security, abuse-prevention and compliance purposes, and we may impose usage limits on, or restrict, suspend or withdraw access to, the AI Assistant (in whole or in part) where we reasonably believe it is being misused or used in breach of this Policy or our <TextLink href="/termsandconditions/#ai-assistant">Terms of Use</TextLink>.</P>

        <H3>6.3 No reliance on AI Assistant outputs</H3>
        <P>The AI Assistant generates responses automatically, and its outputs may be inaccurate, incomplete or out of date. Its outputs do not constitute professional, legal, financial, medical or other advice, and you should not rely on them as such. You are responsible for independently verifying any information before acting on it. The disclaimer in <TextLink href="#disclaimer">Section 17</TextLink> applies equally to AI Assistant outputs.</P>
      </>
    ),
  },
  {
    id: "news-sourcing",
    title: "News Sourcing and Third-Party Links",
    toc: "News Sourcing & Third-Party Links",
    body: (
      <>
        <P>dailymattr curates news and infotainment from <TextLink href="/editorialguidelines/#authorship">published news sources</TextLink>. Where such content refers to identifiable individuals, we process that publicly reported information for the purpose of news curation and dissemination. We do not collect personal data from individuals’ personal social media posts.</P>
        <P>The App may contain links to third-party websites or applications. The inclusion of a link does not imply our endorsement. We do not control and are not responsible for the privacy practices or content of those third parties, and we encourage you to review their privacy policies before sharing your information with them.</P>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Sharing and Disclosure",
    body: (
      <>
        <P>We share your personal data only in the following circumstances:</P>
        <List>
          <Item>with service providers and processors who process data on our behalf – including providers that power the AI Assistant – under a binding contract and appropriate confidentiality and security safeguards;</Item>
          <Item>with regulatory authorities, law enforcement agencies or courts where required by law, or where we believe in good faith that disclosure is necessary to comply with legal process, to enforce our Terms of Use, or to protect the rights, property or safety of the Company, our users or others; and</Item>
          <Item>in connection with a merger, acquisition, reorganisation, financing, or sale of all or part of our business, in which case the recipient will be bound to handle your personal data in a manner consistent with this Privacy Policy.</Item>
        </List>
      </>
    ),
  },
  {
    id: "cross-border",
    title: "Cross-Border Transfers",
    body: (
      <P>Your personal data may be processed or stored on servers located outside India, including by providers that power the AI Assistant. Where personal data is transferred outside India, we do so in accordance with the DPDP Act and the DPDP Rules. Such transfers are permitted to all countries and territories except any that the Central Government specifically restricts by notification.</P>
    ),
  },
  {
    id: "retention",
    title: "Data Retention and Erasure",
    body: (
      <P>We retain your personal data only for as long as it is needed for the purposes set out in this Privacy Policy. We will erase your personal data when the purpose for which it was collected is no longer served – including where you withdraw consent, delete the App, or close your account – unless we are required or permitted to retain it under applicable law. Account-related data is deleted within 180 days of account closure or deletion of the App, except to the extent retention is necessary for legal or regulatory purposes.</P>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    body: (
      <>
        <P>Subject to applicable law, you have the right to:</P>
        <List>
          <Item>access a summary of the personal data we hold about you and how we process it;</Item>
          <Item>seek correction, completion or updating of your personal data;</Item>
          <Item>seek erasure of your personal data where it is no longer required;</Item>
          <Item>withdraw your consent at any time;</Item>
          <Item>nominate another individual to exercise your rights in the event of your death or incapacity; and</Item>
          <Item>a readily available means of grievance redressal.</Item>
        </List>
        <P>To exercise any of these rights, please contact our Grievance Officer using the details in <TextLink href="#grievance">Section 12</TextLink>. We will respond within the timelines required under applicable law. If you are not satisfied with our response, you may have the right to complain to the Data Protection Board of India.</P>
      </>
    ),
  },
  {
    id: "grievance",
    title: "Grievance Officer and Contact",
    body: (
      <>
        <P>If you have any questions, requests or complaints regarding this Privacy Policy or your personal data, please contact:</P>
        <ContactCard
          role="Grievance Officer"
          name="Srilekha K"
          email="admin@dridhatechnologies.com"
          address="Dridha Technologies Private Limited, Madhapur, Hyderabad, Telangana – 500081, India"
        />
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <P>The App is not directed at individuals under the age of 18. By registering, you confirm that you are <TextLink href="/termsandconditions/#eligibility">18 years of age or older</TextLink>. We do not knowingly process the personal data of a child without verifiable consent of a parent or lawful guardian, and we do not undertake tracking or behavioural monitoring of children, direct any targeted advertising at children, or direct the AI Assistant at children. If you believe that a child has provided us with personal data, please contact us using the details above and we will take steps to delete it.</P>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <P>The security of your personal data is important to us. We maintain reasonable physical, technical, managerial and organisational safeguards designed to protect personal data against unauthorised access, alteration, disclosure, loss, misuse or destruction, appropriate to the nature of the data. However, no method of transmission over the internet or method of electronic storage is completely secure. While we work to protect your personal data, we cannot guarantee its absolute security, and any transmission of information is at your own risk. If we become aware of a personal data breach, we will act in accordance with <TextLink href="#breach">Section 15</TextLink>.</P>
    ),
  },
  {
    id: "breach",
    title: "Personal Data Breach",
    body: (
      <P>In the event of a personal data breach, we will notify the Data Protection Board of India and affected users in the manner and within the timelines prescribed under the DPDP Rules. Our notification will describe the nature of the breach, the personal data affected, the measures you may take to protect yourself, and our contact details for any queries.</P>
    ),
  },
  {
    id: "changes",
    title: "Changes to this Privacy Policy",
    body: (
      <P>We may add to, change, update or modify this Privacy Policy from time to time. When we do, we will post the revised version here and notify you of material changes through the App. Your continued use of the App after a change takes effect, together with any fresh consent we may seek, will apply going forward. In all cases, the version of this Privacy Policy in effect at the time personal data is collected governs that collection.</P>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer on Content",
    body: (
      <P>To the maximum extent permitted by law, we make no warranty as to the accuracy, completeness or adequacy of the content available through the App, including AI Assistant outputs, and disclaim liability for errors or omissions in that content. Content is provided on an “as is” basis without warranties of any kind, whether express, implied or statutory. References in the App to any specific commercial product, process or service, or to any trade or corporate name, are for information and convenience only and do not constitute endorsement or recommendation by us.</P>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law and Jurisdiction",
    body: (
      <P>This Privacy Policy is governed by and construed in accordance with the laws of India. Subject to any rights available to you under the DPDP Act and the DPDP Rules, the courts at Hyderabad, Telangana shall have jurisdiction over any dispute arising out of or in connection with this Privacy Policy.</P>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageJsonLd page="privacypolicy" />
      <LegalMain>
        <LegalHero>
          <HeroEyebrow mark="LEGAL.">YOUR DATA, RESPECTED</HeroEyebrow>
          <HeroTitle accent="Policy">Privacy</HeroTitle>
          <HeroSub>dailymattr — News &amp; Infotainment App · Dridha Technologies Private Limited</HeroSub>
          <HeroUpdated>Last updated · 15 July 2026</HeroUpdated>
        </LegalHero>
        <LegalBody
          sections={SECTIONS}
          crosslink={{
            title: "Terms & Conditions of Use",
            text: "Read the agreement that governs your use of dailymattr.",
            href: "/termsandconditions/",
            cta: "Read the Terms",
          }}
        />
        <SiteFooter parentLine={false} />
      </LegalMain>
    </>
  );
}
