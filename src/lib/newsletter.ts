/* The Shortly email agent's edge functions behind /newsletter and
 * /unsubscribe. They live on the News Studio Supabase project, so they read
 * its NEXT_PUBLIC_NEWS_STUDIO_* values, defaulting to the same public
 * values the original pages hard-coded. */
const SUPABASE_URL = (process.env.NEXT_PUBLIC_NEWS_STUDIO_SUPABASE_URL || "https://ygxdrphajvrbjcaxhvcn.supabase.co").replace(/\/+$/, "");
const ANON_KEY =
  process.env.NEXT_PUBLIC_NEWS_STUDIO_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlneGRycGhhanZyYmpjYXhodmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDU0MjEsImV4cCI6MjA5NDkyMTQyMX0.odfY4E1DCxjb8kaXOkax4c_VI96QrzhoIW7cF6WMbes";

/* takes the email, the signed token from the email link and an action; it
 * needs no key */
export const UNSUBSCRIBE_URL = `${SUPABASE_URL}/functions/v1/unsubscribe`;

/* What the `subscribers` function says happened:
 *   { created: true }                     brand new, welcome email sent
 *   { existing: true, resubscribed: 1 }   was unsubscribed, switched back on
 *   { existing: true }                    already on the list */
export type SubscribeResult = { created?: boolean; existing?: boolean; resubscribed?: number | boolean; error?: string };

/* action "subscribe" is the function's public path: it validates, upserts
 * into public.subscribers, re-subscribes lapsed readers and sends the
 * branded welcome email */
export async function subscribe({ name, email }: { name: string; email: string }): Promise<SubscribeResult> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/subscribers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({
      action: "subscribe",
      email,
      name: name || undefined,
      rhythm: "daily",
      categories: ["general"],
      source_preference: "mixed",
    }),
  });
  const body = (await response.json().catch(() => ({}))) as SubscribeResult;
  if (!response.ok || body.error) {
    throw new Error(body.error || "We could not subscribe you just now. Please try again.");
  }
  return body;
}
