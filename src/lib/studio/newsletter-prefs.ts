import { browserDb } from "./supabase";
import type { AccountType } from "./categories";

/* A signed-in reader's newsletter editions (newsletter_subscriptions) and
 * profile. Browser only — every call runs as the signed-in user. */

export type Rhythm = "daily" | "weekly" | "both";
export type SubscriptionRow = {
  id: string;
  user_id: string;
  category_slug: string;
  newsletter_type: AccountType;
  weekday: string | null;
  rhythm: Rhythm | null;
  send_days: string[] | null;
  source_preference: string | null;
  status: string;
};
export type Preferences = {
  profile: { email: string | null; full_name: string | null } | null;
  subscriptions: SubscriptionRow[];
  /* weekday -> category slug (only the topic categories reserve a day) */
  blocked: Record<string, string>;
};

type PgError = { code?: string; message?: string } | null;

function mapError(error: PgError): Error {
  if (error?.code === "23505") {
    if (String(error.message).includes("weekday")) {
      return new Error("That weekday is already used by another category. Pick another day.");
    }
    return new Error("You are already subscribed to this newsletter.");
  }
  return new Error(error?.message || "Something went wrong.");
}

async function currentUser() {
  const { data } = await browserDb().auth.getUser();
  return data?.user ?? null;
}

export async function getMyPreferences(): Promise<Preferences> {
  const db = browserDb();
  const user = await currentUser();
  if (!user) return { profile: null, subscriptions: [], blocked: {} };

  const [{ data: profile }, { data: subs, error }] = await Promise.all([
    db.from("profiles").select("email, full_name").eq("id", user.id).maybeSingle(),
    db.from("newsletter_subscriptions").select("*").eq("user_id", user.id).eq("status", "active"),
  ]);
  if (error) throw mapError(error);

  const subscriptions = (subs ?? []) as SubscriptionRow[];
  const blocked: Record<string, string> = {};
  for (const s of subscriptions) {
    if (s.weekday) blocked[s.weekday] = s.category_slug;
  }
  const meta = user.user_metadata as { full_name?: string } | undefined;
  return {
    profile: (profile as Preferences["profile"]) || { email: user.email ?? null, full_name: meta?.full_name || "" },
    subscriptions,
    blocked,
  };
}

/* make sure a profiles row exists for the signed-in user (pre-trigger accounts) */
export async function ensureProfile(): Promise<void> {
  const user = await currentUser();
  if (!user) return;
  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  await browserDb()
    .from("profiles")
    .upsert(
      { id: user.id, email: user.email, full_name: meta?.full_name || meta?.name || null },
      { onConflict: "id", ignoreDuplicates: true },
    );
}

async function rowForCategory(userId: string, slug: string) {
  const { data } = await browserDb()
    .from("newsletter_subscriptions")
    .select("id, status")
    .eq("user_id", userId)
    .eq("category_slug", slug)
    .order("created_at", { ascending: false })
    .limit(1);
  return ((data ?? []) as { id: string; status: string }[])[0] || null;
}

export type SubscribeOptions = { weekday?: string; rhythm?: Rhythm; send_days?: string[]; source_preference?: string };

/* `category` is a newsletter_categories row. Every edition supports rhythm
 * daily | weekly; weekly editions carry a weekday (required for the topic
 * categories). */
export async function subscribe(category: { slug: string; newsletter_type: AccountType }, opts: SubscribeOptions = {}) {
  const user = await currentUser();
  if (!user) throw new Error("Please sign in to subscribe.");

  const rhythm: Rhythm = opts.rhythm || (category.newsletter_type === "news_rhythm" ? "daily" : "weekly");
  if (category.newsletter_type === "category_small_articles" && (rhythm === "weekly" || rhythm === "both") && !opts.weekday) {
    throw new Error("Choose a weekday for this category.");
  }

  const payload = {
    user_id: user.id,
    category_slug: category.slug,
    newsletter_type: category.newsletter_type,
    weekday: rhythm === "weekly" || rhythm === "both" ? opts.weekday || null : null,
    rhythm,
    send_days: opts.send_days || null,
    source_preference: opts.source_preference || "top",
    status: "active",
    updated_at: new Date().toISOString(),
  };

  const db = browserDb();
  const existing = await rowForCategory(user.id, category.slug);
  const q = existing
    ? db.from("newsletter_subscriptions").update(payload).eq("id", existing.id)
    : db.from("newsletter_subscriptions").insert(payload);
  const { data, error } = await q.select().single();
  if (error) throw mapError(error);
  return data as SubscriptionRow;
}

export async function unsubscribe(categorySlug: string): Promise<void> {
  const user = await currentUser();
  if (!user) throw new Error("Please sign in.");
  const { error } = await browserDb()
    .from("newsletter_subscriptions")
    .update({ status: "unsubscribed", updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("category_slug", categorySlug)
    .eq("status", "active");
  if (error) throw mapError(error);
}

export async function updateProfileName(fullName: string): Promise<void> {
  const user = await currentUser();
  if (!user) throw new Error("Please sign in.");
  const { error } = await browserDb()
    .from("profiles")
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw mapError(error);
}
