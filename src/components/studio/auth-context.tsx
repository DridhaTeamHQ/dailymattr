"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { browserDb } from "@/lib/studio/supabase";
import { siteUrl } from "@/lib/studio/site-origin";

type AuthValue = {
  session: Session | null;
  user: User | null;
  isAuthed: boolean;
  loading: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<unknown>;
  signOut: () => Promise<unknown>;
};

const AuthContext = createContext<AuthValue | null>(null);

/* The reader's Supabase session. Read in the browser only — the server
 * render is always signed out, and nothing it renders depends on it. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const db = browserDb();
    db.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = db.auth.onAuthStateChange((_event, s) => setSession(s ?? null));
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  /* Google OAuth. `redirectTo` is a full path ("/news-studio/…"), resolved
   * against the canonical origin so sign-in always lands on
   * www.dailymattr.com (not a preview domain), except in local dev. */
  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    const path = redirectTo && redirectTo.startsWith("/") ? redirectTo : window.location.pathname;
    return browserDb().auth.signInWithOAuth({ provider: "google", options: { redirectTo: siteUrl(path) } });
  }, []);

  const signOut = useCallback(() => browserDb().auth.signOut(), []);

  const value = useMemo<AuthValue>(
    () => ({ session, user: session?.user ?? null, isAuthed: Boolean(session?.user), loading, signInWithGoogle, signOut }),
    [session, loading, signInWithGoogle, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
