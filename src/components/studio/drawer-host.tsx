"use client";

import { useEffect } from "react";
import { LM_CATEGORIES } from "@/lib/studio/categories";
import { getMyPreferences } from "@/lib/studio/newsletter-prefs";
import { AuthDrawer } from "./auth-drawer";
import { useAuth } from "./auth-context";
import { useDrawer } from "./drawer-context";
import { SubscribeDrawer } from "./subscribe-drawer";

/* Renders the drawers once in the studio shell; pages just call the
 * context. Also restores the "subscribed" state from the signed-in reader's
 * real newsletter_subscriptions so it persists across visits. */
export function DrawerHost() {
  const { drawer, close, markSubscribed } = useDrawer();
  const { isAuthed } = useAuth();

  useEffect(() => {
    if (!isAuthed) return;
    getMyPreferences()
      .then(({ subscriptions }) => {
        const bySlug = (accSlug: string) => LM_CATEGORIES.filter((c) => c.account.slug === accSlug).map((c) => c.slug);
        const slugs = subscriptions.flatMap((s) => bySlug(s.category_slug));
        if (slugs.length) markSubscribed(slugs);
      })
      .catch(() => {});
  }, [isAuthed, markSubscribed]);

  return (
    <>
      <AuthDrawer open={drawer?.type === "auth"} onClose={close} />
      <SubscribeDrawer open={drawer?.type === "subscribe"} slugs={drawer?.type === "subscribe" ? drawer.slugs : []} onClose={close} />
    </>
  );
}
