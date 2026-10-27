import type { NextRequest } from "next/server";
import { moved } from "@/lib/cache";
import { FEED_PATH, parseSlugId, storyPath, topicPath } from "./routes";
import { fetchStory, fetchTopic } from "./seo-data";

/* One URL per News Studio story and topic: any other spelling of
 * /news-studio/<slug>-<id> (an old or wrong slug) gets a 301 to the
 * canonical, keeping the visitor's query string, and a path with no id goes
 * to the feed. The pages then only ever render their canonical URL.
 * Returns undefined to let the page answer. */

/* the drawer pages; everything else at /news-studio/<segment> is a story */
const PAGES = new Set(["subscribe", "login", "profile"]);

/* canonical path by id, so a busy story costs one lookup per instance per
 * ten minutes rather than one per view */
const TTL_MS = 10 * 60e3;
const known = new Map<string, { path: string | null; until: number }>();

async function canonicalFor(kind: "story" | "topic", id: string): Promise<string | null> {
  const key = `${kind}:${id}`;
  const hit = known.get(key);
  if (hit && hit.until > Date.now()) return hit.path;
  let path: string | null = null;
  if (kind === "topic") {
    const found = await fetchTopic(id);
    path = found ? topicPath(found) : null;
  } else {
    const found = await fetchStory(id);
    path = found ? storyPath(found) : null;
  }
  if (known.size > 5000) known.clear();
  known.set(key, { path, until: Date.now() + TTL_MS });
  return path;
}

/* proxy responses need an absolute Location */
const movedTo = (request: NextRequest, path: string) => moved(new URL(path, request.url).href);

export async function studioProxy(request: NextRequest): Promise<Response | undefined> {
  const { pathname, search } = request.nextUrl;
  const m = /^\/news-studio\/(?:(topic)\/)?([^/]+)$/.exec(pathname);
  /* files (favicon, figma art), sitemaps and the drawer pages pass through */
  if (!m || m[2].includes(".") || (!m[1] && PAGES.has(m[2]))) return undefined;
  const kind = m[1] ? "topic" : "story";
  const parsed = parseSlugId(m[2]);
  /* no id: an old category link or a typo — the feed */
  if (!parsed) return movedTo(request, FEED_PATH);
  let canonical: string | null;
  try {
    canonical = await canonicalFor(kind, parsed.id);
  } catch (err) {
    /* lookup failed: let the page answer (its canonical tag still holds) */
    console.error("[news-studio proxy]", err);
    return undefined;
  }
  /* unknown id: the page renders the 404 */
  if (canonical && canonical !== pathname) return movedTo(request, canonical + search);
  return undefined;
}
