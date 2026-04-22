import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser client keyed with the anon JWT — used only for
// `uploadToSignedUrl`, where the auth is the short-lived token minted
// by the server. Never import this from server code.
let cached: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase browser env not configured (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
