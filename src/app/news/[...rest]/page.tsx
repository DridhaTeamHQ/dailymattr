import { notFound } from "next/navigation";

/* Anything under /news no other route matches. The proxy rewrites every URL
 * that isn't a public /news URL here (lib/news/routing.ts NOT_FOUND_PATH),
 * so the news 404 renders from one cached entry. */
export const dynamic = "force-static";

export default function NewsCatchAll() {
  notFound();
}
