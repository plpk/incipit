import { NextResponse } from "next/server";
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
    const supabase = getServerSupabase();
    const id = params.id;

    // Load the row so we know which storage object to remove. If the doc is
    // already gone, treat the request as a no-op (idempotent delete).
    const { data: doc, error: fetchErr } = await supabase
      .from("documents")
      .select("id, file_path")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!doc) {
      return NextResponse.json({ ok: true, already_gone: true });
    }

    if (doc.file_path) {
      const { error: storageErr } = await supabase.storage
        .from(env.supabaseBucket)
        .remove([doc.file_path]);
      // Don't fail the whole delete if the object is missing — log and proceed
      // so the DB row still gets removed.
      if (storageErr) {
        console.error("[documents.delete] storage remove failed", storageErr);
      }
    }

    // document_changelog, document_entities, and connections cascade on
    // documents.id. research_notes.document_id is SET NULL so standing notes
    // survive, which is deliberate.
    const { error: delErr } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);
    if (delErr) throw delErr;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[documents.delete] failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
