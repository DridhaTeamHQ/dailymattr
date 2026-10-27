import { SiteFooter } from "@/components/site/site-footer";
import { NotFoundView } from "@/components/studio/not-found-view";

/* an unknown or unpublished story/topic: 404 + noindex (Next adds the
 * robots tag); the title and description come from the page's metadata */
export default function NewsStudioNotFound() {
  return <NotFoundView footer={<SiteFooter />} />;
}
