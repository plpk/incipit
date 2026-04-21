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
