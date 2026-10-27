import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { pill } from "@/components/site/pill";

export const metadata: Metadata = {
  title: "Page not found — dailymattr",
};  

/* any URL no route answers (Next adds noindex to 404 responses) */
export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="grid min-h-screen place-items-center px-4 pt-nav text-center">
        <div>
          <h1 className="text-[32px] font-bold tracking-[-.5px]">Page not found</h1>
          <p className="mt-3 text-[16px] text-ink-soft">This link doesn&apos;t lead anywhere on dailymattr.</p>
          <Link href="/" className={pill({ variant: "brand", className: "mt-6" })}>
            Go to dailymattr
          </Link>
        </div>
      </main>
    </>
  );
}
