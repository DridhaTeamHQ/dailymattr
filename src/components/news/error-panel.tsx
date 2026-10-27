import Link from "next/link";

const COPY = {
  404: { h: "Story not found", p: "This link doesn't match any story we've published." },
  410: { h: "This story is no longer available", p: "It was taken down after publication." },
  500: { h: "Something went wrong", p: "Please try again in a moment." },
} as const;

export type ErrorStatus = keyof typeof COPY;

/* the body of the /news 404, 410 and 500 pages */
export function ErrorPanel({ status }: { status: ErrorStatus }) {
  const c = COPY[status];
  return (
    <div className="mx-auto w-[min(1120px,100%_-_40px)] py-[60px] text-ink-soft">
      <h1 className="mb-3 text-[30px] font-bold text-ink">{c.h}</h1>
      <p>
        {`${c.p} Head back to `}
        <Link href="/news/" className="text-brand">
          the latest news
        </Link>
        {" or the "}
        <Link href="/" className="text-brand">
          home page
        </Link>
        .
      </p>
    </div>
  );
}
