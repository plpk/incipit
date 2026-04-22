import { NextResponse } from "next/server";
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
    const supabase = getServerSupabase();
    const documentId = params.id;

    const input = await buildAnalysisInput(supabase, documentId);
    if (!input) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // First upload? Nothing to compare against — no-op.
    const { count: otherDocs } = await supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
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

    // Persist connections.
    const candidateIds = new Set(input.candidates.map((c) => c.id));
    const knownNoteIds = new Set(input.standingNotes.map((n) => n.id));
    const validConnections: RawConnection[] = [];
    for (const c of result.connections) {
      if (!candidateIds.has(c.target_document_id)) continue;
      if (c.target_document_id === documentId) continue;
      const matched =
        c.matched_note_id && knownNoteIds.has(c.matched_note_id)
          ? c.matched_note_id
          : null;
      validConnections.push({ ...c, matched_note_id: matched });
    }

    let storedConnections = 0;
    if (validConnections.length > 0) {
      const rows = validConnections.map((c) => ({
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

    // Persist outside-research flag if Opus flagged it AND the historian
    // didn't already tag it outside themselves.
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
        .eq("id", documentId);
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
