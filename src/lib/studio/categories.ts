import type { CategorySlug } from "./types";

/* The six newsletter categories (the general daily wrap + the five agent
 * topics) the subscribe and account drawers offer. `account` is the
 * newsletter_categories row a signed-in subscription is written against. */

export type AccountType = "news_rhythm" | "category_small_articles";
export type StudioCategory = { slug: CategorySlug; title: string; account: { slug: string; type: AccountType } };

export const LM_CATEGORIES: StudioCategory[] = [
  /* renamed from "General" 2026-07 — the slug stays so links hold */
  { slug: "general", title: "News Studio", account: { slug: "national", type: "news_rhythm" } },
  { slug: "real-estate", title: "Real Estate", account: { slug: "real-estate", type: "category_small_articles" } },
  { slug: "automobile", title: "Automobile", account: { slug: "automobile", type: "category_small_articles" } },
  { slug: "health-wellness", title: "Health & Wellness", account: { slug: "health-wellness", type: "category_small_articles" } },
  { slug: "tech-ai", title: "Tech & AI", account: { slug: "tech-ai", type: "category_small_articles" } },
  { slug: "markets-startups", title: "Markets & Startups", account: { slug: "markets-startups", type: "category_small_articles" } },
];

export const lmCategoryBySlug = (slug: string) => LM_CATEGORIES.find((c) => c.slug === slug) || null;
