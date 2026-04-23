import { getCookieSupabase } from "@/lib/supabase/ssr-server";

export type AuthUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

// Returns the currently-signed-in user, or null. Safe to call from server
// components, route handlers, and server actions.
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = getCookieSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const u = data.user;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  return {
    id: u.id,
    email: u.email ?? null,
    full_name:
      typeof meta.full_name === "string"
        ? meta.full_name
        : typeof meta.name === "string"
        ? meta.name
        : null,
    avatar_url: typeof meta.avatar_url === "string" ? meta.avatar_url : null,
  };
}

// Convenience: throws a redirectable error when called outside an authed
// context. Server components should prefer getAuthUser() + redirect() so
// they can route to /signin explicitly.
export async function requireAuthUserId(): Promise<string> {
  const user = await getAuthUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user.id;
}
