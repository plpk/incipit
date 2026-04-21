import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Server-side client using the service role. Bypasses RLS; only import from
// server components, route handlers, and server actions.
//
// Next.js 14 patches global fetch with an aggressive cache. Supabase JS
// uses fetch internally, so without `cache: 'no-store'` a `select()` that
// returned `null` once (e.g. on the onboarding page render) gets memoised
// and every subsequent render sees the stale null even after we insert
// the profile. Force a no-store fetch on every call.
let cached: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
  if (cached) return cached;
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error(
      "Supabase server env not configured (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)",
    );
  }
  cached = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input as RequestInfo, { ...init, cache: "no-store" }),
    },
  });
  return cached;
}
