import { NextResponse } from "next/server";
import { getCookieSupabase } from "@/lib/supabase/ssr-server";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// OAuth redirect target. Supabase appends `?code=...` on success; we
// exchange it for a session cookie, make sure a profiles row exists, and
// route the user to the right place.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorDescription = url.searchParams.get("error_description");
  const origin = url.origin;

  if (errorDescription) {
    console.error("[auth.callback] provider error", errorDescription);
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(errorDescription)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/signin`);
  }

  const supabase = getCookieSupabase();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    console.error("[auth.callback] exchange failed", error);
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(
        error?.message ?? "Sign-in failed",
      )}`,
    );
  }

  const user = data.user;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    null;
  const avatarUrl =
    typeof meta.avatar_url === "string" ? meta.avatar_url : null;

  // Use the service-role client so we can read + upsert the profile even
  // before RLS would pass. (The on_auth_user_created trigger should have
  // already created a row; this is defensive for cases where the trigger
  // didn't run, e.g. users created before the trigger existed.)
  const admin = getServerSupabase();
  const { data: existing } = await admin
    .from("profiles")
    .select("id, onboarding_completed, full_name, avatar_url, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    const { error: insertErr } = await admin.from("profiles").insert({
      id: user.id,
      email: user.email ?? null,
      full_name: fullName,
      avatar_url: avatarUrl,
      onboarding_completed: false,
    });
    if (insertErr) console.error("[auth.callback] profile insert failed", insertErr);
    return NextResponse.redirect(`${origin}/welcome`);
  }

  // Backfill any metadata the trigger didn't capture (name/avatar can
  // arrive later on subsequent sign-ins). Email/full_name only get
  // refreshed if they're currently null so we don't clobber manual edits.
  const patch: Record<string, unknown> = {};
  if (!existing.email && user.email) patch.email = user.email;
  if (!existing.full_name && fullName) patch.full_name = fullName;
  if (!existing.avatar_url && avatarUrl) patch.avatar_url = avatarUrl;
  if (Object.keys(patch).length > 0) {
    const { error: updErr } = await admin
      .from("profiles")
      .update(patch)
      .eq("id", user.id);
    if (updErr) console.error("[auth.callback] profile patch failed", updErr);
  }

  if (existing.onboarding_completed) {
    return NextResponse.redirect(`${origin}/archive`);
  }
  return NextResponse.redirect(`${origin}/welcome`);
}
