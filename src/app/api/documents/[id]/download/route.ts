import { NextResponse } from "next/server";
import JSZip from "jszip";
import { getAuthUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { assertServerEnv, env } from "@/lib/env";
import { chicagoCitation } from "@/lib/citation";
import {
  getDocumentForUser,
  getDocumentEntitiesForUser,
  getDocumentConnectionsForUser,
} from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ship a single-document archive as a ZIP: the original scan renamed to
// the confirmed `generated_filename`, plus a `<stem>_metadata.json`
// sidecar with every field the historian might want offline — citation,
// provenance, entities, research notes, the full changelog, and any
// cross-document connections Incipit has surfaced. The scan itself is
// never modified (archival integrity).

function splitExt(filename: string): { stem: string; ext: string } {
  const idx = filename.lastIndexOf(".");
  if (idx <= 0) return { stem: filename, ext: "" };
  return { stem: filename.slice(0, idx), ext: filename.slice(idx) };
}

// RFC 5987-encoded filename for non-ASCII content-disposition safety.
function contentDispositionFor(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "'");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(
    filename,
  )}`;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    assertServerEnv();
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const id = params.id;
    const doc = await getDocumentForUser(user.id, id);
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!doc.file_path) {
      return NextResponse.json(
        { error: "This document has no stored file to download." },
        { status: 422 },
      );
    }

    const supabase = getServerSupabase();
    const { data: fileBlob, error: fileErr } = await supabase.storage
      .from(env.supabaseBucket)
      .download(doc.file_path);
    if (fileErr || !fileBlob) {
      console.error("[documents.download] storage download failed", fileErr);
      return NextResponse.json(
        { error: "Could not retrieve the original file." },
        { status: 500 },
      );
    }

    const [entities, connections, notesResp, changelogResp] = await Promise.all(
      [
        getDocumentEntitiesForUser(user.id, id),
        getDocumentConnectionsForUser(user.id, id),
        supabase
          .from("research_notes")
          .select("id, note_text, is_standing_query, created_at")
          .eq("document_id", id)
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("document_changelog")
          .select(
            "field_changed, old_value, new_value, change_source, changed_at",
          )
          .eq("document_id", id)
          .eq("user_id", user.id)
          .order("changed_at", { ascending: true }),
      ],
    );

    const notes = (notesResp.data ?? []).map((n) => ({
      id: n.id,
      text: n.note_text,
      is_standing_query: n.is_standing_query,
      created_at: n.created_at,
    }));
    const changelog = changelogResp.data ?? [];

    const groupedEntities = {
      people: entities
        .filter((e) => e.entity_type === "person")
        .map((e) => e.name),
      places: entities
        .filter((e) => e.entity_type === "place")
        .map((e) => e.name),
      organizations: entities
        .filter((e) => e.entity_type === "organization")
        .map((e) => e.name),
      other: entities
        .filter((e) => e.entity_type === "other")
        .map((e) => e.name),
    };

    const metadata = {
      id: doc.id,
      title: doc.title_subject,
      date: doc.publication_date,
      author: doc.author,
      publication_name: doc.publication_name,
      language: doc.language,
      entities: groupedEntities,
      full_extracted_text: doc.extracted_text,
      confidence_scores: doc.confidence_scores ?? {},
      trust_tier: doc.trust_tier,
      provenance: {
        archive_name: doc.archive_name,
        archive_location: doc.archive_location,
        acquisition_method: doc.acquisition_method,
        discovery_date: doc.discovery_date,
        catalog_reference: doc.catalog_reference,
      },
      original_filename: doc.original_filename,
      generated_filename: doc.generated_filename,
      is_outside_research: doc.is_outside_research,
      side_collection_name: doc.side_collection_name,
      outside_research_reason: doc.outside_research_reason,
      research_notes: notes,
      citation: chicagoCitation(doc),
      metadata_changelog: changelog,
      connections: connections.map((c) => ({
        target_document_id: c.target_document_id,
        target_title: c.target_title,
        connection_type: c.connection_type,
        strength: c.strength,
        description: c.description,
        linked_entities: c.linked_entities,
        matched_note_text: c.matched_note_text,
        matched_note_source_title: c.matched_note_source_title,
      })),
      exported_at: new Date().toISOString(),
    };

    const scanFilename = doc.generated_filename || doc.original_filename;
    const { stem } = splitExt(scanFilename);

    const zip = new JSZip();
    const fileBytes = new Uint8Array(await fileBlob.arrayBuffer());
    zip.file(scanFilename, fileBytes);
    zip.file(`${stem}_metadata.json`, JSON.stringify(metadata, null, 2));

    const zipBytes = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // JSZip returns a Uint8Array backed by an ArrayBufferLike; copy into a
    // fresh ArrayBuffer so the Blob constructor is happy under strict TS.
    const ab = new ArrayBuffer(zipBytes.byteLength);
    new Uint8Array(ab).set(zipBytes);
    const body = new Blob([ab], { type: "application/zip" });

    const downloadName = `${stem}.zip`;
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": contentDispositionFor(downloadName),
        "Content-Length": String(zipBytes.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[documents.download] failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
