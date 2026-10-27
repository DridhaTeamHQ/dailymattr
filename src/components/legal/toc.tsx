"use client";

import { useEffect, useState } from "react";
import { revealClass, useReveal } from "./reveal";

export type TocItem = { id: string; label: string };

/** Id of the watched section currently crossing the reading line (a band
 * 20–30% down the viewport), or null before any has. */
function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(" ");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const id of key.split(" ")) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [key]);

  return active;
}

/* The sticky "On this page" rail (was .legal-toc). `spy` lists every
 * section of the article, including an unnumbered intro that has no link:
 * while it is in view no link is highlighted. */
export function LegalToc({ items, spy }: { items: TocItem[]; spy: string[] }) {
  const ref = useReveal();
  const active = useScrollSpy(spy);

  return (
    <aside
      ref={ref}
      aria-label="Contents"
      className={`sticky top-[calc(var(--spacing-nav)+28px)] max-h-[calc(100vh_-_var(--spacing-nav)_-_56px)] self-start overflow-y-auto [scrollbar-width:thin] mobile:static mobile:max-h-none mobile:rounded-[18px] mobile:border mobile:border-solid mobile:border-[#ececf0] mobile:p-[18px] ${revealClass}`}
    >
      <h4 className="mb-[16px] text-[12px] font-semibold tracking-[1.5px] text-[#97979e] uppercase">On this page</h4>
      {items.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          data-on={active === id ? "" : undefined}
          className="block border-l-2 border-solid border-mist px-[12px] py-[7px] text-[13px] leading-[1.4] font-medium text-ink-soft [transition:color_.25s_ease,border-color_.25s_ease,background_.25s_ease] hover:bg-[#f6f6f8] not-data-on:hover:text-ink data-on:border-brand data-on:font-semibold data-on:text-brand mobile:border-l-0 mobile:px-[4px] mobile:py-[6px]"
        >
          {label}
        </a>
      ))}
    </aside>
  );
}
