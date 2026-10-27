"use client";

import Form from "next/form";
import Link from "next/link";
import { useEffect, useRef } from "react";

/* "Filter by date": picking a day submits the form (GET ?date=YYYY-MM-DD).
 * It listens for the input's native change event, as the original inline
 * onchange did — React's onChange fires on every input event, which for a
 * typed date means every keystroke. next/form turns the submit into an
 * in-app navigation; with JavaScript off it is a plain GET form, and the
 * hidden Filter button keeps it submittable. */
export function DateFilter({ path, date, max }: { path: string; date: string | null; max: string }) {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = input.current;
    if (!el) return;
    const submit = () => el.form?.requestSubmit();
    el.addEventListener("change", submit);
    return () => el.removeEventListener("change", submit);
  }, [date]);

  return (
    <Form action={path} className="inline-flex shrink-0 items-center gap-2 phone:w-full">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#e0e0e6] bg-white py-1.5 pr-3.5 pl-3 shadow-[0_1px_3px_rgba(0,0,0,.04)] transition-[border-color,box-shadow] duration-[180ms] ease-[ease] focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(57,121,255,.14)] hover:border-brand hover:shadow-[0_0_0_3px_rgba(57,121,255,.14)] phone:flex-1 phone:justify-between">
        <svg
          className="block shrink-0 text-ink-soft"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <label htmlFor="news-date-input" className="sr-only">
          Filter by date
        </label>
        <input
          ref={input}
          key={date ?? ""}
          type="date"
          id="news-date-input"
          name="date"
          className="cursor-pointer border-none bg-transparent px-0 py-0.5 text-[13px] font-semibold text-ink outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:transition-opacity [&::-webkit-calendar-picker-indicator]:duration-150 [&::-webkit-calendar-picker-indicator]:ease-[ease] [&::-webkit-calendar-picker-indicator:hover]:opacity-100"
          defaultValue={date ?? ""}
          max={max}
          title="Select date to filter news"
        />
        <button type="submit" className="hidden" aria-label="Apply date filter">
          Filter
        </button>
      </div>
      {date && (
        <Link
          href={path}
          className="inline-flex items-center gap-1 rounded-full bg-[#f3f3f6] px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft no-underline transition-[background,color] duration-150 ease-[ease] hover:bg-[#e7e7ec] hover:text-ink"
          title="Clear date filter"
          aria-label="Clear date filter"
        >
          ✕ Clear
        </Link>
      )}
    </Form>
  );
}
