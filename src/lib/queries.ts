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
  description: string | null;
  matched_by: string | null;
};

export async function getDocumentConnections(
  documentId: string,
): Promise<DocumentConnection[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("connections")
    .select(
      "id, target_document_id, connection_type, description, matched_by, target:target_document_id(id, title_subject, publication_name, original_filename)",
    )
    .eq("source_document_id", documentId)
    .limit(20);
  if (error) return [];
  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      target_document_id: string;
      connection_type?: string | null;
      description?: string | null;
      matched_by?: string | null;
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
    };
    const targetRaw = r.target;
    const target = Array.isArray(targetRaw) ? targetRaw[0] : targetRaw;
    return {
      id: r.id,
      target_document_id: r.target_document_id,
      target_title:
        target?.title_subject ??
        target?.publication_name ??
        target?.original_filename ??
        null,
      connection_type: r.connection_type ?? null,
      description: r.description ?? null,
      matched_by: r.matched_by ?? null,
    };
  });
}
