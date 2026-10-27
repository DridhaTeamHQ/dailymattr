import { ErrorPanel } from "@/components/news/error-panel";
import { errorMetadata } from "@/lib/news/seo";

/* any notFound() under /news, and every URL the proxy finds no story or page
 * for (it rewrites them to the [...rest] catch-all). Next adds its own
 * robots noindex to 404 responses too. */
export const metadata = errorMetadata(404);

export default function NewsNotFound() {
  return <ErrorPanel status={404} />;
}
