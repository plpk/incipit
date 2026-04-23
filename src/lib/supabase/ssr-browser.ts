"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client that syncs auth state to cookies so the server
// can read it. Use this from client components that need to call
// supabase.auth.signInWithOAuth / signOut / getUser.
let cached: SupabaseClient | null = null;

export function getAuthClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase auth env missing (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    );
  }
  cached = createBrowserClient(url, key);
  return cached;
}
