import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* support_requests (supabase/migrations/20260805000000_create_support_requests.sql) */
type SupportRequest = { name: string; email: string; topic: string; message: string };
type Database = {
  public: {
    Tables: {
      support_requests: {
        Row: SupportRequest & { id: string; created_at: string };
        Insert: SupportRequest;
        Update: Partial<SupportRequest>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

/* The one place that decides which Supabase project holds support_requests.
 * A URL is only ever paired with its own project's service-role key:
 *   SUPPORT_SUPABASE_SERVICE_ROLE_KEY set -> SUPPORT_SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
 *   otherwise                             -> the Pix project (PIX_SUPABASE_URL + its key)
 * Returns null when the chosen pair is incomplete. Server-only: it reads
 * secret keys, and is imported by the support server action alone. */
export function supportDb(): SupabaseClient<Database> | null {
  const [url, key] = process.env.SUPPORT_SUPABASE_SERVICE_ROLE_KEY
    ? [process.env.SUPPORT_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPPORT_SUPABASE_SERVICE_ROLE_KEY]
    : [process.env.PIX_SUPABASE_URL, process.env.PIX_SUPABASE_SERVICE_ROLE_KEY];
  if (!url || !key) return null;
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
