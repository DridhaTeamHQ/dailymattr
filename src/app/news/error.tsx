"use client";

import { useEffect } from "react";
import { ErrorPanel } from "@/components/news/error-panel";
import { ERROR_DESCRIPTION, ERROR_ROBOTS, ERROR_TITLES } from "@/lib/news/errors";

/* A query that failed or timed out: the branded 500 (a page that is already
 * cached keeps being served instead — ISR only replaces it on success). An
 * error boundary can't export metadata, so the head tags are rendered here
 * and React hoists them. */
export default function NewsError({ error }: { error: unknown }) {
  useEffect(() => {
    console.error("[news]", error);
  }, [error]);

  return (
    <>
      <title>{ERROR_TITLES[500]}</title>
      <meta name="description" content={ERROR_DESCRIPTION} />
      <meta name="robots" content={ERROR_ROBOTS} />
      <ErrorPanel status={500} />
    </>
  );
}
