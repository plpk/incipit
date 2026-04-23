import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { assertServerEnv, env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    assertServerEnv();
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const supabase = getServerSupabase();
    const id = params.id;

    // Fetch scoped by user. If the doc doesn't belong to the caller, treat
    // as "not found" so we don't leak existence info.
    const { data: doc, error: fetchErr } = await supabase
      .from("documents")
      .select("id, file_path, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!doc) {
      return NextResponse.json({ ok: true, already_gone: true });
    }

    if (doc.file_path) {
      const { error: storageErr } = await supabase.storage
        .from(env.supabaseBucket)
        .remove([doc.file_path]);
      if (storageErr) {
        console.error("[documents.delete] storage remove failed", storageErr);
      }
    }

    const { error: delErr } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (delErr) throw delErr;

    // Decrement counter (clamped at zero).
    const { data: profile } = await supabase
      .from("profiles")
      .select("document_count")
      .eq("id", user.id)
      .maybeSingle();
    const next = Math.max(0, (profile?.document_count ?? 0) - 1);
    await supabase
      .from("profiles")
      .update({ document_count: next })
      .eq("id", user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[documents.delete] failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
