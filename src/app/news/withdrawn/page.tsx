import { ErrorPanel } from "@/components/news/error-panel";
import { errorMetadata } from "@/lib/news/seo";

/* The body of the 410 for a withdrawn story. The proxy fetches this page
 * (with an internal header) and serves it under the story's URL with status
 * 410; requested any other way, the proxy answers 404. */
export const dynamic = "force-static";

export const metadata = errorMetadata(410);

export default function WithdrawnStory() {
  return <ErrorPanel status={410} />;
}
