import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Cookie-auth Supabase client for server components, route handlers, and
// server actions. Reads the user's session from request cookies so RLS
// applies as that user. Use this for:
//   - reading/writing profiles + user-scoped rows where RLS should enforce
//   - calling supabase.auth.getUser() to identify the caller
//
// For admin operations that should bypass RLS, use getServerSupabase() from
// ./server.ts instead (service-role key).
export function getCookieSupabase(): SupabaseClient {
  const cookieStore = cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        // In server components we can't mutate cookies. The middleware
        // handles session refresh + cookie rotation; if we're called from
        // a server component the write is silently dropped, which is
        // exactly what @supabase/ssr expects.
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // server component context — no-op
        }
      },
    },
  });
}
