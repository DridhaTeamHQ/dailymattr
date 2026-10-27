import { safeJsonLd } from "@/lib/html";
import { HEADS, type PageKey } from "@/lib/page-heads";

/* JSON-LD from objects (escaped for a <script> body) */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const graphs = Array.isArray(data) ? data : [data];
  return graphs.map((g, i) => (
    <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(g) }} />
  ));
}

/* a marketing page's JSON-LD, verbatim from its original <head> */
export function PageJsonLd({ page }: { page: PageKey }) {
  return HEADS[page].jsonLd.map((ld, i) => (
    <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
  ));
}
