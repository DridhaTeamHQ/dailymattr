import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "./config";

let browser: SupabaseClient | null = null;

/* The browser's client: keeps the reader's session, refreshes it and picks
 * up magic-link / OAuth returns from the URL. Created on first use, so a
 * server render never builds it. */
export function browserDb(): SupabaseClient {
  browser ??= createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return browser;
}
