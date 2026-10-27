import { ORIGIN, SITE_NAME, PUBLISHER_LOGO, PLAY_URL, APP_STORE_URL, LEGAL_NAME, SOCIAL_URLS } from "./site";

/* schema.org entities shared by /news and News Studio JSON-LD */
export const publisher = {
  "@type": "NewsMediaOrganization",
  "@id": `${ORIGIN}/#organization`,
  name: SITE_NAME,
  alternateName: "Daily Mattr",
  legalName: LEGAL_NAME,
  url: `${ORIGIN}/`,
  logo: { "@type": "ImageObject", url: PUBLISHER_LOGO.url, width: PUBLISHER_LOGO.width, height: PUBLISHER_LOGO.height },
  sameAs: [...SOCIAL_URLS, PLAY_URL, APP_STORE_URL],
  publishingPrinciples: `${ORIGIN}/editorialguidelines/`,
};

export const website = {
  "@type": "WebSite", "@id": `${ORIGIN}/#website`,
  name: SITE_NAME, alternateName: "Daily Mattr", url: `${ORIGIN}/`,
  inLanguage: "en-IN", publisher: { "@id": publisher["@id"] },
};

export type Crumb = { name: string; path: string };

export function breadcrumbLd(trail: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem", position: i + 1, name: t.name, item: ORIGIN + t.path,
    })),
  };
}
