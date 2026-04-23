import { NextResponse } from "next/server";
import { getCookieSupabase } from "@/lib/supabase/ssr-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST-only signout. The client can either call this via fetch() or
// submit a <form method="post" action="/auth/signout">; both land on the
// same handler so server cookies get cleared reliably.
export async function POST(request: Request) {
  const supabase = getCookieSupabase();
  await supabase.auth.signOut();
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
