/* The News Studio Supabase project. Public values — the anon key is meant to
 * be public and RLS guards the data. Override per environment: the
 * NEXT_PUBLIC_ pair for the browser, NEWS_STUDIO_SUPABASE_* for the server. */
export const DEFAULT_SUPABASE_URL = "https://ygxdrphajvrbjcaxhvcn.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlneGRycGhhanZyYmpjYXhodmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDU0MjEsImV4cCI6MjA5NDkyMTQyMX0.odfY4E1DCxjb8kaXOkax4c_VI96QrzhoIW7cF6WMbes";

export const PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_NEWS_STUDIO_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_NEWS_STUDIO_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const SERVER_SUPABASE_URL = (process.env.NEWS_STUDIO_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/+$/, "");
export const SERVER_SUPABASE_ANON_KEY = process.env.NEWS_STUDIO_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
