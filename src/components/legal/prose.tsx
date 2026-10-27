import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Typography of the long-form articles (was the `.legal-article …` rules).
 * Size, line height (1.75) and body colour are set once on the <article>
 * (legal-page.tsx) and inherited; these add what each element changes. */

export function P({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return <p className={cn("mb-[14px] last:mb-0", className)} {...props} />;
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-[26px] mb-[10px] text-[16px] font-bold text-ink">{children}</h3>;
}

export function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-bold text-ink">{children}</strong>;
}

/* bulleted list: blue dots instead of the browser markers */
export function List({ children }: { children: ReactNode }) {
  return <ul className="mt-[6px] mb-[16px] list-none">{children}</ul>;
}

export function Item({ children }: { children: ReactNode }) {
  return (
    <li className="relative mb-[10px] pl-[26px] before:absolute before:top-[.62em] before:left-[4px] before:size-[7px] before:rounded-[50%] before:bg-brand before:content-['']">
      {children}
    </li>
  );
}

/* Inline link. Site paths are in-app navigations (next/link); in-page
 * anchors, mailto: and other sites stay plain <a>. */
export function TextLink({ href, newTab = false, children }: { href: string; newTab?: boolean; children: ReactNode }) {
  const className = "font-semibold text-brand hover:underline";
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

/* grey callout box (was .legal-note) */
export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="my-[18px] rounded-[18px] border border-solid border-[#ececf0] bg-[#f6f6f8] px-[22px] py-[18px] text-[14.5px]">
      {children}
    </div>
  );
}

const cardLine = "mb-[8px] text-[14.5px] text-[rgba(255,255,255,.72)] last:mb-0";

/* dark grievance-officer card (was .legal-contact-card) */
export function ContactCard({ role, name, email, address }: { role: string; name: string; email: string; address: string }) {
  return (
    <div className="mt-[18px] rounded-panel bg-[radial-gradient(120%_160%_at_50%_0%,#1c1c1f_0%,var(--color-coal)_65%)] p-[clamp(28px,4vw,44px)] text-white">
      <p className="mb-[18px] text-[12px] font-bold tracking-[2.5px] text-brand-soft uppercase">{role}</p>
      <h3 className="mb-[6px] text-[18px] font-bold text-white">{name}</h3>
      <p className={cardLine}>
        Email:{" "}
        <a href={`mailto:${email}`} className="font-semibold text-white hover:text-brand-soft hover:underline">
          {email}
        </a>
      </p>
      <p className={cardLine}>{`Address: ${address}`}</p>
    </div>
  );
}
