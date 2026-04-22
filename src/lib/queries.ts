import { getServerSupabase } from "@/lib/supabase/server";
import type { DocumentRow, ResearchProfile } from "@/lib/types";

// Returns the most recently updated research profile, if any. v1 is
// single-user; the concept of "current" profile is just whichever exists.
export async function getCurrentProfile(): Promise<ResearchProfile | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("research_profiles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as ResearchProfile | null) ?? null;
}

export async function listDocuments(limit = 50): Promise<DocumentRow[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as DocumentRow[];
}

export async function getDocument(id: string): Promise<DocumentRow | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as DocumentRow | null) ?? null;
}

export type DocumentEntity = {
  id: string;
  name: string;
  entity_type: "person" | "place" | "organization" | "other";
  confidence: string | null;
  context_snippet: string | null;
};

export async function getDocumentEntities(
  documentId: string,
): Promise<DocumentEntity[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("document_entities")
    .select("confidence, context_snippet, entities(id, name, entity_type)")
    .eq("document_id", documentId);
  if (error) return [];
  return (data ?? [])
    .map((row) => {
      const r = row as unknown as {
        confidence?: string | null;
        context_snippet?: string | null;
        entities?:
          | { id: string; name: string; entity_type: string }
          | Array<{ id: string; name: string; entity_type: string }>
          | null;
      };
      const entRaw = r.entities;
      const ent = Array.isArray(entRaw) ? entRaw[0] : entRaw;
      if (!ent) return null;
      return {
        id: ent.id,
        name: ent.name,
        entity_type:
          (ent.entity_type as DocumentEntity["entity_type"]) ?? "other",
        confidence: r.confidence ?? null,
        context_snippet: r.context_snippet ?? null,
      };
    })
    .filter((x): x is DocumentEntity => x !== null);
}

export type DocumentConnection = {
  id: string;
  target_document_id: string;
  target_title: string | null;
  connection_type: string | null;
  strength: "strong" | "medium" | null;
  description: string | null;
  linked_entities: string[];
  matched_note_id: string | null;
  matched_note_text: string | null;
  matched_note_source_title: string | null;
};

export async function getDocumentConnections(
  documentId: string,
): Promise<DocumentConnection[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("connections")
    .select(
      "id, source_document_id, target_document_id, connection_type, strength, description, linked_entities, matched_note_id, target:target_document_id(id, title_subject, publication_name, original_filename), source:source_document_id(id, title_subject, publication_name, original_filename), note:matched_note_id(id, note_text, documents:document_id(title_subject, publication_name, original_filename))",
    )
    .or(`source_document_id.eq.${documentId},target_document_id.eq.${documentId}`)
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) return [];
  const dedup = new Map<string, DocumentConnection>();
  for (const row of data ?? []) {
    const r = row as unknown as {
      id: string;
      source_document_id: string;
      target_document_id: string;
      connection_type?: string | null;
      strength?: string | null;
      description?: string | null;
      linked_entities?: unknown;
      matched_note_id?: string | null;
      target?:
        | {
            title_subject?: string | null;
            publication_name?: string | null;
            original_filename?: string | null;
          }
        | Array<{
            title_subject?: string | null;
            publication_name?: string | null;
            original_filename?: string | null;
          }>
        | null;
      source?:
        | {
            title_subject?: string | null;
            publication_name?: string | null;
            original_filename?: string | null;
          }
        | Array<{
            title_subject?: string | null;
            publication_name?: string | null;
            original_filename?: string | null;
          }>
        | null;
      note?:
        | {
            id: string;
            note_text: string;
            documents?:
              | {
                  title_subject?: string | null;
                  publication_name?: string | null;
                  original_filename?: string | null;
                }
              | Array<{
                  title_subject?: string | null;
                  publication_name?: string | null;
                  original_filename?: string | null;
                }>
              | null;
          }
        | Array<{
            id: string;
            note_text: string;
            documents?:
              | {
                  title_subject?: string | null;
                  publication_name?: string | null;
                  original_filename?: string | null;
                }
              | Array<{
                  title_subject?: string | null;
                  publication_name?: string | null;
                  original_filename?: string | null;
                }>
              | null;
          }>
        | null;
    };
    // Always display the "other" document relative to the one we're viewing.
    const outboundTarget =
      r.source_document_id === documentId ? r.target : r.source;
    const otherId =
      r.source_document_id === documentId
        ? r.target_document_id
        : r.source_document_id;
    const targetRaw = outboundTarget;
    const target = Array.isArray(targetRaw) ? targetRaw[0] : targetRaw;
    const noteRaw = r.note;
    const note = Array.isArray(noteRaw) ? noteRaw[0] : noteRaw;
    const noteDocsRaw = note?.documents;
    const noteDoc = Array.isArray(noteDocsRaw) ? noteDocsRaw[0] : noteDocsRaw;
    const linked =
      Array.isArray(r.linked_entities) &&
      r.linked_entities.every((v) => typeof v === "string")
        ? (r.linked_entities as string[])
        : [];
    const entry: DocumentConnection = {
      id: r.id,
      target_document_id: otherId,
      target_title:
        target?.title_subject ??
        target?.publication_name ??
        target?.original_filename ??
        null,
      connection_type: r.connection_type ?? null,
      strength:
        r.strength === "strong" || r.strength === "medium" ? r.strength : null,
      description: r.description ?? null,
      linked_entities: linked,
      matched_note_id: r.matched_note_id ?? null,
      matched_note_text: note?.note_text ?? null,
      matched_note_source_title:
        noteDoc?.title_subject ??
        noteDoc?.publication_name ??
        noteDoc?.original_filename ??
        null,
    };
    // Deduplicate symmetric pairs — viewing from either side shows one card.
    const key = [
      documentId,
      entry.target_document_id,
      entry.connection_type ?? "",
    ]
      .sort()
      .join("|");
    if (!dedup.has(key)) dedup.set(key, entry);
  }
  return Array.from(dedup.values());
}
