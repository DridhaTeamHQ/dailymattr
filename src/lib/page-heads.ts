/* Head payload of each marketing page, copied verbatim from the original
 * static HTML: title, meta, canonical and JSON-LD. pageMetadata() turns it
 * into Next metadata; <PageJsonLd> renders the JSON-LD. */
export type PageKey =
  | "home" | "about" | "author" | "editorialguidelines" | "privacypolicy"
  | "termsandconditions" | "newsletter" | "support" | "unsubscribe";

type Head = {
  title: string;
  meta: Record<string, string>;
  property: Record<string, string>;
  canonical: string | null;
  jsonLd: string[];
};

export const HEADS: Record<PageKey, Head> = {
  "home": {
    "title": "dailymattr | Short News, Video & Audio Explainers",
    "meta": {
      "description": "Discover 100 fact-checked stories a day with dailymattr. Read short news, watch video explainers and listen to audio. Free on Android and iOS.",
      "robots": "index,follow,max-image-preview:large",
      "twitter:card": "summary_large_image",
      "twitter:title": "dailymattr | Short News, Video & Audio Explainers",
      "twitter:description": "Discover 100 fact-checked stories a day with dailymattr. Read short news, watch video explainers and listen to audio. Free on Android and iOS.",
      "twitter:image": "https://www.dailymattr.com/assets/og-default.jpg"
    },
    "property": {
      "og:type": "website",
      "og:site_name": "dailymattr",
      "og:title": "dailymattr | Short News, Video & Audio Explainers",
      "og:description": "Discover 100 fact-checked stories a day with dailymattr. Read short news, watch video explainers and listen to audio. Free on Android and iOS.",
      "og:url": "https://www.dailymattr.com/",
      "og:image": "https://www.dailymattr.com/assets/og-default.jpg",
      "og:image:width": "1200",
      "og:image:height": "630"
    },
    "canonical": "https://www.dailymattr.com/",
    "jsonLd": [
      "{\"@context\":\"https://schema.org\",\"@graph\":[{\"@type\":\"NewsMediaOrganization\",\"@id\":\"https://www.dailymattr.com/#organization\",\"name\":\"dailymattr\",\"legalName\":\"Dridha Technologies Private Limited\",\"url\":\"https://www.dailymattr.com/\",\"logo\":{\"@type\":\"ImageObject\",\"url\":\"https://www.dailymattr.com/assets/publisher-logo.png\",\"width\":1560,\"height\":320},\"sameAs\":[\"https://play.google.com/store/apps/details?id=com.dailymattr&pcampaignid=web_share\",\"https://apps.apple.com/in/app/dailymattr/id6791996138\",\"https://www.instagram.com/dailymattr/\",\"https://youtube.com/@dailymattr\",\"https://x.com/dailymattr_news\",\"https://www.linkedin.com/company/dailymattr/\",\"https://www.facebook.com/profile.php?id=61595620943543\"],\"contactPoint\":{\"@type\":\"ContactPoint\",\"contactType\":\"customer support\",\"email\":\"support@dailymattr.com\"},\"alternateName\":\"Daily Mattr\",\"publishingPrinciples\":\"https://www.dailymattr.com/editorialguidelines/\"},{\"@type\":\"WebSite\",\"@id\":\"https://www.dailymattr.com/#website\",\"url\":\"https://www.dailymattr.com/\",\"name\":\"dailymattr\",\"inLanguage\":\"en-IN\",\"publisher\":{\"@id\":\"https://www.dailymattr.com/#organization\"},\"alternateName\":\"Daily Mattr\"},{\"@type\":\"MobileApplication\",\"name\":\"dailymattr\",\"operatingSystem\":\"Android\",\"applicationCategory\":\"NewsApplication\",\"installUrl\":\"https://play.google.com/store/apps/details?id=com.dailymattr&pcampaignid=web_share\",\"offers\":{\"@type\":\"Offer\",\"price\":\"0\",\"priceCurrency\":\"INR\"},\"publisher\":{\"@id\":\"https://www.dailymattr.com/#organization\"}},{\"@type\":\"MobileApplication\",\"name\":\"dailymattr\",\"operatingSystem\":\"iOS\",\"applicationCategory\":\"NewsApplication\",\"installUrl\":\"https://apps.apple.com/in/app/dailymattr/id6791996138\",\"offers\":{\"@type\":\"Offer\",\"price\":\"0\",\"priceCurrency\":\"INR\"},\"publisher\":{\"@id\":\"https://www.dailymattr.com/#organization\"}},{\"@type\":\"WebPage\",\"@id\":\"https://www.dailymattr.com/#webpage\",\"url\":\"https://www.dailymattr.com/\",\"name\":\"dailymattr | Short News, Video & Audio Explainers\",\"description\":\"Discover 100 fact-checked stories a day with dailymattr. Read short news, watch video explainers and listen to audio. Free on Android and iOS.\",\"inLanguage\":\"en-IN\",\"isPartOf\":{\"@id\":\"https://www.dailymattr.com/#website\"},\"publisher\":{\"@id\":\"https://www.dailymattr.com/#organization\"}}]}"
    ]
  },
  "about": {
    "title": "About Us - dailymattr",
    "meta": {
      "description": "dailymattr is a finishable daily news briefing built for urban India: the 100 stories that matter each day, fact-checked and in clean, swipeable cards.",
      "robots": "index,follow,max-image-preview:large",
      "twitter:card": "summary_large_image",
      "twitter:title": "About Us - dailymattr",
      "twitter:description": "dailymattr is a finishable daily news briefing built for urban India: the 100 stories that matter each day, fact-checked and in clean, swipeable cards.",
      "twitter:image": "https://www.dailymattr.com/assets/og-default.jpg"
    },
    "property": {
      "og:type": "website",
      "og:site_name": "dailymattr",
      "og:title": "About Us - dailymattr",
      "og:description": "dailymattr is a finishable daily news briefing built for urban India: the 100 stories that matter each day, fact-checked and in clean, swipeable cards.",
      "og:url": "https://www.dailymattr.com/about/",
      "og:image": "https://www.dailymattr.com/assets/og-default.jpg",
      "og:image:width": "1200",
      "og:image:height": "630"
    },
    "canonical": "https://www.dailymattr.com/about/",
    "jsonLd": [
      "{\"@context\":\"https://schema.org\",\"@graph\":[{\"@type\":\"AboutPage\",\"@id\":\"https://www.dailymattr.com/about/\",\"url\":\"https://www.dailymattr.com/about/\",\"name\":\"About Us - dailymattr\",\"description\":\"dailymattr is a finishable daily news briefing built for urban India: the 100 stories that matter each day, fact-checked and in clean, swipeable cards.\",\"inLanguage\":\"en-IN\",\"isPartOf\":{\"@id\":\"https://www.dailymattr.com/#website\"},\"publisher\":{\"@id\":\"https://www.dailymattr.com/#organization\"},\"about\":{\"@id\":\"https://www.dailymattr.com/#organization\"}},{\"@type\":\"BreadcrumbList\",\"itemListElement\":[{\"@type\":\"ListItem\",\"position\":1,\"name\":\"Home\",\"item\":\"https://www.dailymattr.com/\"},{\"@type\":\"ListItem\",\"position\":2,\"name\":\"About Us\",\"item\":\"https://www.dailymattr.com/about/\"}]}]}"
    ]
  },
  "author": {
    "title": "dailymattr Editorial Team: News & Editorial Standards",
    "meta": {
      "description": "Meet the dailymattr Editorial Team. Learn how we research, verify and publish news, follow editorial standards, and handle corrections and reader feedback.",
      "robots": "index,follow,max-image-preview:large",
      "twitter:card": "summary_large_image",
      "twitter:title": "dailymattr Editorial Team: News & Editorial Standards",
      "twitter:description": "Meet the dailymattr Editorial Team. Learn how we research, verify and publish news, follow editorial standards, and handle corrections and reader feedback.",
      "twitter:image": "https://www.dailymattr.com/assets/og-default.jpg"
    },
    "property": {
      "og:type": "profile",
      "og:site_name": "dailymattr",
      "og:title": "dailymattr Editorial Team: News & Editorial Standards",
      "og:description": "Meet the dailymattr Editorial Team. Learn how we research, verify and publish news, follow editorial standards, and handle corrections and reader feedback.",
      "og:url": "https://www.dailymattr.com/author/dailymattr-editorial-team/",
      "og:image": "https://www.dailymattr.com/assets/og-default.jpg",
      "og:image:width": "1200",
      "og:image:height": "630"
    },
    "canonical": "https://www.dailymattr.com/author/dailymattr-editorial-team/",
    "jsonLd": [
      "{\"@context\":\"https://schema.org\",\"@graph\":[{\"@type\":\"ProfilePage\",\"@id\":\"https://www.dailymattr.com/author/dailymattr-editorial-team/\",\"url\":\"https://www.dailymattr.com/author/dailymattr-editorial-team/\",\"name\":\"dailymattr Editorial Team: News & Editorial Standards\",\"description\":\"Meet the dailymattr Editorial Team. Learn how we research, verify and publish news, follow editorial standards, and handle corrections and reader feedback.\",\"inLanguage\":\"en-IN\",\"isPartOf\":{\"@id\":\"https://www.dailymattr.com/#website\"},\"publisher\":{\"@id\":\"https://www.dailymattr.com/#organization\"},\"mainEntity\":{\"@id\":\"https://www.dailymattr.com/author/dailymattr-editorial-team/#team\"}},{\"@type\":\"Organization\",\"@id\":\"https://www.dailymattr.com/author/dailymattr-editorial-team/#team\",\"name\":\"dailymattr Editorial Team\",\"url\":\"https://www.dailymattr.com/author/dailymattr-editorial-team/\",\"parentOrganization\":{\"@id\":\"https://www.dailymattr.com/#organization\"},\"publishingPrinciples\":\"https://www.dailymattr.com/editorialguidelines/\",\"email\":\"team@dailymattr.com\"},{\"@type\":\"BreadcrumbList\",\"itemListElement\":[{\"@type\":\"ListItem\",\"position\":1,\"name\":\"Home\",\"item\":\"https://www.dailymattr.com/\"},{\"@type\":\"ListItem\",\"position\":2,\"name\":\"Editorial Team\",\"item\":\"https://www.dailymattr.com/author/dailymattr-editorial-team/\"}]}]}"
    ]
  },
  "editorialguidelines": {
    "title": "Editorial Guidelines - dailymattr",
    "meta": {
      "description": "Editorial Guidelines for dailymattr, the news & infotainment app by Dridha Technologies Private Limited — how we select, produce, verify and present editorial content.",
      "robots": "index,follow,max-image-preview:large",
      "twitter:card": "summary_large_image",
      "twitter:title": "Editorial Guidelines - dailymattr",
      "twitter:description": "Editorial Guidelines for dailymattr, the news & infotainment app by Dridha Technologies Private Limited — how we select, produce, verify and present editorial content.",
      "twitter:image": "https://www.dailymattr.com/assets/og-default.jpg"
    },
    "property": {
      "og:type": "website",
      "og:site_name": "dailymattr",
      "og:title": "Editorial Guidelines - dailymattr",
      "og:description": "Editorial Guidelines for dailymattr, the news & infotainment app by Dridha Technologies Private Limited — how we select, produce, verify and present editorial content.",
      "og:url": "https://www.dailymattr.com/editorialguidelines/",
      "og:image": "https://www.dailymattr.com/assets/og-default.jpg",
      "og:image:width": "1200",
      "og:image:height": "630"
    },
    "canonical": "https://www.dailymattr.com/editorialguidelines/",
    "jsonLd": [
      "{\"@context\":\"https://schema.org\",\"@graph\":[{\"@type\":\"WebPage\",\"@id\":\"https://www.dailymattr.com/editorialguidelines/\",\"url\":\"https://www.dailymattr.com/editorialguidelines/\",\"name\":\"Editorial Guidelines - dailymattr\",\"description\":\"Editorial Guidelines for dailymattr, the news & infotainment app by Dridha Technologies Private Limited — how we select, produce, verify and present editorial content.\",\"inLanguage\":\"en-IN\",\"isPartOf\":{\"@id\":\"https://www.dailymattr.com/#website\"},\"publisher\":{\"@id\":\"https://www.dailymattr.com/#organization\"}},{\"@type\":\"BreadcrumbList\",\"itemListElement\":[{\"@type\":\"ListItem\",\"position\":1,\"name\":\"Home\",\"item\":\"https://www.dailymattr.com/\"},{\"@type\":\"ListItem\",\"position\":2,\"name\":\"Editorial Guidelines\",\"item\":\"https://www.dailymattr.com/editorialguidelines/\"}]}]}"
    ]
  },
  "privacypolicy": {
    "title": "Privacy Policy — dailymattr",
    "meta": {
      "description": "Privacy Policy for dailymattr, the news & infotainment app by Dridha Technologies Private Limited.",
      "robots": "index,follow,max-image-preview:large",
      "twitter:card": "summary_large_image",
      "twitter:title": "Privacy Policy — dailymattr",
      "twitter:description": "Privacy Policy for dailymattr, the news & infotainment app by Dridha Technologies Private Limited.",
      "twitter:image": "https://www.dailymattr.com/assets/og-default.jpg"
    },
    "property": {
      "og:type": "website",
      "og:site_name": "dailymattr",
      "og:title": "Privacy Policy — dailymattr",
      "og:description": "Privacy Policy for dailymattr, the news & infotainment app by Dridha Technologies Private Limited.",
      "og:url": "https://www.dailymattr.com/privacypolicy/",
      "og:image": "https://www.dailymattr.com/assets/og-default.jpg",
      "og:image:width": "1200",
      "og:image:height": "630"
    },
    "canonical": "https://www.dailymattr.com/privacypolicy/",
    "jsonLd": [
      "{\"@context\":\"https://schema.org\",\"@graph\":[{\"@type\":\"WebPage\",\"@id\":\"https://www.dailymattr.com/privacypolicy/\",\"url\":\"https://www.dailymattr.com/privacypolicy/\",\"name\":\"Privacy Policy — dailymattr\",\"description\":\"Privacy Policy for dailymattr, the news & infotainment app by Dridha Technologies Private Limited.\",\"inLanguage\":\"en-IN\",\"isPartOf\":{\"@id\":\"https://www.dailymattr.com/#website\"},\"publisher\":{\"@id\":\"https://www.dailymattr.com/#organization\"}},{\"@type\":\"BreadcrumbList\",\"itemListElement\":[{\"@type\":\"ListItem\",\"position\":1,\"name\":\"Home\",\"item\":\"https://www.dailymattr.com/\"},{\"@type\":\"ListItem\",\"position\":2,\"name\":\"Privacy Policy\",\"item\":\"https://www.dailymattr.com/privacypolicy/\"}]}]}"
    ]
  },
  "termsandconditions": {
    "title": "Terms & Conditions — dailymattr",
    "meta": {
      "description": "Terms and Conditions of Use for dailymattr, the news & infotainment app by Dridha Technologies Private Limited.",
      "robots": "index,follow,max-image-preview:large",
      "twitter:card": "summary_large_image",
      "twitter:title": "Terms & Conditions — dailymattr",
      "twitter:description": "Terms and Conditions of Use for dailymattr, the news & infotainment app by Dridha Technologies Private Limited.",
      "twitter:image": "https://www.dailymattr.com/assets/og-default.jpg"
    },
    "property": {
      "og:type": "website",
      "og:site_name": "dailymattr",
      "og:title": "Terms & Conditions — dailymattr",
      "og:description": "Terms and Conditions of Use for dailymattr, the news & infotainment app by Dridha Technologies Private Limited.",
      "og:url": "https://www.dailymattr.com/termsandconditions/",
      "og:image": "https://www.dailymattr.com/assets/og-default.jpg",
      "og:image:width": "1200",
      "og:image:height": "630"
    },
    "canonical": "https://www.dailymattr.com/termsandconditions/",
    "jsonLd": [
      "{\"@context\":\"https://schema.org\",\"@graph\":[{\"@type\":\"WebPage\",\"@id\":\"https://www.dailymattr.com/termsandconditions/\",\"url\":\"https://www.dailymattr.com/termsandconditions/\",\"name\":\"Terms & Conditions — dailymattr\",\"description\":\"Terms and Conditions of Use for dailymattr, the news & infotainment app by Dridha Technologies Private Limited.\",\"inLanguage\":\"en-IN\",\"isPartOf\":{\"@id\":\"https://www.dailymattr.com/#website\"},\"publisher\":{\"@id\":\"https://www.dailymattr.com/#organization\"}},{\"@type\":\"BreadcrumbList\",\"itemListElement\":[{\"@type\":\"ListItem\",\"position\":1,\"name\":\"Home\",\"item\":\"https://www.dailymattr.com/\"},{\"@type\":\"ListItem\",\"position\":2,\"name\":\"Terms & Conditions\",\"item\":\"https://www.dailymattr.com/termsandconditions/\"}]}]}"
    ]
  },
  "newsletter": {
    "title": "Newsletter — dailymattr",
    "meta": {
      "description": "Subscribe to the dailymattr newsletter — the day's news, minus the noise. Five stories that actually mattr, every morning.",
      "robots": "index,follow,max-image-preview:large",
      "twitter:card": "summary_large_image",
      "twitter:title": "Newsletter — dailymattr",
      "twitter:description": "Subscribe to the dailymattr newsletter — the day's news, minus the noise. Five stories that actually mattr, every morning.",
      "twitter:image": "https://www.dailymattr.com/assets/og-default.jpg"
    },
    "property": {
      "og:type": "website",
      "og:site_name": "dailymattr",
      "og:title": "Newsletter — dailymattr",
      "og:description": "Subscribe to the dailymattr newsletter — the day's news, minus the noise. Five stories that actually mattr, every morning.",
      "og:url": "https://www.dailymattr.com/newsletter/",
      "og:image": "https://www.dailymattr.com/assets/og-default.jpg",
      "og:image:width": "1200",
      "og:image:height": "630"
    },
    "canonical": "https://www.dailymattr.com/newsletter/",
    "jsonLd": [
      "{\"@context\":\"https://schema.org\",\"@graph\":[{\"@type\":\"WebPage\",\"@id\":\"https://www.dailymattr.com/newsletter/\",\"url\":\"https://www.dailymattr.com/newsletter/\",\"name\":\"Newsletter — dailymattr\",\"description\":\"Subscribe to the dailymattr newsletter — the day's news, minus the noise. Five stories that actually mattr, every morning.\",\"inLanguage\":\"en-IN\",\"isPartOf\":{\"@id\":\"https://www.dailymattr.com/#website\"},\"publisher\":{\"@id\":\"https://www.dailymattr.com/#organization\"}},{\"@type\":\"BreadcrumbList\",\"itemListElement\":[{\"@type\":\"ListItem\",\"position\":1,\"name\":\"Home\",\"item\":\"https://www.dailymattr.com/\"},{\"@type\":\"ListItem\",\"position\":2,\"name\":\"Newsletter\",\"item\":\"https://www.dailymattr.com/newsletter/\"}]}]}"
    ]
  },
  "support": {
    "title": "Support — dailymattr",
    "meta": {
      "description": "Get support for dailymattr from the Dridha Technologies team.",
      "robots": "index,follow,max-image-preview:large",
      "twitter:card": "summary_large_image",
      "twitter:title": "Support — dailymattr",
      "twitter:description": "Get support for dailymattr from the Dridha Technologies team.",
      "twitter:image": "https://www.dailymattr.com/assets/og-default.jpg"
    },
    "property": {
      "og:type": "website",
      "og:site_name": "dailymattr",
      "og:title": "Support — dailymattr",
      "og:description": "Get support for dailymattr from the Dridha Technologies team.",
      "og:url": "https://www.dailymattr.com/support/",
      "og:image": "https://www.dailymattr.com/assets/og-default.jpg",
      "og:image:width": "1200",
      "og:image:height": "630"
    },
    "canonical": "https://www.dailymattr.com/support/",
    "jsonLd": [
      "{\"@context\":\"https://schema.org\",\"@graph\":[{\"@type\":\"WebPage\",\"@id\":\"https://www.dailymattr.com/support/\",\"url\":\"https://www.dailymattr.com/support/\",\"name\":\"Support — dailymattr\",\"description\":\"Get support for dailymattr from the Dridha Technologies team.\",\"inLanguage\":\"en-IN\",\"isPartOf\":{\"@id\":\"https://www.dailymattr.com/#website\"},\"publisher\":{\"@id\":\"https://www.dailymattr.com/#organization\"}},{\"@type\":\"BreadcrumbList\",\"itemListElement\":[{\"@type\":\"ListItem\",\"position\":1,\"name\":\"Home\",\"item\":\"https://www.dailymattr.com/\"},{\"@type\":\"ListItem\",\"position\":2,\"name\":\"Support\",\"item\":\"https://www.dailymattr.com/support/\"}]}]}"
    ]
  },
  "unsubscribe": {
    "title": "Manage your subscription — dailymattr",
    "meta": {
      "robots": "noindex",
      "referrer": "no-referrer"
    },
    "property": {},
    "canonical": null,
    "jsonLd": []
  }
};
