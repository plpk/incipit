import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { assertServerEnv } from "@/lib/env";
import {
  buildAnalysisInput,
  runAnalysis,
  type RawConnection,
} from "@/lib/connection-analysis";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(
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
    const documentId = params.id;

    const input = await buildAnalysisInput(supabase, documentId, user.id);
    if (!input) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // First upload for this user? Nothing to compare against — no-op.
    const { count: otherDocs } = await supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .neq("id", documentId);
    if (!otherDocs || otherDocs === 0) {
      return NextResponse.json({
        analysis: {
          connections: [],
          matched_notes: [],
          fits_research_profile: true,
          outside_research_explanation: null,
        },
        stored: { connections: 0, outside_research_updated: false },
      });
    }

    const result = await runAnalysis(input);

    const candidateIds = new Set(input.candidates.map((c) => c.id));
    const knownNoteIds = new Set(input.standingNotes.map((n) => n.id));
    const noteById = new Map(input.standingNotes.map((n) => [n.id, n]));
    const validConnections: RawConnection[] = [];
    for (const c of result.connections) {
      if (!candidateIds.has(c.target_document_id)) {
        console.log("[analyze-connections] dropping connection — target not in candidates", {
          target_document_id: c.target_document_id,
          matched_note_id: c.matched_note_id,
        });
        continue;
      }
      if (c.target_document_id === documentId) continue;
      const matched =
        c.matched_note_id && knownNoteIds.has(c.matched_note_id)
          ? c.matched_note_id
          : null;
      validConnections.push({ ...c, matched_note_id: matched });
    }

    const connectedNoteIds = new Set(
      validConnections.map((c) => c.matched_note_id).filter((v): v is string => !!v),
    );
    for (const m of result.matched_notes) {
      if (connectedNoteIds.has(m.note_id)) continue;
      const note = noteById.get(m.note_id);
      if (!note) continue;
      if (note.document_id === documentId) continue;
      validConnections.push({
        target_document_id: note.document_id,
        connection_type: "thematic",
        strength: "medium",
        description: m.relevance,
        linked_entities: [],
        matched_note_id: note.id,
      });
    }

    console.log("[analyze-connections] persisting", {
      user_id: user.id,
      document_id: documentId,
      valid_connection_count: validConnections.length,
      note_matched_count: validConnections.filter((c) => c.matched_note_id).length,
    });

    let storedConnections = 0;
    if (validConnections.length > 0) {
      const rows = validConnections.map((c) => ({
        user_id: user.id,
        source_document_id: documentId,
        target_document_id: c.target_document_id,
        connection_type: c.connection_type,
        strength: c.strength,
        description: c.description,
        linked_entities: c.linked_entities,
        matched_note_id: c.matched_note_id,
        matched_by: c.matched_note_id ? `note:${c.matched_note_id}` : null,
        ai_generated: true,
      }));
      const { error: insertErr, data: inserted } = await supabase
        .from("connections")
        .upsert(rows, {
          onConflict: "source_document_id,target_document_id,connection_type",
          ignoreDuplicates: false,
        })
        .select("id");
      if (insertErr) {
        console.error("[analyze-connections] insert failed", insertErr);
      } else {
        storedConnections = inserted?.length ?? rows.length;
      }
    }

    let outsideResearchUpdated = false;
    if (
      !result.fits_research_profile &&
      !input.doc.is_outside_research &&
      result.outside_research_explanation
    ) {
      const { error: updErr } = await supabase
        .from("documents")
        .update({
          is_outside_research: true,
          outside_research_reason: result.outside_research_explanation,
          side_collection_name:
            input.doc.side_collection_name ?? "Outside current research",
        })
        .eq("id", documentId)
        .eq("user_id", user.id);
      if (updErr) console.error("[analyze-connections] outside update failed", updErr);
      else outsideResearchUpdated = true;
    }

    return NextResponse.json({
      analysis: result,
      stored: {
        connections: storedConnections,
        outside_research_updated: outsideResearchUpdated,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[analyze-connections] failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
