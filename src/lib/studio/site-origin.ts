/* Canonical origin for auth redirects. Local dev keeps its own origin; any
 * production host (including the vercel.app fallback domain) redirects back
 * to the real domain so sign-in never strands readers on a preview URL. */
export const CANONICAL_ORIGIN = "https://www.dailymattr.com";

export function siteOrigin(): string {
  const { hostname, origin } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") return origin;
  return CANONICAL_ORIGIN;
}

/* absolute URL on the canonical origin for a full path ("/news-studio/…") */
export function siteUrl(path = "/"): string {
  return siteOrigin() + (path.startsWith("/") ? path : `/${path}`);
}
