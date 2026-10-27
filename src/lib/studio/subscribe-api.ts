import { PUBLIC_SUPABASE_ANON_KEY as SUPABASE_ANON_KEY } from "./config";

/* Guest newsletter sign-ups: posts to the Supabase `subscribers` edge
 * function (the legacy `subscribers` table). Public values throughout. */
const SUBSCRIBE_URL =
  process.env.NEXT_PUBLIC_NEWS_STUDIO_SUBSCRIBE_URL || "https://ygxdrphajvrbjcaxhvcn.functions.supabase.co/subscribers";

export type SubscribePayload = {
  name?: string;
  email: string;
  rhythm: string;
  send_days?: string[];
  categories: string[];
  source_preference: string;
};

export async function subscribeNewsletter(payload: SubscribePayload): Promise<unknown> {
  const res = await fetch(SUBSCRIBE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action: "subscribe", ...payload }),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data?.error || `Subscription failed (${res.status})`);
  return data; // { ok, created?, existing?, resubscribed? }
}

/* Source mix for the General edition. Must stay in sync with the email
 * agent's _shared/news-categories.ts. */
export const SOURCE_PREFERENCES = [
  { id: "top", label: "Top sources only", desc: "Curated from trusted major publishers." },
  { id: "mixed", label: "Mixed sources", desc: "Balanced mix of national, regional, and niche sources." },
  { id: "wide", label: "Wide coverage", desc: "More sources, more variety, wider viewpoints." },
] as const;

export type SourcePreference = (typeof SOURCE_PREFERENCES)[number]["id"];
