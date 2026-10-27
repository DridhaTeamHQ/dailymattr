/* Head strings of the /news error pages. Kept free of imports: the 500 page
 * is a client component and reads them too. */

export const ERROR_TITLES = {
  404: "Not found — dailymattr",
  410: "Story no longer available — dailymattr",
  500: "Something went wrong — dailymattr",
} as const;

export const ERROR_DESCRIPTION = "This story is not available.";

export const ERROR_ROBOTS = "noindex,follow";
